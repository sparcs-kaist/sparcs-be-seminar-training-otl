import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
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
    _lectureId: number,
    _reviewId: number,
    _userId: number,
  ): Promise<void> {
    // TODO(07c): Verify authorship before deleting the review.
    throw new NotImplementedException("리뷰 삭제를 구현해 주세요.");
  }

  async setHeart(
    _lectureId: number,
    _reviewId: number,
    _userId: number,
    _hearted: boolean,
  ): Promise<void> {
    // TODO(08b): Add or remove the heart and update its count in one transaction.
    throw new NotImplementedException("리뷰 하트를 구현해 주세요.");
  }

  private async requireActiveLecture(lectureId: number) {
    if (!(await this.lectures.existsActive(lectureId))) {
      throw new NotFoundException("개설강의를 찾을 수 없습니다.");
    }
  }
}
