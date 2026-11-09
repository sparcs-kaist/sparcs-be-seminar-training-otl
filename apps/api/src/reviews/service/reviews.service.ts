import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import { LectureRepository } from "../../lectures/repository/lecture.repository";
import { ReviewRepository } from "../repository/review.repository";

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviews: ReviewRepository,
    private readonly lectures: LectureRepository,
  ) {}

  async findAll(lectureId: number) {
    const reviews = await this.reviews.findForLecture(lectureId);
    if (!reviews) throw new NotFoundException("개설강의를 찾을 수 없습니다.");
    return reviews;
  }

  @Transactional()
  async create(lectureId: number, userId: number, content: string) {
    await this.requireActiveLecture(lectureId);
    const review = await this.reviews.create(lectureId, userId, content);
    if (!review)
      throw new ConflictException("이 강의에 이미 작성한 리뷰가 있습니다.");
    return review;
  }

  @Transactional()
  async remove(lectureId: number, reviewId: number, userId: number) {
    await this.requireActiveLecture(lectureId);
    const authorId = await this.requireReviewAuthor(lectureId, reviewId);
    if (authorId !== userId)
      throw new ForbiddenException("본인이 작성한 리뷰만 삭제할 수 있습니다.");

    const { count } = await this.reviews.remove(reviewId);
    if (!count) throw new NotFoundException("리뷰를 찾을 수 없습니다.");
  }

  private async requireActiveLecture(lectureId: number) {
    if (!(await this.lectures.existsActive(lectureId))) {
      throw new NotFoundException("개설강의를 찾을 수 없습니다.");
    }
  }

  private async requireReviewAuthor(lectureId: number, reviewId: number) {
    const review = await this.reviews.findAuthor(lectureId, reviewId);
    if (!review) throw new NotFoundException("리뷰를 찾을 수 없습니다.");
    return review.userId;
  }
}
