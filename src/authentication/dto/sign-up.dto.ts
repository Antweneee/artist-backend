import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  username: string;
}
