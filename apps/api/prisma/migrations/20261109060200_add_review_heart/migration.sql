-- AlterTable
ALTER TABLE `review` ADD COLUMN `heart_count` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `review_heart` (
    `reviewId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `review_heart_userId_idx`(`userId`),
    PRIMARY KEY (`reviewId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `review_heart` ADD CONSTRAINT `review_heart_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_heart` ADD CONSTRAINT `review_heart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
