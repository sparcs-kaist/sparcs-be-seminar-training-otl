import { Module } from "@nestjs/common";
import { LecturesController } from "./presentation/lectures.controller";
import { LectureRepository } from "./repository/lecture.repository";
import { LecturesService } from "./service/lectures.service";

@Module({
  controllers: [LecturesController],
  exports: [LectureRepository],
})
export class LecturesModule {}
