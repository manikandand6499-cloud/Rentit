import {
  Controller,
  Post,
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

  @Post()
  create(@Req() req, @Body() dto: CreateVisitDto) {
  console.log("REQ USER:", req.user);

  return this.visitService.createVisit(
    req.user.userId || req.user.id, // 🔥 FIX
    dto
  );
}
}