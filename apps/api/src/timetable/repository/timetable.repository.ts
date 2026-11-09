import type { Prisma } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { InjectTransaction } from "@nestjs-cls/transactional";
import { lectureSelection } from "../../lectures/repository/lecture.repository";

@Injectable()
export class TimetableRepository {
  constructor(
    @InjectTransaction() private readonly prisma: Prisma.TransactionClient,
  ) {}

  async findActiveLecture(id: number) {
    return await this.prisma.lecture.findUnique({
      where: { id, deletedAt: null },
      select: lectureSelection,
    });
  }

  async findByUser(userId: number) {
    const entries = await this.prisma.timetableLecture.findMany({
      where: { userId, lecture: { deletedAt: null } },
      select: { lecture: { select: lectureSelection } },
      orderBy: [{ lecture: { code: "asc" } }, { lectureId: "asc" }],
    });
    return entries.map(({ lecture }) => lecture);
  }

  async add(userId: number, lectureId: number) {
    return await this.prisma.timetableLecture.createMany({
      data: { userId, lectureId },
      skipDuplicates: true,
    });
  }

  async remove(userId: number, lectureId: number) {
    return await this.prisma.timetableLecture.deleteMany({
      where: { userId, lectureId },
    });
  }
}
