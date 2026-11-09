import type { ClassTime, Lecture } from "@mini-otl/contracts";
import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { LectureRepository } from "../../lectures/repository/lecture.repository";
import { TimetableRepository } from "../repository/timetable.repository";
import { TimetableConflictException } from "./timetable-conflict.exception";

function overlaps(a: ClassTime, b: ClassTime) {
  return a.day === b.day && a.begin < b.end && b.begin < a.end;
}

@Injectable()
export class TimetableService {
  constructor(
    private readonly timetable: TimetableRepository,
    private readonly lectures: LectureRepository,
  ) {}

  findMine(userId: number): Promise<Lecture[]> {
    return this.timetable.findByUser(userId);
  }

  addTimetableLecture(userId: number, lectureId: number) {
    return this.timetable.withUserSchedule(userId, lectureId, db =>
      this.addIfAvailable(userId, lectureId, db),
    );
  }

  private async addIfAvailable(
    userId: number,
    lectureId: number,
    db: Prisma.TransactionClient,
  ): Promise<void> {
    const lecture = await this.lectures.findActive(lectureId, db);
    if (!lecture) {
      throw new NotFoundException("개설강의를 찾을 수 없습니다.");
    }

    const scheduled = await this.timetable.findByUser(userId, db);
    if (scheduled.some(existing => existing.id === lectureId)) return;

    const conflict = scheduled.find(
      existing =>
        existing.year === lecture.year &&
        existing.semester === lecture.semester &&
        existing.classes.some(slot =>
          lecture.classes.some(candidate => overlaps(slot, candidate)),
        ),
    );
    if (conflict) throw new TimetableConflictException(conflict);

    await this.timetable.add(userId, lectureId, db);
  }

  removeLecture(userId: number, lectureId: number): Promise<void> {
    return this.timetable.remove(userId, lectureId);
  }

  removeDeletedLecture(lectureId: number) {
    return this.timetable.removeByLecture(lectureId);
  }
}
