import { Body, HttpStatus, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { sanitize } from 'class-sanitizer';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { User } from 'src/user/entity/user.entity';
import { userStatus } from 'src/user/enum/status.enum';
import { UserService } from 'src/user/service/user.service';
import { ChatService } from './chat.service';
import {
  ChatRoomDmDto,
  ChatRoomDmMessageDto,
  ChatRoomDmUserIdDto,
  ChatRoomDto,
  ChatRoomIdDmDto,
  ChatRoomIdDto,
  ChatRoomIdUserIdDto,
  ChatRoomJoinDto,
  ChatRoomleaveDmDto,
  ChatRoomleaveDto,
  ChatRoomMessageDto,
  ChatRoomNameDto,
  ChatRoomUserIdDto,
  InviteGameRoomInfoDto,
  InviteUserDto,
  ResponseInviteDto,
  updatePwdDto,
} from './dto/chat.dto';

const socket_username = {};

// ws://localhost:3000/chat
@WebSocketGateway({ namespace: 'chat', cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer()
  public server: any;

  /* --------------------------
	|				handleConnection 		|
	|				handleDisconnect		|
	---------------------------*/

  async handleConnection(
    @ConnectedSocket() socket: Socket,
  ): Promise<WsException | void> {
    try {
      const user = await this.authService.findUserByRequestToken(socket);
      if (!user) {
        socket.disconnect();
        throw new WsException('소켓 연결 유저 없습니다.');
      }

      // await this.userService.updateStatus(user.id, userStatus.CHATCHANNEL);
      await this.userService.updateStatus(user.id, userStatus.INGAME);

      await this.chatService.deleteChatRoomIfOwner(user.id);
      const initChatRooms = await this.chatService
        .findChatRoomByUserId(user.id)
        .catch(() => null);

      if (initChatRooms) {
        for (const initChatRoom of initChatRooms) {
          await this.chatService.leaveChatRoom(
            user.id,
            initChatRoom.id,
            user.id,
          );
        }
      }

      await this.chatService.deleteChatRoomDmIfOwner(user.id);
      const initChatRoomDms = await this.chatService
        .findChatRoomDmByUserId(user.id, ['joinedDmUser', 'owner'])
        .catch(() => null);
      if (initChatRoomDms) {
        for (const initChatRoomDm of initChatRoomDms) {
          await this.chatService.leaveChatRoomDm(
            user.id,
            initChatRoomDm.id,
            user.id,
          );
        }
      }

      const chatRooms = await this.chatService.findChatRoomByUserId(user.id);
      const chatRoomsDm = await this.chatService.findChatRoomDmByUserId(
        user.id,
      );
      const allChatRooms = await this.chatService.findChatRoomAll();

      socket.data.user = user;
      socket_username[user.username] = socket;

      socket.emit('connection', {
        message: `${user.username} 연결`,
        user,
        chatRooms,
        chatRoomsDm,
        allChatRooms,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }
  async handleDisconnect(
    @ConnectedSocket() socket: Socket,
  ): Promise<WsException | void> {
    try {
      const user = socket.data.user;
      if (!user) throw new WsException('소켓 연결 유저 없습니다.');
      else await this.userService.updateStatus(user.id, userStatus.ONLINE);

      const disconnectUser = await this.userService.findUserById(user.id);

      await this.chatService.deleteChatRoomIfOwner(user.id);
      const chatRooms = await this.chatService
        .findChatRoomByUserId(disconnectUser.id)
        .catch(() => null);
      if (chatRooms) {
        for (const chatRoom of chatRooms) {
          const leaveUser = {
            targetUserId: disconnectUser.id,
            chatRoomId: chatRoom.id,
          };
          await this.leaveChatRoom(socket, leaveUser);
          // await this.chatService.leaveChatRoom(
          //   disconnectUser.id,
          //   chatRoom.id,
          //   disconnectUser.id,
          // );
        }
      }

      await this.chatService.deleteChatRoomDmIfOwner(user.id);
      const chatRoomDms = await this.chatService
        .findChatRoomDmByUserId(disconnectUser.id)
        .catch(() => null);
      if (chatRoomDms) {
        for (const chatRoomDm of chatRoomDms) {
          const leaveUser = {
            targetUserId: disconnectUser.id,
            chatRoomId: chatRoomDm.id,
          };
          await this.leaveChatRoom(socket, leaveUser);
          // await this.chatService.leaveChatRoomDm(
          //   disconnectUser.id,
          //   chatRoomDm.id,
          //   disconnectUser.id,
          // );
        }
      }

      const chatRoom = await this.chatService.findChatRoomByUserId(
        disconnectUser.id,
      );
      const chatRoomDm = await this.chatService.findChatRoomDmByUserId(
        disconnectUser.id,
      );

      socket.emit('disconnectiton', {
        message: `${user.username} 연결해제`,
        disconnectUser,
        chatRoom,
        chatRoomDm,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				createChatRoom			|
	---------------------------*/

  @SubscribeMessage('createChatRoom')
  async createChatRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ChatRoomDto,
  ): Promise<WsException | void> {
    try {
      const user = await this.authService.findUserByRequestToken(socket);
      const chatRoom = await this.chatService.createChatRoom(user.id, body);
      socket.join(body.name);

      socket.emit('createChatRoom', {
        message: '채팅룸이 생성되었습니다',
        chatRoom,
      });
      this.server
        .to(body.name)
        .emit('join', `${body.name}방에 ${user.username}이/가 들어왔습니다`);
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				updatePwd						|
	---------------------------*/
  @SubscribeMessage('updatePwd')
  async updatePwd(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: updatePwdDto,
  ): Promise<WsException | void> {
    try {
      const user = await this.authService.findUserByRequestToken(socket);
      await this.chatService.updatePwd(user.id, body.password, body.chatRoomId);
      socket.emit('updatePwd', { message: `채팅방 비밀번호 변경 완료` });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				findChatRoomAll 					|
	|				findChatRoomById 		|
	|				findChatRoomByName			|
	|				findChatRoomByUserId			|
	|				findChatRoomMe			|
	---------------------------*/

  @SubscribeMessage('chatRoomAll')
  async findChatRoomAll(
    @ConnectedSocket() socket: Socket,
  ): Promise<WsException | void> {
    try {
      const chatRoom = await this.chatService.findChatRoomAll();

      socket.emit('chatRoomAll', { message: '모든 채팅 방 목록', chatRoom });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('chatRoomById')
  async findChatRoomById(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ChatRoomIdDto,
  ): Promise<WsException | void> {
    try {
      const chatRoom = await this.chatService.findChatRoomById(
        body.chatRoomId,
        [
          'mutedUser',
          'bannedUser',
          'joinedUser',
          'adminUser',
          'owner',
          'chatLog',
        ],
      );

      socket.emit('chatRoomById', {
        message: `${chatRoom.name} 방 정보`,
        chatRoom,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('chatRoomByName')
  async findChatRoomByName(
    socket: Socket,
    body: ChatRoomNameDto,
  ): Promise<WsException | void> {
    try {
      const chatRoom = await this.chatService.findChatRoomByName(
        body.chatRoomName,
        [
          'mutedUser',
          'bannedUser',
          'joinedUser',
          'adminUser',
          'owner',
          'chatLog',
        ],
      );

      socket.emit('chatRoomByName', {
        message: `${chatRoom.name} 방 정보`,
        chatRoom,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('chatRoomByUserId')
  async findChatRoomByUserId(
    socket: Socket,
    body: ChatRoomUserIdDto,
  ): Promise<WsException | void> {
    try {
      const user = await this.userService.findUserById(body.userId);
      const chatRoom = await this.chatService.findChatRoomByUserId(user.id);

      socket.emit('chatRoomByUserId', {
        message: `${user.username}이/가 속한 방 정보`,
        chatRoom,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('chatRoomMe')
  async findChatRoomMe(
    @ConnectedSocket() socket: Socket,
  ): Promise<WsException | void> {
    try {
      const user = await this.userService.findUserById(socket.data.user.id);
      const chatRooms = await this.chatService.findChatRoomByUserId(user.id);

      socket.emit('chatRoomMe', {
        message: `${user.username}이/가 속한 방 정보`,
        chatRooms,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				joinChatRoom 				|
	|				leaveChatRoom				|
	---------------------------*/

  @SubscribeMessage('join')
  async joinChatRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ChatRoomJoinDto,
  ): Promise<WsException | void> {
    try {
      let chatRoom = await this.chatService.findChatRoomById(
        body.chatRoomId,
        [],
        true,
      );
      const user = await this.userService.findUserById(socket.data.user.id);

      await this.chatService.canUserEnterChatRoom(body, socket.data.user.id);

      chatRoom = await this.chatService.findChatRoomById(chatRoom.id, [
        'joinedUser',
      ]);

      // await this.userService.updateStatus(user.id, userStatus.CHATROOM);
      await this.userService.updateStatus(user.id, userStatus.INGAME);

      socket.join(chatRoom.name);

      this.server
        .to(chatRoom.name)
        .emit(
          'join',
          `${chatRoom.name}방에 ${user.username}이/가 들어왔습니다`,
        );
      socket.emit('join', { chatRoom });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  //offerUser가 body.targetId를 남으로 하면 강퇴, 지가 지꺼쓰면 퇴장
  @SubscribeMessage('leave')
  async leaveChatRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ChatRoomleaveDto,
  ): Promise<WsException | void> {
    try {
      const offerUser = socket.data.user;
      const targetUser = await this.userService.findUserById(body.targetUserId);
      let chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
        'owner',
      ]);

      if (chatRoom.owner.id == offerUser.id) {
        const sockets = await this.server.in(chatRoom.name).fetchSockets();
        for (const so of sockets) {
          // await this.userService.updateStatus(
          //   targetUser.id,
          //   userStatus.CHATCHANNEL,
          // );
          await this.userService.updateStatus(so.data.id, userStatus.INGAME);
          so.emit('leave', {
            message: `owner가 ${chatRoom.name} 채팅방 나가서 방이 삭제 됐습니다.`,
            chatRoom,
            targetUser,
          });
          so.leave(chatRoom.name);
        }
        await this.chatService.leaveChatRoom(
          targetUser.id,
          body.chatRoomId,
          offerUser.id,
        );
      } else {
        await this.chatService.leaveChatRoom(
          targetUser.id,
          body.chatRoomId,
          offerUser.id,
        );
        chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
          'joinedUser',
          'owner',
        ]);

        socket.to(chatRoom.name).emit('leave', {
          message: `${chatRoom.name}방에 ${targetUser.username}이/가 나갔습니다.`,
          chatRoom,
          targetUser,
        });

        socket.emit('leave', {
          message: `${chatRoom.name}방에 ${targetUser.username}이/가 나갔습니다.`,
          chatRoom,
          targetUser,
        });

        const targetUserSocket = socket_username[targetUser.username];
        // await this.userService.updateStatus(targetUser.id, userStatus.CHATCHANNEL);
        await this.userService.updateStatus(targetUser.id, userStatus.INGAME);
        targetUserSocket.leave(chatRoom.name);
      }
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|					sendMessage 			|
	---------------------------*/

  //클라이언트에서 block유저 관계 확인해서 해당 유저면 그 유저 화면에서는 특정유저의 메지시 안보여줌.
  @SubscribeMessage('message')
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ChatRoomMessageDto,
  ): Promise<WsException | void> {
    try {
      const user = socket.data.user;
      const chatRoom = await this.chatService
        .findChatRoomById(body.chatRoomId, ['joinedUser', 'mutedUser'])
        .catch(() => null);

      for (const mutedUser of chatRoom.mutedUser) {
        if (mutedUser.user.id == user.id) {
          const currentTime = new Date();
          if (mutedUser.endTime > currentTime)
            throw new WsException('이 방에서 당신은 Mute 상태입니다.');
          else {
            await this.chatService.directRemoveMuteUser(
              mutedUser.user.id,
              chatRoom.id,
            );
          }
        }
      }

      this.server.to(chatRoom.name).emit('message', {
        user: { id: user.id, username: user.username },
        message: body.message,
      });
      const log = {
        userId: user.id,
        chatRoomId: body.chatRoomId,
        message: body.message,
        createdAt: new Date(),
      };
      await this.chatService.addChatLog(log);
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				addAdminUser 		|
	|				removeAdminUser 		|
	---------------------------*/

  @SubscribeMessage('addAdmin')
  async addAdminUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ChatRoomIdUserIdDto,
  ): Promise<WsException | void> {
    try {
      let chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
      ]);
      const me = socket.data.user;
      const targetUser = await this.userService.findUserById(body.userId);

      await this.chatService.addAdminUser(me.id, targetUser.id, chatRoom.id);

      chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
        'adminUser',
      ]);

      this.server.to(chatRoom.name).emit('admin', {
        message: 'admin user가 추가 되었습니다',
        adminUser: { id: targetUser.id, username: targetUser.username },
        chatRoom: {
          id: chatRoom.id,
          name: chatRoom.name,
          admin: chatRoom.adminUser,
        },
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('removeAdmin')
  async removeAdminUser(
    socket: Socket,
    body: ChatRoomIdUserIdDto,
  ): Promise<WsException | void> {
    try {
      let chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
      ]);
      const me = socket.data.user;
      const targetUser = await this.userService.findUserById(body.userId);

      await this.chatService.removeAdminUser(me.id, targetUser.id, chatRoom.id);

      chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
        'adminUser',
      ]);

      this.server.to(chatRoom.name).emit('admin', {
        message: 'admin user가 제거 되었습니다',
        adminUser: { id: targetUser.id, username: targetUser.username },
        chatRoom: {
          id: chatRoom.id,
          name: chatRoom.name,
          admin: chatRoom.adminUser,
        },
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
|				addMuteUser			|
|				removeMuteUser			|
---------------------------*/

  @SubscribeMessage('addMute')
  async addMutedUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ChatRoomIdUserIdDto,
  ): Promise<WsException | void> {
    try {
      let chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
        'mutedUser',
      ]);
      const targetUser = await this.userService.findUserById(body.userId);
      const me = socket.data.user;

      await this.chatService.addMuteUser(targetUser.id, chatRoom.id, me.id);

      chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
        'mutedUser',
      ]);

      this.server.to(chatRoom.name).emit('mute', {
        message: `mute user가 추가 되었습니다`,
        mutedUser: { id: targetUser.id, username: targetUser.username },
        chatRoom: {
          id: chatRoom.id,
          name: chatRoom.name,
          muted: chatRoom.mutedUser,
        },
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  //시간상관없이 조건 풀어주는로직
  @SubscribeMessage('removeMute')
  async removeMutedUser(
    socket: Socket,
    body: ChatRoomIdUserIdDto,
  ): Promise<WsException | void> {
    try {
      let chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
        'mutedUser',
      ]);
      const targetUser = await this.userService.findUserById(body.userId);
      const me = socket.data.user;

      await this.chatService.removeMuteUser(targetUser.id, chatRoom.id, me.id);

      chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
        'mutedUser',
      ]);

      this.server.to(chatRoom.name).emit('mute', {
        message: `mute user가 제거 되었습니다`,
        mutedUser: { id: targetUser.id, username: targetUser.username },
        chatRoom: {
          id: chatRoom.id,
          name: chatRoom.name,
          muted: chatRoom.mutedUser,
        },
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				addBannedUser		|
	|				removeBannedUser		|
	---------------------------*/

  @SubscribeMessage('addBan')
  async addBannedUser(
    socket: Socket,
    body: ChatRoomIdUserIdDto,
  ): Promise<WsException | void> {
    try {
      let chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
        'bannedUser',
      ]);
      const targetUser = await this.userService.findUserById(body.userId);
      const me = socket.data.user;

      await this.chatService.addBannedUser(targetUser.id, chatRoom.id, me.id);

      const targetUserSocket = socket_username[targetUser.username];
      targetUserSocket.leave(chatRoom.name);
      // await this.userService.updateStatus(targetUser.id, userStatus.CHATCHANNEL);
      await this.userService.updateStatus(targetUser.id, userStatus.INGAME);

      chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
        'bannedUser',
      ]);

      this.server.to(chatRoom.name).emit('ban', {
        message: `ban user가 추가 되었습니다`,
        bannedUser: { id: targetUser.id, username: targetUser.username },
        chatRoom: {
          id: chatRoom.id,
          name: chatRoom.name,
          banned: chatRoom.bannedUser,
        },
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  //조건없이 강제로 지워줌
  @SubscribeMessage('removeBan')
  async removeBannedUser(
    socket: Socket,
    body: ChatRoomIdUserIdDto,
  ): Promise<WsException | void> {
    try {
      let chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
        'bannedUser',
      ]);
      const targetUser = await this.userService.findUserById(body.userId);
      const me = socket.data.user;

      await this.chatService.removeBannedUser(
        targetUser.id,
        chatRoom.id,
        me.id,
      );

      chatRoom = await this.chatService.findChatRoomById(body.chatRoomId, [
        'joinedUser',
        'bannedUser',
      ]);

      this.server.to(chatRoom.name).emit('ban', {
        message: `ban user가 삭제 되었습니다`,
        bannedUser: { id: targetUser.id, username: targetUser.username },
        chatRoom: {
          id: chatRoom.id,
          name: chatRoom.name,
          banned: chatRoom.bannedUser,
        },
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				createChatRoomDm			|
	---------------------------*/

  @SubscribeMessage('createChatRoomDm')
  async createChatRoomDm(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ChatRoomDmDto,
  ): Promise<WsException | void> {
    try {
      const user = await this.authService.findUserByRequestToken(socket);
      const target = await this.userService.findUserById(body.targetId);

      const targetSocket: Socket = socket_username[target.username];
      if (!targetSocket) {
        throw new WsException('상대방은 채팅 가능 상태가 아닙니다.');
      }

      const chatRoomDm = await this.chatService.createChatRoomDm(
        user.id,
        body.targetId,
      );
      socket.join(chatRoomDm.name);

      socket.emit('createChatRoomDm', {
        message: '채팅룸이 생성되었습니다',
        chatRoomDm,
      });

      this.server.to(chatRoomDm.name).emit('join', {
        message: `${chatRoomDm.name}방에 ${user.username}이/가 들어왔습니다`,
      });

      targetSocket.join(chatRoomDm.name);

      this.server.to(chatRoomDm.name).emit('join', {
        message: `${chatRoomDm.name}방에 ${target.username}이/가 들어왔습니다`,
        inviteUserId: user.id,
        chatRoomDmId: chatRoomDm.id,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				findChatRoomDmById	|
	|				findChatRoomDmMe		|
	|				findChatRoomDmByUserId		|
	|				findChatRoomDmByName		|
	---------------------------*/

  @SubscribeMessage('chatRoomDmById')
  async findChatRoomDmById(
    socket: Socket,
    body: ChatRoomIdDmDto,
  ): Promise<WsException | void> {
    try {
      const chatRoomDm = await this.chatService.findChatRoomDmById(
        body.chatRoomId,
        ['joinedDmUser', 'chatDmLog'],
      );
      socket.emit('chatRoomDmById', {
        message: `${chatRoomDm.name} 방 정보`,
        chatRoomDm,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('chatRoomDmMe')
  async findChatRoomDmMe(
    @ConnectedSocket() socket: Socket,
  ): Promise<WsException | void> {
    try {
      const user = await this.userService.findUserById(socket.data.user.id);
      const chatRoomDm = await this.chatService.findChatRoomDmByUserId(
        socket.data.user.id,
      );

      socket.emit('chatRoomDmMe', {
        message: `${user.username}이/가 속한 방 정보`,
        chatRoomDm,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('chatRoomDmByUserId')
  async findChatRoomDmByUserId(
    socket: Socket,
    body: ChatRoomDmUserIdDto,
  ): Promise<WsException | void> {
    try {
      const user = await this.userService.findUserById(body.userId);
      const chatRoomDm = await this.chatService.findChatRoomDmByUserId(user.id);

      socket.emit('chatRoomDmByUserId', {
        message: `${user.username}이 / 가 속한 방 정보`,
        chatRoomDm,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				leaveChatRoomDm				|
	---------------------------*/

  //owner가 body.id를 남으로 하면 강퇴, 지가 지꺼쓰면퇴정
  @SubscribeMessage('leaveDm')
  async leaveChatRoomDm(
    socket: Socket,
    body: ChatRoomleaveDmDto,
  ): Promise<WsException | void> {
    try {
      const offerUser = socket.data.user;
      const targetUser = await this.userService.findUserById(body.targetUserId);

      let chatRoomDm = await this.chatService.findChatRoomDmById(
        body.chatRoomId,
        ['joinedDmUser', 'owner'],
      );

      if (chatRoomDm.owner.id == offerUser.id) {
        const sockets = await this.server.in(chatRoomDm.name).fetchSockets();
        for (const so of sockets) {
          // await this.userService.updateStatus(
          //   targetUser.id,
          //   userStatus.CHATCHANNEL,
          // );
          await this.userService.updateStatus(so.data.id, userStatus.INGAME);
          so.emit('leave', {
            message: `owner가 ${chatRoomDm.name} 채팅방 나가서 방이 삭제 됐습니다.`,
            chatRoomDm,
            targetUser,
          });
          so.leave(chatRoomDm.name);
        }
        await this.chatService.leaveChatRoomDm(
          targetUser.id,
          body.chatRoomId,
          offerUser.id,
        );
      } else {
        await this.chatService.leaveChatRoomDm(
          targetUser.id,
          body.chatRoomId,
          offerUser.id,
        );
        chatRoomDm = await this.chatService.findChatRoomDmById(
          body.chatRoomId,
          ['joinedDmUser', 'owner'],
        );

        socket.to(chatRoomDm.name).emit('leave', {
          message: `${chatRoomDm.name}방에 ${targetUser.username}이/가 나갔습니다.`,
          chatRoomDm,
          targetUser,
        });

        socket.emit('leave', {
          message: `${chatRoomDm.name}방에 ${targetUser.username}이/가 나갔습니다.`,
          chatRoomDm,
          targetUser,
        });

        const targetUserSocket = socket_username[targetUser.username];
        // await this.userService.updateStatus(targetUser.id, userStatus.CHATCHANNEL);
        await this.userService.updateStatus(targetUser.id, userStatus.INGAME);
        targetUserSocket.leave(chatRoomDm.name);
      }
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				sendMessageDm			|
	---------------------------*/

  @SubscribeMessage('directMessage')
  async sendMessageDM(
    socket: Socket,
    body: ChatRoomDmMessageDto,
  ): Promise<WsException | void> {
    try {
      const chatRoomDm = await this.chatService.findChatRoomDmById(
        body.chatRoomId,
        ['joinedDmUser'],
      );

      const me = socket.data.user;
      const targetUser = chatRoomDm.joinedDmUser.find(
        (user) => user.user.id != socket.data.user.id,
      );

      const isBlockedUser = await this.userService.findUserById(
        targetUser.user.id,
        ['blockOfferUser'],
      );

      if (
        isBlockedUser.blockOfferUser.find(
          (user) => user.blockedUser.id == me.id,
        )
      ) {
        socket.emit('blocked', { message: 'you are blocked user' });
        throw new WsException('당신은 블락 유저 입니다.');
      }

      this.server.to(chatRoomDm.name).emit('directMessage', {
        user: socket.data.user,
        targetUser: targetUser,
        message: body.message,
        chatRoomId: chatRoomDm.id,
      });
      const log = {
        userId: me.id,
        chatRoomDmId: body.chatRoomId,
        message: body.message,
        createdAt: new Date(),
      };

      await this.chatService.addChatDmLog(log);
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				createInviteRoom 		|
	|				responseInvite 		|
	|				inviteGameRoomInfo |
	---------------------------*/

  @SubscribeMessage('createInviteRoom')
  async createInviteRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: InviteUserDto,
  ): Promise<WsException | void> {
    try {
      const user: User = socket.data.user;
      if (!user) throw new WsException('소켓 연결 유저 없습니다.');

      const target = await this.userService
        .findUserById(body.userId)
        .catch(() => null);
      if (!target) throw new WsException('해당 타겟 유저는 존재하지 않습니다.');

      const targetSocket: Socket = socket_username[target.username];
      if (!targetSocket) {
        throw new WsException('상대방은 채팅 가능 상태가 아닙니다.');
      }

      const randomInviteRoomName = String(Math.floor(Math.random() * 1e9));
      socket.join(randomInviteRoomName);
      targetSocket.join(randomInviteRoomName);

      socket.to(randomInviteRoomName).emit('requestInvite', {
        message: '게임 초대 위한 요청',
        randomInviteRoomName,
        hostId: user.id,
        targetId: target.id,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('responseInvite')
  async responseInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ResponseInviteDto,
  ): Promise<WsException | void> {
    try {
      socket.to(body.randomInviteRoomName).emit('responseInviteToHost', {
        message: '게임 초대 요청에 대한 응답',
        randomInviteRoomName: body.randomInviteRoomName,
        hostId: body.hostId,
        targetId: body.targetId,
        response: body.response,
      });
      if (body.response == false) {
        const host = await this.userService.findUserById(body.hostId);
        const target = await this.userService.findUserById(body.targetId);
        const hostSocket: Socket = socket_username[host.username];
        const targetSocket: Socket = socket_username[target.username];
        hostSocket.leave(body.randomInviteRoomName);
        targetSocket.leave(body.randomInviteRoomName);
      }
    } catch (e) {
      return new WsException(e.message);
    }
  }
  //response == true 이면
  //게임 신청유저 -> "emit.createGameRoom" -> "emit.joinGameRoom" -> "emit.inviteGameRoomInfo"
  //초대 받은유저 -> 'on.inviteGameRoomInfo' -> emit.joinGameRoom
  @SubscribeMessage('inviteGameRoomInfo')
  async inviteGameRoomInfo(
    socket: Socket,
    body: InviteGameRoomInfoDto,
  ): Promise<WsException | void> {
    try {
      socket.to(body.inviteGameRoomName).emit('inviteGameRoomInfo', {
        message: '게임룸 참여를 위한 정보',
        randomInviteRoomName: body.randomInviteRoomName,
        hostId: body.hostId,
        targetId: body.targetId,
        gameRoomName: body.inviteGameRoomName,
      });

      const host = await this.userService.findUserById(body.hostId);
      const target = await this.userService.findUserById(body.targetId);
      const hostSocket: Socket = socket_username[host.username];
      const targetSocket: Socket = socket_username[target.username];
      hostSocket.leave(body.randomInviteRoomName);
      targetSocket.leave(body.randomInviteRoomName);
    } catch (e) {
      return new WsException(e.message);
    }
  }
}
