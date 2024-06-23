import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCommentsDto {
    @IsString()
    content: string;

    @IsInt()
    post: number
}
