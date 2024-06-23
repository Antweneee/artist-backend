import { IsStrongPassword } from 'class-validator';

export class UpdatePasswordDto {
  @IsStrongPassword()
  oldPassword: string;

  @IsStrongPassword()
  newPassword: string;
}
