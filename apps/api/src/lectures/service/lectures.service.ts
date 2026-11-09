import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { LectureDeleteEvent } from "../events/lecture-delete.event";
import { LectureRepository } from "../repository/lecture.repository";

@Injectable()
export class LecturesService {
  constructor(
    private readonly lectures: LectureRepository,
    private readonly events: EventEmitter2,
  ) {}

  findAll() {
    return this.lectures.findAllActive();
  }

  async deleteLecture(id: number): Promise<void> {
    if (!(await this.lectures.markDeleted(id))) {
      throw new NotFoundException("개설강의를 찾을 수 없습니다.");
    }

    await this.events.emitAsync(
      LectureDeleteEvent.topic,
      new LectureDeleteEvent(id),
    );
  }
}
