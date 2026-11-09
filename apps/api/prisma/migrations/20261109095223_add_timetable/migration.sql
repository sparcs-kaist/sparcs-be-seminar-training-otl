-- CreateTable
CREATE TABLE `TimetableLecture` (
    `userId` INTEGER NOT NULL,
    `lectureId` INTEGER NOT NULL,

    INDEX `TimetableLecture_lectureId_idx`(`lectureId`),
    PRIMARY KEY (`userId`, `lectureId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TimetableLecture` ADD CONSTRAINT `TimetableLecture_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimetableLecture` ADD CONSTRAINT `TimetableLecture_lectureId_fkey` FOREIGN KEY (`lectureId`) REFERENCES `Lecture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
