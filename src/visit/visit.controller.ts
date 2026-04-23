import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
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
  create(@Req() req, @Body() dto: CreateVisitDto) {
    console.log("REQ USER:", req.user);

    return this.visitService.createVisit(
      req.user.userId || req.user.id,
      dto
    );
  }

  // 🔥 GET MY VISITS (IMPORTANT)
  @Get("my")
  getMyVisits(@Req() req) {
    return this.visitService.getMyVisits(
      req.user.userId || req.user.id
    );
  }

  // 🔥 CANCEL VISIT (for frontend)
  @Patch(":id/cancel")
  cancelVisit(@Param("id") id: string) {
    return this.visitService.cancelVisit(Number(id));
  }
}