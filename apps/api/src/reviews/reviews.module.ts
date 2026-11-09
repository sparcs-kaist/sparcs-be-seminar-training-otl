import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { LecturesModule } from "../lectures/lectures.module";
import { ReviewsController } from "./presentation/reviews.controller";
import { ReviewRepository } from "./repository/review.repository";
import { ReviewsService } from "./service/reviews.service";

@Module({
  imports: [AuthModule, LecturesModule],
  controllers: [ReviewsController],
  providers: [ReviewRepository, ReviewsService],
})
export class ReviewsModule {}
