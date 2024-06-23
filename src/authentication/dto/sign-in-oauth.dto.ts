import { IsString } from "class-validator";

export class SignInOAuthDto {
    @IsString()
    token: string;
}
