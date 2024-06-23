import { IsEmail } from 'class-validator';

export class UpdateEmailDto {
  @IsEmail()
  newEmail: string;
}
