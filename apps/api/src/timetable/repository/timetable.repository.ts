import type { Lecture } from "@mini-otl/contracts";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { lectureSelection } from "../../lectures/repository/lecture.repository";

@Injectable()
export class TimetableRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(
    userId: number,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<Lecture[]> {
    const entries = await db.timetableLecture.findMany({
      where: { userId, lecture: { deletedAt: null } },
      select: { lecture: { select: lectureSelection } },
      orderBy: [{ lecture: { code: "asc" } }, { lectureId: "asc" }],
    });
    return entries.map(({ lecture }) => lecture);
  }

  async add(userId: number, lectureId: number, db: Prisma.TransactionClient) {
    await db.timetableLecture.createMany({
      data: { userId, lectureId },
      skipDuplicates: true,
    });
  }

  async remove(userId: number, lectureId: number) {
    await this.prisma.timetableLecture.deleteMany({
      where: { userId, lectureId },
    });
  }

  async removeByLecture(lectureId: number) {
    await this.prisma.timetableLecture.deleteMany({ where: { lectureId } });
  }

  withUserSchedule(
    userId: number,
    lectureId: number,
    work: (db: Prisma.TransactionClient) => Promise<void>,
  ) {
    return this.prisma.$transaction(async db => {
      // Serialize writes for this user and coordinate with lecture retirement.
      await db.$queryRaw`SELECT id FROM User WHERE id = ${userId} FOR UPDATE`;
      await db.$queryRaw`SELECT id FROM Lecture WHERE id = ${lectureId} FOR SHARE`;
      await work(db);
    });
  }
}
