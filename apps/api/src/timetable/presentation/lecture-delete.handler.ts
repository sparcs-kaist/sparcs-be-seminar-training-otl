import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { LectureDeleteEvent } from "../../lectures/events/lecture-delete.event";
import { TimetableService } from "../service/timetable.service";

@Injectable()
export class LectureDeleteHandler {
  constructor(private readonly timetable: TimetableService) {}

  @OnEvent(LectureDeleteEvent.topic, { suppressErrors: false })
  async handle({ lectureId }: LectureDeleteEvent) {
    await this.timetable.removeDeletedLecture(lectureId);
  }
}
