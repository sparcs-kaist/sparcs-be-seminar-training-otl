import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { LectureDeleteHandler } from "./presentation/lecture-delete.handler";
import { TimetableController } from "./presentation/timetable.controller";
import { TimetableRepository } from "./repository/timetable.repository";
import { TimetableService } from "./service/timetable.service";

@Module({
  imports: [AuthModule],
  controllers: [TimetableController],
  providers: [TimetableRepository, TimetableService, LectureDeleteHandler],
})
export class TimetableModule {}
