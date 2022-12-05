// import { JoinUser } from "src/chat/entity/joinUser.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { userStatus } from "../enum/user.enum";
// import { Avatar } from "./avatar.entity";
// import { Block } from "./block.entity";
// import { Friend } from "./friend.entity";

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique:true, nullable:true})
    username: string;

    @Column({default:100})
    rank: number;

    @Column({default:userStatus.OFFLINE})
    status:userStatus;

    @Column({default:null})
    token: string;

    // @OneToOne(()=>Avatar, (avatar)=> avatar.user)
    // @JoinColumn()
    // avatar:Avatar;

    // @OneToMany(()=>Block, (block)=>block.blockOfferUser)
    // blockOfferUser:Block;
    // @OneToMany(()=>Block, (block)=>block.blockedUser)
    // blockedUser:Block;

    // @OneToMany(()=>Friend, (friend)=>friend.friendOfferUser)
    // friendOfferUser:Friend;
    // @OneToMany(()=>Friend, (friend)=>friend.friend)
    // friend:Friend;

    
    // @ManyToOne(()=>JoinUser, (joinUser)=>joinUser.user)   
    // joinUser:JoinUser;


}

