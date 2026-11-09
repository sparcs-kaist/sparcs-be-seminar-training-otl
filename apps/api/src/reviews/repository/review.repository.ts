import { InjectTransaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

const reviewSelection = {
  id: true,
  lectureId: true,
  author: { select: { id: true, name: true } },
  content: true,
  createdAt: true,
  heartCount: true,
} satisfies Prisma.ReviewSelect;

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectTransaction() private readonly prisma: Prisma.TransactionClient,
  ) {}

  async findForLecture(lectureId: number, viewerId: number | undefined) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id: lectureId, deletedAt: null },
      select: {
        reviews: {
          orderBy: { id: "desc" },
          select: {
            ...reviewSelection,
            hearts:
              viewerId === undefined
                ? false
                : {
                    where: { userId: viewerId },
                    select: { userId: true },
                  },
          },
        },
      },
    });
    return (
      lecture?.reviews.map(({ hearts, ...review }) => ({
        ...review,
        heartedByMe: Boolean(hearts?.length),
      })) ?? null
    );
  }

  async create(lectureId: number, userId: number, content: string) {
    try {
      return await this.prisma.review.create({
        data: { lectureId, userId, content },
        select: reviewSelection,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        return null;
      throw error;
    }
  }

  async findAuthor(lectureId: number, reviewId: number) {
    return await this.prisma.review.findUnique({
      where: { id: reviewId, lectureId },
      select: { userId: true },
    });
  }

  async remove(reviewId: number) {
    return await this.prisma.review.deleteMany({ where: { id: reviewId } });
  }

  async addHeart(reviewId: number, userId: number) {
    return await this.prisma.reviewHeart.createMany({
      data: { reviewId, userId },
      skipDuplicates: true,
    });
  }

  async removeHeart(reviewId: number, userId: number) {
    return await this.prisma.reviewHeart.deleteMany({
      where: { reviewId, userId },
    });
  }

  async changeHeartCount(reviewId: number, delta: 1 | -1) {
    return await this.prisma.review.update({
      where: { id: reviewId },
      data: { heartCount: { increment: delta } },
    });
  }
}
