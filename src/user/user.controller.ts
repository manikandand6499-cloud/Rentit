import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 👉 GET /user/me
  @Get('me')
  getMe(@Req() req) {
    return this.userService.getUser(req.user.userId);
  }

  // 👉 PUT /user/complete-profile
  @Put('complete-profile')
  completeProfile(@Req() req, @Body() body) {
    return this.userService.completeProfile(
      req.user.userId,
      body,
    );
  }
}