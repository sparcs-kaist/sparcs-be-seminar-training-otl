import { demo, type Lecture } from "@mini-otl/contracts";
import { Injectable, Logger } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import { TimetableConflictException } from "../../timetable/service/timetable-conflict.exception";
import { TimetableService } from "../../timetable/service/timetable.service";
import { LectureSyncRepository } from "../repository/lecture-sync.repository";

@Injectable()
export class LectureSyncService {
  private readonly logger = new Logger(LectureSyncService.name);

  constructor(
    private readonly lectures: LectureSyncRepository,
    private readonly timetable: TimetableService,
  ) {}

  async sync() {
    const lectures = await this.lectures.fetchLectures();
    lectures.sort((a, b) => a.id - b.id);
    await this.importLectures(lectures);
  }

  @Transactional()
  private async importLectures(lectures: Lecture[]) {
    for (const lecture of lectures) {
      const isNew = await this.lectures.importLecture(lecture);
      if (!isNew) continue;

      try {
        await this.timetable.addTimetableLecture(demo.userId, lecture.id);
      } catch (error) {
        if (!(error instanceof TimetableConflictException)) throw error;
        this.logger.warn(
          `강의 ${lecture.id} 자동 담기 건너뜀: ${error.message}`,
        );
      }
    }
  }
}
