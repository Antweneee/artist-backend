import { IsBoolean } from 'class-validator';

export class UpdateLikeDto {
    @IsBoolean()
    liking: boolean;
}
