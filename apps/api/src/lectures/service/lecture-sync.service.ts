import { Injectable } from "@nestjs/common";
import { LectureSyncRepository } from "../repository/lecture-sync.repository";

@Injectable()
export class LectureSyncService {
  constructor(private readonly lectures: LectureSyncRepository) {}

  async sync(): Promise<void> {
    const lectures = await this.lectures.fetchLectures();
    for (const lecture of lectures) {
      await this.lectures.saveLecture(lecture);
    }
  }
}
