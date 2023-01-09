import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { chatRoomStatus } from 'src/user/enum/status.enum';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { AdminUser } from './entity/AdminUser.entity';
import { BannedUser } from './entity/BannedUser.entity';
import { ChatRoom } from './entity/chatRoom.entity';
import { ChatRoomDm } from './entity/chatRoomDm.entity';
import { JoinedUser } from './entity/JoinedUser.entity';
import { MutedUser } from './entity/MutedUser.entity';
import * as bcrypt from 'bcryptjs';
import { JoinedDmUser } from './entity/JoinedDmUser.entity';
import {
  ChatDmLogDto,
  ChatLogDto,
  ChatRoomDto,
  ChatRoomJoinDto,
  UpdatePwdDto,
} from './dto/chat.dto';
import { ChatLog } from './entity/chatLog.entity';
import { ChatDmLog } from './entity/chatDmLog.entity';
import { WsException } from '@nestjs/websockets';

const temporary = 30 * 60 * 10;

@Injectable()
export class ChatService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatRoomDm)
    private readonly chatRoomDmRepository: Repository<ChatRoomDm>,
    @InjectRepository(BannedUser)
    private readonly bannedUserRepository: Repository<BannedUser>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    @InjectRepository(JoinedUser)
    private readonly joinedUserRepository: Repository<JoinedUser>,
    @InjectRepository(MutedUser)
    private readonly mutedUserRepository: Repository<MutedUser>,
    @InjectRepository(JoinedDmUser)
    private readonly joinedDmUserRepository: Repository<JoinedDmUser>,
    @InjectRepository(ChatLog)
    private readonly chatLogRepository: Repository<ChatLog>,
    @InjectRepository(ChatDmLog)
    private readonly chatDmLogRepository: Repository<ChatDmLog>,
  ) {}

  // /*----------------------------------
  // |					createChatRoom					 |
  // |					createChatRoomDm					 |
  // ----------------------------------*/

  async createChatRoom(
    userId: number,
    chatRoom: ChatRoomDto,
  ): Promise<ChatRoom> {
    try {
      const user = await this.userService.findUserById(userId);

      let hashedPwd = null;
      if (chatRoom.status === chatRoomStatus.PROTECTED) {
        {
          if (!chatRoom.password)
            throw new WsException('비밀번호 입력해주세요');
        }
        hashedPwd = await bcrypt.hashSync(chatRoom.password, 10);
      }
      const isChatRoom = await this.chatRoomRepository.findOne({
        where: { name: chatRoom.name },
      });
      if (isChatRoom) throw new WsException('이미 사용중인 방 이름 입니다.');

      const createChatRoom = await this.chatRoomRepository.create({
        name: chatRoom.name,
        status: chatRoom.status,
        password: hashedPwd,
        owner: user,
        adminUser: [],
        joinedUser: [],
        mutedUser: [],
        bannedUser: [],
      });
      await this.chatRoomRepository.save(createChatRoom);

      const newChatRoom = await this.findChatRoomByName(chatRoom.name);
      await this.joinedUserRepository.create({
        user: user,
        chatRoom: newChatRoom,
      });
      await this.joinedUserRepository.save({
        user: user,
        chatRoom: newChatRoom,
      });
      await this.adminUserRepository.create({
        user: user,
        chatRoom: newChatRoom,
      });
      await this.adminUserRepository.save({
        user: user,
        chatRoom: newChatRoom,
      });

      delete createChatRoom.password;
      return createChatRoom;
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async createChatRoomDm(
    userId: number,
    targetId: number,
  ): Promise<ChatRoomDm> {
    try {
      if (userId == targetId)
        throw new WsException('나 자신과는 대화할 수 없습니다.');

      const user = await this.userService.findUserById(userId);
      const target = await this.userService.findUserById(targetId);

      const chatRoomName = String(Math.floor(Math.random() * 1e9));

      const isName = await this.chatRoomDmRepository.findOne({
        where: { name: chatRoomName },
      });
      if (isName) throw new WsException('이미 사용중인 방 이름 입니다.');

      const chatRoomDm = await this.chatRoomDmRepository.create({
        name: chatRoomName,
        owner: user,
        status: chatRoomStatus.PROTECTED,
        joinedDmUser: [],
      });
      await this.chatRoomDmRepository.save(chatRoomDm);

      const newChatRoomDm = await this.findChatRoomDmByName(chatRoomDm.name);
      await this.joinedDmUserRepository.create({
        user: user,
        chatRoomDm: newChatRoomDm,
      });
      await this.joinedDmUserRepository.save({
        user: user,
        chatRoomDm: newChatRoomDm,
      });
      await this.joinedDmUserRepository.create({
        user: target,
        chatRoomDm: newChatRoomDm,
      });
      await this.joinedDmUserRepository.save({
        user: target,
        chatRoomDm: newChatRoomDm,
      });

      return chatRoomDm;
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  // /*----------------------------------
  // |					udpatePwd					 |
  // |					checkPwd					 |
  // ----------------------------------*/

  async updatePwd(userId: number, body: UpdatePwdDto): Promise<void> {
    try {
      const user = await this.userService.findUserById(userId);
      const chatRoom = await this.findChatRoomById(body.chatRoomId, ['owner']);

      if (chatRoom.status == chatRoomStatus.PUBLIC)
        throw new WsException('이 방은 PUBLIC 입니다.');
      if (chatRoom.owner.id != user.id)
        throw new WsException('방 주인만 방 비밀번호 수정 가능합니다.');
      if (!body.newPwd) throw new WsException('새 비밀번호를 입력해주세요.');

      const isCorrectPwd = await this.checkPwd(chatRoom.id, body.oldPwd);
      if (!isCorrectPwd)
        throw new WsException(
          '입력하신 이전 비밀번호가 현재 방 비밀번호와 일치하지 않습니다.',
        );

      const password = await bcrypt.hash(body.newPwd, 10);
      await this.chatRoomRepository.update(chatRoom.id, { password });
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async checkPwd(id: number, password: string): Promise<boolean> {
    try {
      const chatRoom = await this.findChatRoomById(id, [], true);

      return await bcrypt.compare(password, chatRoom.password);
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  // /*----------------------------------
  // |				findChatRoomById 					|
  // |				findChatRoomAll 					|
  // |				findChatRoomByUserId			|
  // |				findChatRoomByName			|
  // ----------------------------------*/

  async findChatRoomAll(): Promise<ChatRoom[]> {
    try {
      const chatRooms = await this.chatRoomRepository.find({
        select: {
          id: true,
          name: true,
          status: true,
        },
        relations: ['owner'],
      });

      for (const chatRoom of chatRooms) {
        if (chatRoom.owner.token) delete chatRoom.owner.token;
      }

      return chatRooms;
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async findChatRoomById(
    chatRoomId: number,
    relations = [] as string[],
    printPWd?: boolean,
  ): Promise<ChatRoom> {
    try {
      const chatRoom = await this.chatRoomRepository.findOne({
        select: {
          id: true,
          name: true,
          status: true,
          password: true,
        },
        where: { id: chatRoomId },
        relations,
      });

      if (!printPWd) delete chatRoom.password;
      if (chatRoom.owner) delete chatRoom.owner.token;
      if (chatRoom.adminUser) {
        for (const adminUser of chatRoom.adminUser) delete adminUser.user.token;
      }
      if (chatRoom.bannedUser) {
        for (const bannedUser of chatRoom.bannedUser)
          delete bannedUser.user.token;
      }
      if (chatRoom.mutedUser) {
        for (const mutedUser of chatRoom.mutedUser) delete mutedUser.user.token;
      }
      if (chatRoom.joinedUser) {
        for (const joinedUser of chatRoom.joinedUser)
          delete joinedUser.user.token;
      }
      if (chatRoom.chatLog) {
        for (const chatLog of chatRoom.chatLog) {
          delete chatLog.user.token;
        }
      }
      return chatRoom;
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async findChatRoomByName(
    chatRoomName: string,
    relations = [] as string[],
    printPWd?: boolean,
  ): Promise<ChatRoom> {
    try {
      const chatRoom = await this.chatRoomRepository.findOne({
        select: {
          id: true,
          name: true,
          status: true,
          password: true,
        },
        where: { name: chatRoomName },
        relations,
      });

      if (!printPWd) delete chatRoom.password;
      if (chatRoom.owner) delete chatRoom.owner.token;
      if (chatRoom.adminUser) {
        for (const adminUser of chatRoom.adminUser) delete adminUser.user.token;
      }
      if (chatRoom.bannedUser) {
        for (const bannedUser of chatRoom.bannedUser)
          delete bannedUser.user.token;
      }
      if (chatRoom.mutedUser) {
        for (const mutedUser of chatRoom.mutedUser) delete mutedUser.user.token;
      }
      if (chatRoom.joinedUser) {
        for (const joinedUser of chatRoom.joinedUser)
          delete joinedUser.user.token;
      }
      if (chatRoom.chatLog) {
        for (const chatLog of chatRoom.chatLog) {
          delete chatLog.user.token;
        }
      }
      return chatRoom;
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async findChatRoomByUserId(
    userId: number,
    relations = [] as string[],
  ): Promise<ChatRoom[]> {
    try {
      const user = await this.userService.findUserById(userId);

      const chatRoom = await this.chatRoomRepository.find({
        select: {
          id: true,
          name: true,
        },
        where: { joinedUser: { user: user } },
        relations,
      });

      for (const room of chatRoom) {
        if (room.password) delete room.password;
        if (room.owner) delete room.owner.token;
        if (room.adminUser) {
          for (const adminUser of room.adminUser) delete adminUser.user.token;
        }
        if (room.bannedUser) {
          for (const bannedUser of room.bannedUser)
            delete bannedUser.user.token;
        }
        if (room.mutedUser) {
          for (const mutedUser of room.mutedUser) delete mutedUser.user.token;
        }
        if (room.joinedUser) {
          for (const joinedUser of room.joinedUser)
            delete joinedUser.user.token;
        }
      }

      return chatRoom;
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  // /*----------------------------------
  // |				findChatRoomDmById 					|
  // |				findChatRoomDmAll 					|
  // |				findChatRoomDmByUserId			|
  // ----------------------------------*/

  async findChatRoomDmById(
    chatRoomId: number,
    relations = [] as string[],
  ): Promise<ChatRoomDm> {
    try {
      const chatRoom = await this.chatRoomDmRepository
        .findOne({
          where: { id: chatRoomId },
          relations,
        })
        .catch(() => null);

      if (!chatRoom) throw new WsException('해당 채팅룸은 존재하지 않습니다.');
      if (chatRoom.owner) delete chatRoom.owner.token;
      if (chatRoom.joinedDmUser) {
        for (const joinedDmUser of chatRoom.joinedDmUser)
          delete joinedDmUser.user.token;
      }
      if (chatRoom.chatDmLog) {
        for (const chatDmLog of chatRoom.chatDmLog) {
          delete chatDmLog.user.token;
        }
      }
      return chatRoom;
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async findChatRoomDmByUserId(
    userId: number,
    relations = [] as string[],
  ): Promise<ChatRoomDm[]> {
    try {
      const user = await this.userService.findUserById(userId);

      const chatRoomDm = await this.chatRoomDmRepository.find({
        select: {
          id: true,
          name: true,
        },
        where: { joinedDmUser: { user: user } },
        relations,
      });

      for (const roomDm of chatRoomDm) {
        if (roomDm.joinedDmUser) {
          for (const joinedDmRoom of roomDm.joinedDmUser)
            delete joinedDmRoom.user.token;
        }
        if (roomDm.owner) {
          delete roomDm.owner.token;
        }
      }
      return chatRoomDm;
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async findChatRoomDmByName(
    chatRoomName: string,
    relations = [] as string[],
  ): Promise<ChatRoomDm> {
    try {
      const chatRoom = await this.chatRoomDmRepository.findOne({
        where: { name: chatRoomName },
        relations,
      });

      return chatRoom;
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  // // /*----------------------------------
  // // |				addAdminUser			|
  // // |				removeAdminUser			|
  // // ----------------------------------*/

  async addAdminUser(
    myId: number,
    targetUserId: number,
    chatRoomId: number,
  ): Promise<void> {
    try {
      const me = await this.userService.findUserById(myId);
      const targetUser = await this.userService.findUserById(targetUserId);
      const chatRoom = await this.findChatRoomById(chatRoomId, [
        'joinedUser',
        'adminUser',
        'owner',
      ]);

      if (chatRoom.owner.id != me.id)
        throw new WsException(
          '방 주인만 다른 유저를 admin으로 지정할 수 있습니다.',
        );

      if (targetUser.id == chatRoom.owner.id)
        throw new WsException('방 주인은 이미 admin 입니다.');

      if (!chatRoom.joinedUser.find((user1) => user1.user.id == targetUser.id))
        throw new WsException('타겟유저는 이 방에 없습니다.');

      if (chatRoom.adminUser.find((admin) => admin.user.id == targetUser.id))
        throw new WsException('타겟유저는 이미 admin입니다.');

      if (!chatRoom.adminUser.find((admin) => admin.user.id == targetUser.id)) {
        this.adminUserRepository.create({
          user: targetUser,
          chatRoom: chatRoom,
        });
        await this.adminUserRepository.save({
          user: targetUser,
          chatRoom: chatRoom,
        });
      }
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async removeAdminUser(
    myId: number,
    targetUserId: number,
    chatRoomId: number,
  ): Promise<void> {
    try {
      const me = await this.userService.findUserById(myId);
      const targetUser = await this.userService.findUserById(targetUserId);
      const chatRoom = await this.findChatRoomById(chatRoomId, [
        'joinedUser',
        'adminUser',
        'owner',
      ]);

      if (chatRoom.owner.id != me.id)
        throw new WsException(
          '방 주인만 다른 유저를 admin으로 지정할 수 있습니다.',
        );

      if (targetUser.id == chatRoom.owner.id)
        throw new WsException('방주인을 admin 지정취소 할 수 없습니다.');

      if (!chatRoom.joinedUser.find((user1) => user1.user.id == targetUser.id))
        throw new WsException('타겟유저는 이 방에 없습니다.');

      if (!chatRoom.adminUser.find((admin) => admin.user.id == targetUser.id)) {
        throw new WsException('타겟유저는 어드민이 아닙니다.');
      }

      if (chatRoom.adminUser.find((admin) => admin.user.id == targetUser.id)) {
        this.directRemoveAdminUser(targetUser.id, chatRoom.id);
      }
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async directRemoveAdminUser(targetUserId: number, chatRoomId: number) {
    try {
      this.adminUserRepository
        .createQueryBuilder('adminuser')
        .delete()
        .from(AdminUser)
        .where('user = :user', { user: targetUserId })
        .andWhere('chatRoom = :chatRoom', { chatRoom: chatRoomId })
        .execute();
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  /* --------------------------
|				addMuteUser			|
|				removeMuteUser			|
---------------------------*/

  async addMuteUser(
    targetUserId: number,
    chatRoomId: number,
    myId: number,
  ): Promise<void> {
    try {
      const targetUser = await this.userService.findUserById(targetUserId);
      const me = await this.userService.findUserById(myId);
      const chatRoom = await this.findChatRoomById(chatRoomId, [
        'joinedUser',
        'mutedUser',
        'adminUser',
        'owner',
      ]);

      if (chatRoom.owner.id == targetUser.id)
        throw new WsException('방 주인은 타겟유저로 만들 수 없습니다.');

      if (!chatRoom.joinedUser.find((user1) => user1.user.id == targetUser.id))
        throw new WsException('타겟유저는 이 방에 없습니다.');

      if (chatRoom.adminUser.find((admin) => admin.user.id == targetUserId))
        throw new WsException('타겟유저는 admin 입니다.');

      if (!chatRoom.adminUser.find((admin) => admin.user.id == me.id))
        throw new WsException('당신은 admin이 아닙니다.');

      const isMutedUser = await this.mutedUserRepository
        .findOne({ where: { user: targetUser } })
        .catch(() => null);

      if (!isMutedUser) {
        const time = new Date(Date.now() + temporary);
        const muted = this.mutedUserRepository.create({
          user: targetUser,
          endTime: time,
          chatRoom: chatRoom,
        });
        await this.mutedUserRepository.save(muted);
      } else {
        if (
          chatRoom.mutedUser.find((user1) => user1.user.id == targetUser.id)
        ) {
          throw new WsException('유저는 이미 mute 상태 입니다');
        }
      }
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async removeMuteUser(
    targetUserId: number,
    chatRoomId: number,
    myId: number,
  ): Promise<void> {
    try {
      const targetUser = await this.userService.findUserById(targetUserId);
      const me = await this.userService.findUserById(myId);
      const chatRoom = await this.findChatRoomById(chatRoomId, [
        'joinedUser',
        'mutedUser',
        'adminUser',
        'owner',
      ]);

      if (chatRoom.owner.id == targetUser.id)
        throw new WsException('방 주인은 타겟유저로 만들 수 없습니다.');

      if (!chatRoom.joinedUser.find((user1) => user1.user.id == targetUser.id))
        throw new WsException('타겟유저는 이 방에 없습니다.');

      if (!chatRoom.adminUser.find((admin) => admin.user.id == me.id))
        throw new WsException('당신은 admin이 아닙니다.');

      if (!chatRoom.mutedUser.find((muted) => muted.user.id == targetUser.id)) {
        throw new WsException('타겟유저는 mute상태가 아닙니다.');
      }

      const isMutedUser = await this.mutedUserRepository
        .findOne({ where: { user: targetUser } })
        .catch(() => null);
      if (isMutedUser) {
        this.directRemoveMuteUser(targetUserId, chatRoomId);
      }
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async directRemoveMuteUser(targetUserId: number, chatRoomId: number) {
    try {
      const targetUser = await this.userService.findUserById(targetUserId);
      this.mutedUserRepository
        .createQueryBuilder('muteduser')
        .delete()
        .from(MutedUser)
        .where('user = :user', { user: targetUser.id })
        .andWhere('chatRoom =:chatRoom', { chatRoom: chatRoomId })
        .execute();
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  /*----------------------------------
	|				addBannedUser			|
	|				removeBannedUser			|
	----------------------------------*/

  async addBannedUser(
    targetUserId: number,
    chatRoomId: number,
    myId: number,
  ): Promise<void> {
    try {
      const targetUser = await this.userService.findUserById(targetUserId);
      const me = await this.userService.findUserById(myId);
      const findChatRoom = await this.findChatRoomById(chatRoomId, [
        'joinedUser',
        'bannedUser',
        'adminUser',
        'owner',
      ]);

      if (findChatRoom.owner.id == targetUser.id)
        throw new WsException('방 주인은 타겟유저로 만들 수 없습니다.');

      if (
        !findChatRoom.joinedUser.find((user1) => user1.user.id == targetUser.id)
      )
        throw new WsException('타겟유저는 이 방에 없습니다.');

      if (findChatRoom.adminUser.find((admin) => admin.user.id == targetUserId))
        throw new WsException('타겟유저는 admin 입니다.');
      if (!findChatRoom.adminUser.find((admin) => admin.user.id == me.id))
        throw new WsException('당신은 admin이 아닙니다.');

      const isBannedUser = await this.bannedUserRepository
        .findOne({ where: { user: targetUser } })
        .catch(() => null);

      if (!isBannedUser) {
        const time = new Date(Date.now() + temporary);
        const banned = this.bannedUserRepository.create({
          user: targetUser,
          endTime: time,
          chatRoom: findChatRoom,
        });

        await this.bannedUserRepository.save(banned);

        for (const joinedUser of findChatRoom.joinedUser)
          if (joinedUser.user.id == targetUser.id) {
            await this.removeJoinedUser(targetUser.id, chatRoomId);
            break;
          }
      } else {
        if (
          findChatRoom.bannedUser.find(
            (user1) => user1.user.id == targetUser.id,
          )
        ) {
          throw new WsException('타겟유저는 이미 ban상태 입니다.');
        }
      }
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async removeBannedUser(
    targetUserId: number,
    chatRoomId: number,
    myId: number,
  ): Promise<void> {
    try {
      const targetUser = await this.userService.findUserById(targetUserId);
      const me = await this.userService.findUserById(myId);
      const findChatRoom = await this.findChatRoomById(chatRoomId, [
        'joinedUser',
        'bannedUser',
        'adminUser',
        'owner',
      ]);

      if (findChatRoom.owner.id == targetUser.id)
        throw new WsException('방 주인은 타겟유저로 만들 수 없습니다.');

      if (!findChatRoom.adminUser.find((admin) => admin.user.id == me.id))
        throw new WsException('당신은 admin이 아닙니다.');

      const isBannedUser = await this.bannedUserRepository.findOne({
        where: { user: targetUser },
      });

      if (isBannedUser) {
        this.directRemoveBannedUser(targetUserId, chatRoomId);
      } else {
        throw new WsException('타겟유저는 ban상태가 아닙니다.');
      }
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async directRemoveBannedUser(targetUserId: number, chatRoomId: number) {
    try {
      const targetUser = await this.userService.findUserById(targetUserId);
      this.bannedUserRepository
        .createQueryBuilder('bannedUser')
        .delete()
        .from(BannedUser)
        .where('user = :user', { user: targetUser.id })
        .andWhere('chatRoom =:chatRoom', { chatRoom: chatRoomId })
        .execute();
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  // // /*----------------------------------
  // // |			canUserEnterChatRoom				|
  // // ----------------------------------*/

  async canUserEnterChatRoom(
    chatRoom: ChatRoomJoinDto,
    userId: number,
  ): Promise<void> {
    try {
      const user = await this.userService.findUserById(userId);
      const findChatRoom = await this.findChatRoomById(
        chatRoom.chatRoomId,
        ['joinedUser', 'bannedUser'],
        true,
      );
      if (findChatRoom.status === chatRoomStatus.PROTECTED) {
        let valide = false;
        if (findChatRoom.password)
          valide = await bcrypt.compareSync(
            chatRoom.password,
            findChatRoom.password,
          );

        if (!valide) throw new WsException('입력된 비밀번호는 잘못되었습니다.');
      }

      for (const banned of findChatRoom.bannedUser)
        if (banned.user.id == user.id) {
          const time = new Date();
          if (banned.endTime > time)
            throw new WsException('유저는 방에서 밴당했습니다.');
          else
            await this.directRemoveBannedUser(banned.user.id, findChatRoom.id);
        }

      if (findChatRoom.joinedUser.find((user1) => user1.user.id == user.id))
        throw new WsException('유저는 이미 방에 있습니다.');

      await this.joinedUserRepository.create({
        user: user,
        chatRoom: findChatRoom,
      });
      await this.joinedUserRepository.save({
        user: user,
        chatRoom: findChatRoom,
      });
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  //owner가 지한테 쓰면 방삭제, 남한테쓰면 강퇴.
  // // /*----------------------------------
  // // |		leaveChatRoom				|
  // // |		removeJoinedUser ""				|
  // // |   removeChatRoom           |
  // // ----------------------------------*/

  async leaveChatRoom(
    targetUserId: number,
    chatRoomId: number,
    offerUserId: number,
  ): Promise<void> {
    try {
      const targetUser = await this.userService.findUserById(targetUserId);
      const chatRoom = await this.findChatRoomById(chatRoomId, [
        'adminUser',
        'joinedUser',
        'owner',
      ]);
      const offerUser = await this.userService.findUserById(offerUserId);

      if (!chatRoom.joinedUser.find((user1) => user1.user.id == targetUserId))
        throw new WsException('타겟유저는 방에 없습니다.');

      if (offerUserId) {
        if (!chatRoom.joinedUser.find((user1) => user1.user.id == offerUserId))
          throw new WsException('요청유저는 방에 없습니다.');
      }

      if (offerUserId && offerUserId != targetUser.id) {
        const isAdminOfferUser = await this.adminUserRepository
          .findOne({ where: { chatRoom: chatRoom, user: offerUser } })
          .catch(() => null);

        if (!isAdminOfferUser)
          throw new WsException('요청유저는 admin이 아닙니다.');

        const isAdmintargetUser = await this.adminUserRepository.findOne({
          where: { chatRoom: chatRoom, user: targetUser },
        });

        if (isAdmintargetUser)
          throw new WsException('타겟유저는 admin 입니다.');

        if (targetUser.id == chatRoom.owner.id) {
          throw new WsException('방 주인을 쫓아낼 수는 없습니다.');
        }

        for (const joinedUser of chatRoom.joinedUser)
          if (joinedUser.user.id == targetUser.id) {
            await this.removeJoinedUser(targetUser.id, chatRoomId);
            break;
          }
      } else if (
        offerUserId &&
        offerUserId === targetUser.id &&
        offerUserId !== chatRoom.owner.id
      ) {
        if (chatRoom.adminUser.find((admin) => admin.user.id == offerUserId))
          await this.directRemoveAdminUser(offerUserId, chatRoom.id);
        return await this.removeJoinedUser(targetUser.id, chatRoomId);
      } else if (
        offerUserId &&
        offerUserId === targetUser.id &&
        offerUserId === chatRoom.owner.id
      ) {
        return await this.removeChatRoom(chatRoom.id);
      }
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async removeJoinedUser(
    targetUserId: number,
    chatRoomId: number,
  ): Promise<void> {
    try {
      const user = await this.userService.findUserById(targetUserId);

      this.joinedUserRepository
        .createQueryBuilder('joineduser')
        .delete()
        .from(JoinedUser)
        .where('user = :user', { user: user.id })
        .andWhere('chatRoom =:chatRoom', { chatRoom: chatRoomId })
        .execute();
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async removeChatRoom(chatRoomId: number): Promise<void> {
    try {
      const chatRoom = await this.findChatRoomById(chatRoomId, [
        'mutedUser',
        'bannedUser',
        'joinedUser',
        'adminUser',
        'owner',
      ]);

      await this.mutedUserRepository.remove(chatRoom.mutedUser);
      await this.bannedUserRepository.remove(chatRoom.bannedUser);
      await this.joinedUserRepository.remove(chatRoom.joinedUser);
      await this.chatRoomRepository.remove(chatRoom);
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  // // /*----------------------------------
  // // |		leaveChatRoomDm				|
  // // |		removeJoinedDmUser ""				|
  // // |   removeChatRoomDm           |
  // // ----------------------------------*/

  async leaveChatRoomDm(
    targetUserId: number,
    chatRoomId: number,
    offerUserId?: number,
  ): Promise<void> {
    try {
      const targetUser = await this.userService.findUserById(targetUserId);
      const chatRoomDm = await this.findChatRoomDmById(chatRoomId, [
        'joinedDmUser',
        'owner',
      ]);
      const offerUser = await this.userService.findUserById(offerUserId);

      if (offerUser.id && offerUser.id != targetUser.id) {
        if (targetUser.id == chatRoomDm.owner.id) {
          throw new WsException('방 주인을 쫓아낼 수는 없습니다.');
        }

        for (const joinedUser of chatRoomDm.joinedDmUser)
          if (joinedUser.user.id == targetUser.id) {
            await this.removeJoinedDmUser(targetUser.id, chatRoomId);
            break;
          }
      } else if (
        offerUser.id &&
        offerUser.id === targetUser.id &&
        offerUser.id !== chatRoomDm.owner.id
      ) {
        return await this.removeJoinedDmUser(targetUser.id, chatRoomId);
      } else if (
        offerUser.id &&
        offerUser.id === targetUser.id &&
        offerUser.id === chatRoomDm.owner.id
      ) {
        return await this.removeChatRoomDm(chatRoomDm.id);
      }
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async removeJoinedDmUser(
    targetUserId: number,
    chatRoomId: number,
  ): Promise<void> {
    try {
      const user = await this.userService.findUserById(targetUserId);

      this.joinedDmUserRepository
        .createQueryBuilder('joinedDmUser')
        .delete()
        .from(JoinedDmUser)
        .where('user = :user', { user: user.id })
        .andWhere('chatRoomDm =:chatRoomDm', { chatRoomDm: chatRoomId })
        .execute();
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async removeChatRoomDm(chatRoomDmId: number): Promise<void> {
    try {
      const chatRoomDm = await this.findChatRoomDmById(chatRoomDmId, [
        'joinedDmUser',
        'owner',
      ]);

      await this.joinedDmUserRepository.remove(chatRoomDm.joinedDmUser);
      await this.chatRoomDmRepository.remove(chatRoomDm);
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async addChatLog(body: ChatLogDto): Promise<void> {
    try {
      const user = await this.userService
        .findUserById(body.userId)
        .catch(() => null);
      const chatRoom = await this.findChatRoomById(body.chatRoomId, [
        'joinedUser',
      ]).catch(() => null);

      if (!user) throw new WsException('메시지 보낸 유저는 존재하지 않습니다');

      if (!chatRoom)
        throw new WsException('메시지 보낸 채팅룸은 존재하지 않습니다');

      if (!chatRoom.joinedUser.find((joined) => joined.user.id == user.id))
        throw new WsException('메시지 보낸 유저는 이 방에 없습니다.');
      const log = {
        message: body.message,
        user: user,
        chatRoom: chatRoom,
        createdAt: body.createdAt,
      };
      const chatLog = await this.chatLogRepository.create(log);
      await this.chatLogRepository.save(chatLog);
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async addChatDmLog(body: ChatDmLogDto): Promise<void> {
    try {
      const user = await this.userService
        .findUserById(body.userId)
        .catch(() => null);
      const chatRoomDm = await this.findChatRoomDmById(body.chatRoomDmId, [
        'joinedDmUser',
      ]).catch(() => null);

      if (!user) throw new WsException('메시지 보낸 유저는 존재하지 않습니다');

      if (!chatRoomDm)
        throw new WsException('메시지 보낸 채팅룸은 존재하지 않습니다');

      if (!chatRoomDm.joinedDmUser.find((joined) => joined.user.id == user.id))
        throw new WsException('메시지 보낸 유저는 이 방에 없습니다.');
      const log = {
        message: body.message,
        user: user,
        chatRoomDm: chatRoomDm,
        createdAt: body.createdAt,
      };
      const chatDmLog = await this.chatDmLogRepository.create(log);
      await this.chatDmLogRepository.save(chatDmLog);
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async deleteChatRoomIfOwner(userId: number): Promise<void> {
    try {
      await this.chatRoomRepository
        .createQueryBuilder('chatRoom')
        .delete()
        .from(ChatRoom)
        .where('ownerId = :ownerId', { ownerId: userId })
        .execute();
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async deleteChatRoomDmIfOwner(userId: number): Promise<void> {
    try {
      await this.chatRoomDmRepository
        .createQueryBuilder('chatRoomdm')
        .delete()
        .from(ChatRoomDm)
        .where('ownerId = :ownerId', { ownerId: userId })
        .execute();
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async deleteChatRoomAll(): Promise<void> {
    try {
      await this.chatRoomRepository
        .createQueryBuilder('chatRoom')
        .delete()
        .from(ChatRoom)
        .execute();
      await this.joinedUserRepository
        .createQueryBuilder('joinedUser')
        .delete()
        .from(JoinedUser)
        .execute();
    } catch (e) {
      throw new WsException(e.message);
    }
  }
  async deleteChatRoomDmAll(): Promise<void> {
    try {
      await this.chatRoomDmRepository
        .createQueryBuilder('chatRoomdm')
        .delete()
        .from(ChatRoomDm)
        .execute();
      await this.joinedDmUserRepository
        .createQueryBuilder('joinedDmUser')
        .delete()
        .from(JoinedDmUser)
        .execute();
    } catch (e) {
      throw new WsException(e.message);
    }
  }
}
