import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsMeOrUserId } from 'src/decorators/validators/IsMeOrUserId';

export class GetPostsQueryParamsDto {
    @ApiProperty({
        name: 'author',
        type: 'number or me',
        required: false
    })
    @IsOptional()
    @IsMeOrUserId()
    author?: number | 'me';

    @IsOptional()
    @IsString()
    time?: 'newest' | 'oldest';
}
