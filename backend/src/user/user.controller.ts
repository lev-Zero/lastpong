import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { User } from './entity/user.entity';
import { UserService } from './service/user.service';

//localhost:3000/user
@Controller('user')
export class UserController {
    constructor(
        private readonly userService:UserService
    ){}

    
    //localhost:3000/user/id/1
    @Get('/id/:id')
    findUserbyId(@Param ('id', ParseIntPipe) userId:number):Promise<User>{
        console.log("[user controller] findUserById")
        return this.userService.findUserById(userId);
    }

    @Post('/')
    addUser(@Body() body:any):Promise<User>{
        console.log("[user controller] addUser");
        return this.userService.addUser(body.username);
    }



}
