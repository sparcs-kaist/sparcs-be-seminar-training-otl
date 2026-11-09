import { Controller, Delete, Get, HttpCode, Param } from "@nestjs/common";
import { LectureIdPipe } from "../../common/lecture-id.pipe";
import { LecturesService } from "../service/lectures.service";

@Controller("lectures")
export class LecturesController {
  constructor(private readonly lectures: LecturesService) {}

  @Get()
  findAll() {
    return this.lectures.findAll();
  }

  @Delete(":id")
  @HttpCode(204)
  deleteLecture(@Param("id", LectureIdPipe) id: number) {
    return this.lectures.deleteLecture(id);
  }
}
