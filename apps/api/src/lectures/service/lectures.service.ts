import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Transactional } from "@nestjs-cls/transactional";
import { LectureDeleteEvent } from "../events/lecture-delete.event";
import { LectureRepository } from "../repository/lecture.repository";

@Injectable()
export class LecturesService {
  constructor(
    private readonly lectures: LectureRepository,
    private readonly events: EventEmitter2,
  ) {}

  findAll() {
    return this.lectures.findActive();
  }

  @Transactional()
  async deleteLecture(id: number) {
    const result = await this.lectures.markDeleted(id);
    if (result === "missing")
      throw new NotFoundException("개설강의를 찾을 수 없습니다.");
    if (result === "already-deleted") return;

    await this.events.emitAsync(
      LectureDeleteEvent.topic,
      new LectureDeleteEvent(id),
    );
  }
}
