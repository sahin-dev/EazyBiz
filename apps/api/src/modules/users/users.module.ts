import { Module } from "@nestjs/common";
import { InvitationsController, UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({ controllers: [UsersController, InvitationsController], providers: [UsersService] })
export class UsersModule {}
