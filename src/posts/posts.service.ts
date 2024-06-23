import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-posts.dto';
import { UpdatePostsDto } from './dto/update-posts-dto';
import { Storage } from '@google-cloud/storage';
import { format } from 'util';
import { handleErrors } from 'src/utils/handle-errors';
import { extname } from 'path';

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(author: number, post: CreatePostDto, file : Express.Multer.File | undefined) {
        const tmpPost = await this.prisma.posts.create({
            data: {
                author: { connect: { id: author } },
                content: "",
                desc: post.description ? post.description : ""
            }
        })

        const contentUrl = await this.uploadToGcpBucket(file, author, tmpPost.id)

        if (contentUrl == "failed") {
            handleErrors("GCP upload failed")
        } 

        return this.prisma.posts.update({
            where: { id: tmpPost.id},
            data: {
                content: contentUrl
            }
        })
    };

    async findAll(
        authorId?: number,
        time?: string
    ) {
        const order = time === 'newest' ? 'desc' : 'asc'; 

        return await this.prisma.posts.findMany({
            where: {
                authorId
            },
            include: {
                comments: true,
                likes: true,
                favorite: true,
                author: true
            },
            orderBy: {
                createdAt: order
            }
        });
    }

    async updateLike(id: number, userId: number) {
        const post = await this.prisma.posts.findUniqueOrThrow({
            where: { id },
            select: {
                likes: {
                    select: {
                        id: true,
                    }
                }
            }
        })

        const userHasLiked = post.likes.some(like => like.id === userId);

        if (userHasLiked) {
            return await this.prisma.posts.update({
                where: { id },
                data: {
                    likes: { disconnect: { id: userId } },
                    likeCounter: { decrement: 1 }
                },
                include: {
                    author: true,
                    comments: true,
                    likes: true,
                }
            })
        } else {
            return await this.prisma.posts.update({
                where: { id },
                data: {
                    likes: { connect: { id: userId } },
                    likeCounter: { increment: 1 }
                },
                include: {
                    author: true,
                    comments: true,
                    likes: true,
                }
            })
        }

    }

    async addFavorite(id : number, user_id: number) {
        return await this.prisma.user.update({
            where: { id: user_id },
            data: {
                favorite: { connect: { id }}
            }
        })
    }

    async getFavorite(user_id: number) {
        const user =  await this.prisma.user.findFirstOrThrow({
            where: { id: user_id},
            include: {
                favorite: true
            }
        })

        return user.favorite
    }

    async removeFavorite(id : number, user_id: number) {
        return await this.prisma.user.update({
            where: { id: user_id },
            data: {
                favorite: { disconnect: { id }}
            }
        })
    }

    async findOne(id : number) {
        return await this.prisma.posts.findUniqueOrThrow({
            where: { id },
            include: {
                author: true,
                comments: true,
                likes: true,
            }
        })
    }

    async update(id : number, postUpdate : UpdatePostsDto, author_id: number, file?: Express.Multer.File) {
        const contentUrl =  await this.uploadToGcpBucket(file, author_id, id)

        return await this.prisma.posts.update({
            where: { id },
            data: {
                content: contentUrl,
                desc: postUpdate.description
            }
        })
    }

    async remove(id: number) {
        const post = await this.findOne(id)

        await this.prisma.comments.deleteMany({
            where: { post_id: post.id }
        })

        return await this.prisma.posts.delete({
            where: { id }
        })
    }

    async uploadToGcpBucket(file: Express.Multer.File, author_id : number, post_id: number) : Promise<string> {
        const cloudStorage = new Storage({
            keyFilename: `gcp_credentials.json`,
            projectId: "personalprojects-426620",
        });

        const bucketName = "taker-test-project";
        const bucket = cloudStorage.bucket(bucketName);

        const ext =  extname(file.originalname);
        
        file.originalname = `${author_id}_${post_id}${ext}`;

        const blob = bucket.file(file.originalname);
        const blobStream = blob.createWriteStream();

        blobStream.on("error", (err) => {
            handleErrors(err)
        });

        const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);

        blobStream.on("finish", async () => {
            try {
            } catch (err) {
                handleErrors(err)
            }
        });

        blobStream.end(file.buffer);
        return publicUrl
    }
}
