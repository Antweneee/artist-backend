import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentsDto } from './dto/create-comments-dto';
import { UpdateCommentsDto } from './dto/update-comments-dto';

@Injectable()
export class CommentsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        author : number,
        content: string,
        post : number
    ) { 
        const comments = await this.prisma.comments.create({
            data: {
                content: content,
                author: { connect: { id: author } },
                post: {connect: { id: post }}
            }
        })

        await this.prisma.posts.update({
            where: { id: post },
            data: {
                commentCounter: { increment: 1 }
            }
        })

        return comments
    }

    async findAll(
        time? : string,
        post_id? : number
    ) {
        const order = time === 'newest' ? 'desc' : 'asc'; 

        return await this.prisma.comments.findMany({
            where: { post_id },
            include: {
                author: true,
                post: true
            },
            orderBy: {
                createdAt: order
            }
        })
    }

    async findOne(id: number) {
        return await this.prisma.comments.findUniqueOrThrow({
            where: { id },
            include: { 
                author: true,
                post: true
            }
        })
    }

    async update(id: number, updateCommentDto : UpdateCommentsDto) {
        return await this.prisma.comments.update({
            where: { id },
            data: {
                content: updateCommentDto.content
            }
        })
    }

    async removeAll(user: number) {
        const posts = await this.prisma.comments.findMany({
            where: {authorId: user}
        })

        posts.forEach(async (post) => {
            await this.prisma.posts.update({
                where: {id: post.id},
                data: {
                    commentCounter: { decrement: 1 }
                }
            })
        });

        return this.prisma.comments.deleteMany({
            where: { authorId: user }
        })
    }

    async remove(id: number) {
        const post = await this.findOne(id)

        await this.prisma.posts.update({
            where: { id: post.post_id },
            data: {
                commentCounter: { decrement: 1 }
            }
        })

        return this.prisma.comments.delete({
            where: { id }
        })
    }
}
