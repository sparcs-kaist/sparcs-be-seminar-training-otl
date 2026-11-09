import type { Prisma } from "@prisma/client";
import { lectureFeedSchema, type Lecture } from "@mini-otl/contracts";
import { ConfigService } from "@mini-otl/env";
import { Injectable } from "@nestjs/common";
import { InjectTransaction } from "@nestjs-cls/transactional";

@Injectable()
export class LectureSyncRepository {
  constructor(
    private readonly config: ConfigService,
    @InjectTransaction() private readonly prisma: Prisma.TransactionClient,
  ) {}

  async fetchLectures() {
    const sourceUrl = this.config.getOrThrow<string>("SOURCE_URL");
    const response = await fetch(`${sourceUrl}/api/lectures`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok)
      throw new Error(`Source returned HTTP ${response.status}`);
    return lectureFeedSchema.parse(await response.json());
  }

  async importLecture({ id, classes, ...fields }: Lecture) {
    const existing = await this.prisma.lecture.findUnique({
      where: { id },
      select: { deletedAt: true },
    });
    if (existing?.deletedAt) return false;

    if (existing) {
      await this.prisma.lecture.update({ where: { id }, data: fields });
      await this.prisma.classTime.deleteMany({ where: { lectureId: id } });
    } else {
      await this.prisma.lecture.create({ data: { id, ...fields } });
    }

    if (classes.length > 0) {
      await this.prisma.classTime.createMany({
        data: classes.map(slot => ({ lectureId: id, ...slot })),
      });
    }
    return existing === null;
  }
}
