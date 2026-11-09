import { ConfigService } from "@mini-otl/env";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export type AuthenticatedUser = { id: number };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
      algorithms: ["HS256"],
    });
  }

  validate({ sub }: { sub?: unknown }): AuthenticatedUser {
    if (typeof sub !== "number" || !Number.isSafeInteger(sub) || sub < 1) {
      throw new UnauthorizedException();
    }
    return { id: sub };
  }
}
