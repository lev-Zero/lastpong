import { Injectable, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository:Repository<User>,
    ){
    }

    async findUserById(id:number):Promise<User>{
        console.log("[user service] findUserById")
        return await this.userRepository.findOne({
            where:{
                id
            }
        })
    }

    async addUser(username:string):Promise<User>{
        console.log("[user service] addUser")
        const user = await this.userRepository.create({username})
        return this.userRepository.save(user);
    }

}
