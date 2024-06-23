import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { query, Request } from 'express';
import { CommentsService } from './comments.service';
import { handleErrors } from 'src/utils/handle-errors';
import { CreateCommentsDto } from './dto/create-comments-dto';
import { UpdateCommentsDto } from './dto/update-comments-dto';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/authentication/authentication.guard';
import { GetCommentsQueryParamsDto } from './dto/get-comments-query-params-dto';

@ApiTags('Comments')
@UseGuards(AuthGuard)
@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService : CommentsService) {}

    @Post()
    async create(
        @Req() req: Request,
        @Body() createCommentsDto: CreateCommentsDto,
    ) {
        try {
            return await this.commentsService.create(
                req.user.sub,
                createCommentsDto.content,
                createCommentsDto.post
            )
        } catch (err: unknown) {
            handleErrors(err)
        }
    }

    @Get()
    async findAll(
        @Req() req: Request,
        @Query() query: GetCommentsQueryParamsDto
    ) {
        const { time, post_id } = query
        try {
            return await this.commentsService.findAll(time, post_id)
        } catch (err: unknown) {
            handleErrors(err)
        }
    }

    @Get(':id')
    async findOne(
        @Req() req: Request,
        @Param('id') id: string
    ) {
        try {
            return await this.commentsService.findOne(+id)
        } catch (err: unknown) {
            handleErrors(err)
        }
    }

    @Patch(':id')
    async update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updateCommentsDto: UpdateCommentsDto,
    ) {
        try {
            return await this.commentsService.update(+id, updateCommentsDto)
        } catch (err: unknown) {
            handleErrors(err)
        }
    }

    @Delete('/user')
    async deleteAll(
        @Req() req: Request,
    ) {
        try {
            return this.commentsService.removeAll(req.user.sub)
        } catch(err) {
            handleErrors(err)
        }
    }

    @Delete(':id')
    async delete(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        try {
            return await this.commentsService.remove(+id)
        } catch (err: unknown) {
            handleErrors(err)
        }
    }
}
