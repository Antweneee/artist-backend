import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
    // @IsString()
    // content: string;

    @IsOptional()
    @IsString()
    description?: string;
}
