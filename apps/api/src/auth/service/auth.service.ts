import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Credentials, Session } from "@mini-otl/contracts";
import { UserRepository } from "../repository/user.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwt: JwtService,
  ) {}

  async login({ username, password }: Credentials): Promise<Session> {
    const user = await this.users.findByUsername(username);
    if (!user || user.password !== password) {
      throw new UnauthorizedException(
        "아이디 또는 비밀번호가 올바르지 않습니다.",
      );
    }

    return {
      accessToken: await this.jwt.signAsync({ sub: user.id }),
      user: { id: user.id, username: user.username, name: user.name },
    };
  }
}
