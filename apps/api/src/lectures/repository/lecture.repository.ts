import { Injectable } from "@nestjs/common";
import { InjectTransaction } from "@nestjs-cls/transactional";
import type { Prisma } from "@prisma/client";

export const lectureSelection = {
  id: true,
  code: true,
  classNo: true,
  title: true,
  titleEn: true,
  department: true,
  professor: true,
  credit: true,
  year: true,
  semester: true,
  classes: {
    orderBy: [{ day: "asc" }, { begin: "asc" }],
    select: { day: true, begin: true, end: true, room: true },
  },
} satisfies Prisma.LectureSelect;

@Injectable()
export class LectureRepository {
  constructor(
    @InjectTransaction() private readonly prisma: Prisma.TransactionClient,
  ) {}

  async findActive() {
    return await this.prisma.lecture.findMany({
      where: { deletedAt: null },
      select: lectureSelection,
      orderBy: [{ code: "asc" }, { classNo: "asc" }, { id: "asc" }],
    });
  }
}
