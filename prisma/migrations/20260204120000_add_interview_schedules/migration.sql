-- CreateTable
CREATE TABLE `interview_schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidateId` INTEGER NOT NULL,
    `outletId` INTEGER NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NULL,
    `remarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `interview_schedules` ADD CONSTRAINT `interview_schedules_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `candidates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interview_schedules` ADD CONSTRAINT `interview_schedules_outletId_fkey` FOREIGN KEY (`outletId`) REFERENCES `outlets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
