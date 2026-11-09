import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { LectureRepository } from "../../lectures/repository/lecture.repository";
import { ReviewRepository } from "../repository/review.repository";

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviews: ReviewRepository,
    private readonly lectures: LectureRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(lectureId: number, viewerId?: number) {
    await this.requireActiveLecture(lectureId);
    return this.reviews.findForLecture(lectureId, viewerId);
  }

  async create(lectureId: number, userId: number, content: string) {
    await this.requireActiveLecture(lectureId);
    const review = await this.reviews.create(lectureId, userId, content);
    if (!review) {
      throw new ConflictException("이 강의에 이미 작성한 리뷰가 있습니다.");
    }
    return review;
  }

  async remove(
    lectureId: number,
    reviewId: number,
    userId: number,
  ): Promise<void> {
    await this.requireActiveLecture(lectureId);
    const review = await this.reviews.findAuthor(lectureId, reviewId);
    if (!review) throw new NotFoundException("리뷰를 찾을 수 없습니다.");
    if (review.userId !== userId) {
      throw new ForbiddenException("본인이 작성한 리뷰만 삭제할 수 있습니다.");
    }

    const { count } = await this.reviews.remove(reviewId);
    if (!count) throw new NotFoundException("리뷰를 찾을 수 없습니다.");
  }

  async setHeart(
    lectureId: number,
    reviewId: number,
    userId: number,
    hearted: boolean,
  ): Promise<void> {
    await this.requireActiveLecture(lectureId);
    await this.prisma.$transaction(async db => {
      const review = await this.reviews.findAuthorForHeart(
        lectureId,
        reviewId,
        db,
      );
      if (!review) throw new NotFoundException("리뷰를 찾을 수 없습니다.");
      if (review.userId === userId) {
        throw new ForbiddenException(
          "본인이 작성한 리뷰에는 하트를 누를 수 없습니다.",
        );
      }

      const { count } = hearted
        ? await this.reviews.addHeart(reviewId, userId, db)
        : await this.reviews.removeHeart(reviewId, userId, db);
      if (count > 0) {
        await this.reviews.changeHeartCount(reviewId, hearted ? 1 : -1, db);
      }
    });
  }

  private async requireActiveLecture(lectureId: number) {
    if (!(await this.lectures.existsActive(lectureId))) {
      throw new NotFoundException("개설강의를 찾을 수 없습니다.");
    }
  }
}
