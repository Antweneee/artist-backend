import { IsString } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  newUsername: string;
}
