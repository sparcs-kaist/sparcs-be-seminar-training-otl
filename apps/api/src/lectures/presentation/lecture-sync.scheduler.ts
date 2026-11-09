import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { LectureSyncService } from "../service/lecture-sync.service";

@Injectable()
export class LectureSyncScheduler {
  constructor(private readonly lectures: LectureSyncService) {}

  @Cron("*/10 * * * * *", { waitForCompletion: true })
  async sync() {
    await this.lectures.sync();
  }
}
