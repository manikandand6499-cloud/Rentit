import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LikeService } from './like.service';

@Controller('like')
@UseGuards(JwtAuthGuard)
export class LikeController {
  constructor(private likeService: LikeService) {}

  @Post(':propertyId')
  toggleLike(@Param('propertyId') propertyId: string, @Req() req) {
    return this.likeService.toggleLike(
      req.user.userId,
      Number(propertyId),
    );
  }

  @Get('my')
  getMyLikes(@Req() req) {
    return this.likeService.getMyLikes(req.user.userId);
  }
}