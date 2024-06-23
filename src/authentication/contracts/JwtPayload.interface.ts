import { JwtType } from '../enums/JwtType.enum';

export interface JwtPayload {
  sub: number;
  exp: number;
  jti: string;
  iat: number;
  type: JwtType;
  refreshJti?: string;
}
