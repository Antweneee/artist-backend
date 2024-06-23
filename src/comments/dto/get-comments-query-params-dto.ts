import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetCommentsQueryParamsDto {
    @IsOptional()
    @IsString()
    time?: 'newest' | 'oldest';

    @IsOptional()
    @IsNumber()
    post_id: number
}
