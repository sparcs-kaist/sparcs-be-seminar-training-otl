import {
  Controller,
  Delete,
  Get,
  NotImplementedException,
} from "@nestjs/common";
import { LecturesService } from "../service/lectures.service";

@Controller("lectures")
export class LecturesController {
  constructor(private readonly lectures: LecturesService) {}

  @Get()
  findAll() {
    return this.lectures.findAll();
  }

  @Delete(":id")
  deleteLecture() {
    // TODO(6): Authenticate the source, delete the lecture, then publish LectureDeleteEvent.
    throw new NotImplementedException("강의 삭제 이벤트 실습을 진행해 주세요.");
  }
}
