import { Controller, Delete, Get, HttpCode, Param } from "@nestjs/common";
import { ResourceIdPipe } from "../../common/resource-id.pipe";
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
  deleteLecture(@Param("id", ResourceIdPipe) id: number) {
    return this.lectures.deleteLecture(id);
  }
}
