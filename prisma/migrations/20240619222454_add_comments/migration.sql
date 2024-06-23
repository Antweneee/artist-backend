/*
  Warnings:

  - You are about to drop the column `totalViews` on the `Posts` table. All the data in the column will be lost.
  - Added the required column `content` to the `Posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desc` to the `Posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Posts" DROP COLUMN "totalViews",
ADD COLUMN     "commentCounter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "desc" TEXT NOT NULL,
ADD COLUMN     "likeCounter" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Comments" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "post_id" INTEGER NOT NULL,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FavoritePosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FavoritePosts_AB_unique" ON "_FavoritePosts"("A", "B");

-- CreateIndex
CREATE INDEX "_FavoritePosts_B_index" ON "_FavoritePosts"("B");

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavoritePosts" ADD CONSTRAINT "_FavoritePosts_A_fkey" FOREIGN KEY ("A") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavoritePosts" ADD CONSTRAINT "_FavoritePosts_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
