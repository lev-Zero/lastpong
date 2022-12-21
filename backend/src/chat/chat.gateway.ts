import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { userStatus } from 'src/user/enum/status.enum';
import { UserService } from 'src/user/service/user.service';
import { ChatService } from './chat.service';
import { ChatRoomDmDto, ChatRoomDmMessageDto, ChatRoomDmUserIdDto, ChatRoomDto, ChatRoomIdDmDto, ChatRoomIdDto, ChatRoomIdUserIdDto, ChatRoomJoinDto, ChatRoomleaveDmDto, ChatRoomleaveDto, ChatRoomMessageDto, ChatRoomNameDto, ChatRoomUserIdDto, updatePwdDto } from './dto/chat.dto';

let socket_username = {};

// ws://localhost:3000/chat
@WebSocketGateway({ namespace: 'chat', cors:true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly chatService: ChatService
	) { }

	@WebSocketServer()
	public server: any;

	/* --------------------------
	|				handleConnection 		|
	|				handleDisconnect		|
	---------------------------*/

	async handleConnection(socket: Socket) {
		try {

			const user = await this.authService.findUserByRequestToken(socket);
			if (!user) { 
				socket.disconnect();
				throw new HttpException('소켓 연결 유저 없습니다.', HttpStatus.BAD_REQUEST);
			}
	
			await this.userService.updateStatus(user.id, userStatus.CHATCHANNEL)

			const initChatRooms = await this.chatService.findChatRoomByUserId(user.id).catch(() => null);

			if (initChatRooms) {
				for (const initChatRoom of initChatRooms) {
					await this.chatService.leaveChatRoom(
						user.id,
						initChatRoom.id,
						user.id
					)
				}
			}

			const initChatRoomDms = await this.chatService.findChatRoomDmByUserId(user.id, ['joinedDmUser', 'owner']).catch(() => null);
			if (initChatRoomDms) {
				for (const initChatRoomDm of initChatRoomDms) {

					await this.chatService.leaveChatRoomDm(
						user.id,
						initChatRoomDm.id,
						user.id
					)
				}
			}

			const chatRooms = await this.chatService.findChatRoomByUserId(user.id);
			const chatRoomsDm = await this.chatService.findChatRoomDmByUserId(user.id);
			const allChatRooms = await this.chatService.findChatRoomAll();

			socket.data.user = user;
			socket_username[user.username] = socket;

			socket.emit('connection', { message: `${user.username} 연결`, user, chatRooms, chatRoomsDm, allChatRooms })

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}
	async handleDisconnect(socket: any) {

		try {
			const user = socket.data.user;
			if (!user)
				throw new HttpException('소켓 연결 유저 없습니다.', HttpStatus.BAD_REQUEST);
			else
				await this.userService.updateStatus(user.id, userStatus.ONLINE)

			const disconnectUser = await this.userService.findUserById(user.id);

			const chatRooms = await this.chatService.findChatRoomByUserId(disconnectUser.id).catch(() => null);
			if (chatRooms) {
				for (const chatRoom of chatRooms) {
					await this.chatService.leaveChatRoom(
						disconnectUser.id,
						chatRoom.id,
						disconnectUser.id
					)
				}
			}

			const chatRoomDms = await this.chatService.findChatRoomDmByUserId(disconnectUser.id).catch(() => null);
			if (chatRoomDms) {
				for (const chatRoomDm of chatRoomDms) {
					await this.chatService.leaveChatRoomDm(
						disconnectUser.id,
						chatRoomDm.id,
						disconnectUser.id
					)
				}
			}

			const chatRoom = await this.chatService.findChatRoomByUserId(disconnectUser.id);
			const chatRoomDm = await this.chatService.findChatRoomDmByUserId(disconnectUser.id);

			socket.emit('disconnectiton', { message: `${user.username} 연결해제`, disconnectUser, chatRoom, chatRoomDm })

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}

	}


	/* --------------------------
	|				createChatRoom			|
	---------------------------*/

	@SubscribeMessage('createChatRoom')
	async createChatRoom(socket: Socket, chatroom: ChatRoomDto): Promise<void> {

		try {
			const user = await this.authService.findUserByRequestToken(socket);
			const chatRoom = await this.chatService.createChatRoom(user.id, chatroom);
			socket.join(chatroom.name)

			socket.emit('createChatRoom', { message: '채팅룸이 생성되었습니다', chatRoom })
			this.server.to(chatroom.name).emit('join', `${chatroom.name}방에 ${user.username}이/가 들어왔습니다`)
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


	/* --------------------------
	|				updatePwd						|
	---------------------------*/
	@SubscribeMessage('updatePwd')
	async updatePwd(socket: Socket, chatRoom: updatePwdDto): Promise<void> {
		try {
			const user = await this.authService.findUserByRequestToken(socket);
			await this.chatService.updatePwd(user.id, chatRoom.password, chatRoom.chatRoomId);
			socket.emit('updatePwd', { message: `채팅방 비밀번호 변경 완료` })
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
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
	async findChatRoomAll(socket: Socket): Promise<void> {

		try {
			const chatRoom = await this.chatService.findChatRoomAll();

			socket.emit('chatRoomAll', { message: '모든 채팅 방 목록', chatRoom })
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	@SubscribeMessage('chatRoomById')
	async findChatRoomById(socket: Socket, data: ChatRoomIdDto): Promise<void> {

		try {
			const chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, ['mutedUser', 'bannedUser', 'joinedUser', 'adminUser', 'owner']);

			socket.emit('chatRoomById', { message: `${chatRoom.name} 방 정보`, chatRoom })
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	@SubscribeMessage('chatRoomByName')
	async findChatRoomByName(socket: Socket, data: ChatRoomNameDto): Promise<void> {

		try {
			const chatRoom = await this.chatService.findChatRoomByName(data.chatRoomName, ['mutedUser', 'bannedUser', 'joinedUser', 'adminUser', 'owner']);

			socket.emit('chatRoomByName', { message: `${chatRoom.name} 방 정보`, chatRoom })
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	@SubscribeMessage('chatRoomByUserId')
	async findChatRoomByUserId(socket: Socket, data: ChatRoomUserIdDto): Promise<void> {

		try {
			const user = await this.userService.findUserById(data.userId)
			const chatRoom = await this.chatService.findChatRoomByUserId(user.id);

			socket.emit('chatRoomByUserId', { message: `${user.username}이/가 속한 방 정보`, chatRoom })
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	@SubscribeMessage('chatRoomMe')
	async findChatRoomMe(socket: Socket): Promise<void> {

		try {
			const user = await this.userService.findUserById(socket.data.user.id)
			const chatRooms = await this.chatService.findChatRoomByUserId(user.id)

			socket.emit('chatRoomMe', { message: `${user.username}이/가 속한 방 정보`, chatRooms })
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}



	/* --------------------------
	|				joinChatRoom 				|
	|				leaveChatRoom				|
	---------------------------*/


	@SubscribeMessage('join')
	async joinChatRoom(socket: Socket, joinChatRoom: ChatRoomJoinDto): Promise<void> {


		
		try {
			let chatRoom = await this.chatService.findChatRoomById(joinChatRoom.chatRoomId, [], true)
			const user = await this.userService.findUserById(socket.data.user.id)

			await this.chatService.canUserEnterChatRoom(joinChatRoom, socket.data.user.id)

			chatRoom = await this.chatService.findChatRoomById(chatRoom.id, ['joinedUser'])

			this.userService.updateStatus(user.id, userStatus.CHATROOM)

			socket.join(chatRoom.name)

			this.server.to(chatRoom.name).emit('join', `${chatRoom.name}방에 ${user.username}이/가 들어왔습니다`)
			socket.emit('join', { chatRoom })

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	//offerUser가 data.targetId를 남으로 하면 강퇴, 지가 지꺼쓰면 퇴장
	@SubscribeMessage('leave')
	async leaveChatRoom(socket: Socket, data: ChatRoomleaveDto): Promise<void> {
		
		
		try {
			const offerUser = socket.data.user;
			const targetUser = await this.userService.findUserById(data.targetUserId);
			const chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, ['joinedUser'])

			await this.chatService.leaveChatRoom(
				targetUser.id,
				data.chatRoomId,
				offerUser.id
			)

			socket.to(chatRoom.name).emit('leave', { message: `${chatRoom.name}방에 ${targetUser.username}이/가 나갔습니다.`, chatRoom, targetUser })

			const targetUserSocket = socket_username[targetUser.username];
			this.userService.updateStatus(targetUser.id, userStatus.CHATCHANNEL)
			targetUserSocket.leave(chatRoom.name)

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


	/* --------------------------
	|					sendMessage 			|
	---------------------------*/

	//클라이언트에서 block유저 관계 확인해서 해당 유저면 그 유저 화면에서는 특정유저의 메지시 안보여줌.
	@SubscribeMessage('message')
	async sendMessage(socket: Socket, data: ChatRoomMessageDto): Promise<void> {
	
		try {
			const user = socket.data.user;
			const chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, ['joinedUser', 'mutedUser']).catch(() => null)

			for (const mutedUser of chatRoom.mutedUser) {
				if (mutedUser.user.id == user.id) {
					const currentTime = new Date();
					if (mutedUser.endTime > currentTime)
						throw new HttpException('이 방에서 당신은 Mute 상태입니다.', HttpStatus.BAD_REQUEST)
					else {
						await this.chatService.directRemoveMuteUser(mutedUser.user.id, chatRoom.id)
					}
				}
			}

			this.server.to(chatRoom.name).emit('message', { user: { id: user.id, username: user.username }, message: data.message })

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}



	/* --------------------------
	|				addAdminUser 		|
	|				removeAdminUser 		|
	---------------------------*/

	@SubscribeMessage('addAdmin')
	async addAdminUser(socket: Socket, data: ChatRoomIdUserIdDto): Promise<void> {
		
		try {
			let chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, ['joinedUser'])
			const me = socket.data.user;
			const targetUser = await this.userService.findUserById(data.userId)

			await this.chatService.addAdminUser(
				me.id,
				targetUser.id,
				chatRoom.id
			)

			chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, ['joinedUser', 'adminUser'])

			this.server.to(chatRoom.name).emit('admin', {
				message: 'admin user가 추가 되었습니다',
				adminUser: { id: targetUser.id, username: targetUser.username },
				chatRoom: { id: chatRoom.id, name: chatRoom.name, admin: chatRoom.adminUser },
			})

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	@SubscribeMessage('removeAdmin')
	async removeAdminUser(socket: Socket, data: ChatRoomIdUserIdDto): Promise<void> {
	
		try {
			let chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, ['joinedUser'])
			const me = socket.data.user;
			const targetUser = await this.userService.findUserById(data.userId)

			await this.chatService.removeAdminUser(
				me.id,
				targetUser.id,
				chatRoom.id
			)

			chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, ['joinedUser', 'adminUser'])

			this.server.to(chatRoom.name).emit('admin', {
				message: 'admin user가 제거 되었습니다',
				adminUser: { id: targetUser.id, username: targetUser.username },
				chatRoom: { id: chatRoom.id, name: chatRoom.name, admin: chatRoom.adminUser },
			})
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


	/* --------------------------
|				addMuteUser			|
|				removeMuteUser			|
---------------------------*/

	@SubscribeMessage('addMute')
	async addMutedUser(socket: Socket, data: ChatRoomIdUserIdDto): Promise<void> {
	
		try {
			let chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, [
				'joinedUser',
				'mutedUser',
			]);
			const targetUser = await this.userService.findUserById(data.userId);
			const me = socket.data.user;

			await this.chatService.addMuteUser(
				targetUser.id,
				chatRoom.id,
				me.id,
			);

			chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, [
				'joinedUser',
				'mutedUser',
			]);

			this.server.to(chatRoom.name).emit('mute', {
				message: `mute user가 추가 되었습니다`,
				mutedUser: { id: targetUser.id, username: targetUser.username },
				chatRoom: { id: chatRoom.id, name: chatRoom.name, muted: chatRoom.mutedUser },
			});
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	//시간상관없이 조건 풀어주는로직
	@SubscribeMessage('removeMute')
	async removeMutedUser(socket: Socket, data: ChatRoomIdUserIdDto): Promise<void> {
	
		try {
			let chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, [
				'joinedUser',
				'mutedUser',
			]);
			const targetUser = await this.userService.findUserById(data.userId);
			const me = socket.data.user;

			await this.chatService.removeMuteUser(
				targetUser.id,
				chatRoom.id,
				me.id,
			);

			chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, [
				'joinedUser',
				'mutedUser',
			]);

			this.server.to(chatRoom.name).emit('mute', {
				message: `mute user가 제거 되었습니다`,
				mutedUser: { id: targetUser.id, username: targetUser.username },
				chatRoom: { id: chatRoom.id, name: chatRoom.name, muted: chatRoom.mutedUser },
			});

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	/* --------------------------
	|				addBannedUser		|
	|				removeBannedUser		|
	---------------------------*/


	@SubscribeMessage('addBan')
	async addBannedUser(socket: Socket, data: ChatRoomIdUserIdDto): Promise<void> {
	
		try {
			let chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, [
				'joinedUser',
				'bannedUser',
			]);
			const targetUser = await this.userService.findUserById(data.userId);
			const me = socket.data.user;

			await this.chatService.addBannedUser(
				targetUser.id,
				chatRoom.id,
				me.id
			);

			const targetUserSocket = socket_username[targetUser.username];
			targetUserSocket.leave(chatRoom.name)
			this.userService.updateStatus(targetUser.id, userStatus.CHATCHANNEL)

			chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, [
				'joinedUser',
				'bannedUser',
			]);

			this.server.to(chatRoom.name).emit('ban', {
				message: `ban user가 추가 되었습니다`,
				bannedUser: { id: targetUser.id, username: targetUser.username },
				chatRoom: { id: chatRoom.id, name: chatRoom.name, banned: chatRoom.bannedUser },
			});

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	//조건없이 강제로 지워줌
	@SubscribeMessage('removeBan')
	async removeBannedUser(socket: Socket, data: ChatRoomIdUserIdDto): Promise<void> {
	
		try {
			let chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, [
				'joinedUser',
				'bannedUser',
			]);
			const targetUser = await this.userService.findUserById(data.userId);
			const me = socket.data.user;

			await this.chatService.removeBannedUser(
				targetUser.id,
				chatRoom.id,
				me.id
			);

			chatRoom = await this.chatService.findChatRoomById(data.chatRoomId, [
				'joinedUser',
				'bannedUser',
			]);

			this.server.to(chatRoom.name).emit('ban', {
				message: `ban user가 삭제 되었습니다`,
				bannedUser: { id: targetUser.id, username: targetUser.username },
				chatRoom: { id: chatRoom.id, name: chatRoom.name, banned: chatRoom.bannedUser },
			});

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}



	/* --------------------------
	|				createChatRoomDm			|
	---------------------------*/


	@SubscribeMessage('createChatRoomDm')
	async createChatRoomDm(socket: Socket, targetUser: ChatRoomDmDto): Promise<void> {
	
		try {
			const user = await this.authService.findUserByRequestToken(socket);
			const target = await this.userService.findUserById(targetUser.targetId)

			const targetSocket: Socket = socket_username[target.username];
			if (!targetSocket) {
				throw new HttpException("상대방은 채팅 가능 상태가 아닙니다.", HttpStatus.BAD_REQUEST)
			}

			const chatRoomDm = await this.chatService.createChatRoomDm(user.id, targetUser.targetId);
			socket.join(chatRoomDm.name)

			socket.emit('createChatRoomDm', { message: '채팅룸이 생성되었습니다', chatRoomDm })

			this.server.to(chatRoomDm.name).emit('join', { message: `${chatRoomDm.name}방에 ${user.username}이/가 들어왔습니다` })

			targetSocket.join(chatRoomDm.name)

			this.server.to(chatRoomDm.name).emit('join', { message: `${chatRoomDm.name}방에 ${target.username}이/가 들어왔습니다` })

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	/* --------------------------
	|				findChatRoomDmById	|
	|				findChatRoomDmMe		|
	|				findChatRoomDmByUserId		|
	|				findChatRoomDmByName		|
	---------------------------*/

	@SubscribeMessage('chatRoomDmById')
	async findChatRoomDmById(socket: Socket, data: ChatRoomIdDmDto): Promise<void> {
	
		try {
			const chatRoomDm = await this.chatService.findChatRoomDmById(data.chatRoomId, [
				'joinedDmUser',
			]);
			socket.emit('chatRoomDmById', { message: `${chatRoomDm.name} 방 정보`, chatRoomDm })

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	@SubscribeMessage('chatRoomDmMe')
	async findChatRoomDmMe(socket: Socket): Promise<void> {
		try {
			const user = await this.userService.findUserById(socket.data.user.id)
			const chatRoomDm = await this.chatService.findChatRoomDmByUserId(
				socket.data.user.id,
			);

			socket.emit('chatRoomDmMe', { message: `${user.username}이/가 속한 방 정보`, chatRoomDm })
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	@SubscribeMessage('chatRoomDmByUserId')
	async findChatRoomDmByUserId(socket: Socket, data: ChatRoomDmUserIdDto): Promise<void> {

		try {
			const user = await this.userService.findUserById(data.userId)
			const chatRoomDm = await this.chatService.findChatRoomDmByUserId(user.id);

			socket.emit('chatRoomDmByUserId', { message: `${user.username}이 / 가 속한 방 정보`, chatRoomDm })
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


	/* --------------------------
	|				leaveChatRoomDm				|
	---------------------------*/

	//owner가 data.id를 남으로 하면 강퇴, 지가 지꺼쓰면퇴정
	@SubscribeMessage('leaveDm')
	async leaveChatRoomDm(socket: Socket, data: ChatRoomleaveDmDto): Promise<void> {
	
		try {
			const offerUser = socket.data.user;
			const leaveUser = await this.userService.findUserById(data.targetUserId);

			const chatRoomDm = await this.chatService.findChatRoomDmById(data.chatRoomId, ['joinedDmUser'])

			await this.chatService.leaveChatRoomDm(
				leaveUser.id,
				data.chatRoomId,
				offerUser.id
			)

			socket.to(chatRoomDm.name).emit('leave', { message: `${chatRoomDm.name}방에 ${leaveUser.username}이 / 가 나갔습니다.`, chatRoomDm, leaveUser })

			socket.leave(chatRoomDm.name)

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}



	/* --------------------------
	|				sendMessageDm			|
	---------------------------*/

	@SubscribeMessage('directMessage')
	async sendMessageDM(socket: Socket, data: ChatRoomDmMessageDto): Promise<void> {
		try {
			const chatRoomDm = await this.chatService.findChatRoomDmById(data.chatRoomId, [
				'joinedDmUser',
			]);

			const me = socket.data.user;
			const targetUser = chatRoomDm.joinedDmUser.find(
				(user) => user.user.id != socket.data.user.id,
			);

			const isBlockedUser = await this.userService.findUserById(targetUser.user.id, ['blockOfferUser'])

			if (isBlockedUser.blockOfferUser.find((user) => user.blockedUser.id == me.id)) {

				socket.emit('blocked', { message: "you are blocked user" });
				throw new HttpException('당신은 블락 유저 입니다.', HttpStatus.BAD_REQUEST)
			}

			this.server.to(chatRoomDm.name).emit('directMessage', {
				user: socket.data.user,
				targetUser: targetUser,
				message: data.message,
				chatRoomId: chatRoomDm.id,
			});
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}



}
