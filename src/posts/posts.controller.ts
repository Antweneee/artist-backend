import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/authentication/authentication.guard';
import { handleErrors } from 'src/utils/handle-errors';
import { CreatePostDto } from './dto/create-posts.dto';
import { Request } from 'express';
import { UpdatePostsDto } from './dto/update-posts-dto';
import { UpdateLikeDto } from './dto/update-like-dto';
import { GetPostsQueryParamsDto } from './dto/get-posts-quey-params-dto';
import { MulterStorage } from '../multer/multer.storage'; // Adjust this import as per your file structure

@ApiTags('Posts')
@UseGuards(AuthGuard)
@Controller('posts')
export class PostsController {
    constructor(private readonly postService: PostsService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file', MulterStorage))
    async create(
        @Req() req: Request,
        @Body() createArticleDto: CreatePostDto,
        @UploadedFile() file: Express.Multer.File | undefined
    ) {
        try {
            return await this.postService.create(req.user.sub, createArticleDto, file);
        } catch (err: unknown) {
            handleErrors(err);
        }
    }

    @Patch(':id/like')
    async updateLike(
        @Req() req: Request,
        @Param('id') id: String,
    ) {
        try {
            return await this.postService.updateLike(+id, req.user.sub)
        } catch (err: unknown) {
            handleErrors(err)
        }
    }

    @Patch(':id/favorite')
    async addFavorite(
        @Req() req: Request,
        @Param('id') id: String,
    ) {
        try {
            return await this.postService.addFavorite(+id, req.user.sub)
        } catch(err) {
            handleErrors(err)
        }
    }

    @Get('favorite')
    async getFavorite(
        @Req() req: Request,
    ) {
        try {
            return await this.postService.getFavorite(req.user.sub)
        } catch(err) {
            handleErrors(err)
        }
    }

    @Delete(':id/favorite')
    async removeFavorite(
        @Req() req: Request,
        @Param('id') id: String,
    ) {
        try {
            return await this.postService.removeFavorite(+id, req.user.sub)
        } catch(err) {
            handleErrors(err)
        }
    }

    @Get()
    async findAll(
        @Req() req: Request,
        @Query() query: GetPostsQueryParamsDto
    ) {
        try {
            let { author }  = query
            const { time } = query

            if (author === 'me') {
                author = req.user.sub
            }

            typeof author === 'string' && (author = +author);

            return await this.postService.findAll(
                author,
                time
            )
        } catch (err : unknown) {
            handleErrors(err);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            return await this.postService.findOne(+id)
        } catch (err : unknown) {
            handleErrors(err);
        }
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('file', MulterStorage))
    async update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updatePostDto: UpdatePostsDto,
        @UploadedFile() file?: Express.Multer.File | undefined
    ) {
        try {
            return await this.postService.update(+id, updatePostDto, req.user.sub, file)
        } catch (err : unknown) {
            handleErrors(err)
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string,) {
        try {
            return await this.postService.remove(+id)
        } catch (err : unknown) {
            handleErrors(err)
        }
    }
}
