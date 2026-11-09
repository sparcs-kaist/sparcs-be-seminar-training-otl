import { Controller, Delete, Get, HttpCode, Param } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { lectureSelection } from "../repository/lecture.repository";
import { ResourceIdPipe } from "../../common/resource-id.pipe";
import { LecturesService } from "../service/lectures.service";

@Controller("lectures")
export class LecturesController {
  constructor(
    private readonly lectures: LecturesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  findAll() {
    // TODO(01c): Move this query to the Repository and call it through the Service.
    return this.prisma.lecture.findMany({
      where: { deletedAt: null },
      select: lectureSelection,
      orderBy: [{ code: "asc" }, { classNo: "asc" }, { id: "asc" }],
    });
  }

  @Delete(":id")
  @HttpCode(204)
  deleteLecture(@Param("id", ResourceIdPipe) id: number) {
    return this.lectures.deleteLecture(id);
  }
}
