import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { VisitService } from "./visit.service";
import { CreateVisitDto } from "./dto/create-visit.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("visit")
@UseGuards(JwtAuthGuard)
export class VisitController {
  constructor(private visitService: VisitService) {}

  // 🔥 CREATE VISIT
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: any, @Body() dto: CreateVisitDto) {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      throw new Error("User not found in request"); // 🔥 safety
    }

    return this.visitService.createVisit(userId, dto);
  }

  // 🔥 GET MY VISITS
  @Get("my")
  @HttpCode(HttpStatus.OK)
  getMyVisits(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      throw new Error("User not found in request");
    }

    return this.visitService.getMyVisits(userId);
  }

  // 🔥 CANCEL VISIT
  @Patch(":id/cancel")
  @HttpCode(HttpStatus.OK)
  cancelVisit(@Param("id", ParseIntPipe) id: number) {
    return this.visitService.cancelVisit(id);
  }
}