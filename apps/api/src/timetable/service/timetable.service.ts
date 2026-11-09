import { Injectable, NotFoundException } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import type { ClassTime } from "@mini-otl/contracts";
import { TimetableRepository } from "../repository/timetable.repository";
import { TimetableConflictException } from "./timetable-conflict.exception";

function overlaps(a: ClassTime, b: ClassTime) {
  return a.day === b.day && a.begin < b.end && b.begin < a.end;
}

@Injectable()
export class TimetableService {
  constructor(private readonly timetable: TimetableRepository) {}

  findMine(userId: number) {
    return this.timetable.findByUser(userId);
  }

  @Transactional()
  async addTimetableLecture(userId: number, lectureId: number) {
    const lecture = await this.timetable.findActiveLecture(lectureId);
    if (!lecture) throw new NotFoundException("개설강의를 찾을 수 없습니다.");

    const scheduled = await this.timetable.findByUser(userId);
    if (scheduled.some(({ id }) => id === lectureId)) return;

    const conflict = scheduled.find(
      existing =>
        existing.year === lecture.year &&
        existing.semester === lecture.semester &&
        existing.classes.some(slot =>
          lecture.classes.some(candidate => overlaps(slot, candidate)),
        ),
    );
    if (conflict) throw new TimetableConflictException(conflict);

    await this.timetable.add(userId, lectureId);
  }

  async removeLecture(userId: number, lectureId: number) {
    await this.timetable.remove(userId, lectureId);
  }

  async removeDeletedLecture(lectureId: number) {
    await this.timetable.removeByLecture(lectureId);
  }
}
