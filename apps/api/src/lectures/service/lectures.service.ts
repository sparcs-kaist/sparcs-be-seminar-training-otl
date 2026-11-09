import { Injectable } from "@nestjs/common";
import { LectureRepository } from "../repository/lecture.repository";

@Injectable()
export class LecturesService {
  constructor(private readonly lectures: LectureRepository) {}

  findAll() {
    return this.lectures.findActive();
  }
}
