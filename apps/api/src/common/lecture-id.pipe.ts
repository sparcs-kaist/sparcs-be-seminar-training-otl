import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { lectureSchema } from "@mini-otl/contracts";

@Injectable()
export class LectureIdPipe implements PipeTransform<string, number> {
  transform(value: string) {
    const id = lectureSchema.shape.id.safeParse(Number(value));
    if (!/^\d+$/.test(value) || !id.success) {
      throw new BadRequestException("유효한 강의 ID를 입력해 주세요.");
    }
    return id.data;
  }
}
