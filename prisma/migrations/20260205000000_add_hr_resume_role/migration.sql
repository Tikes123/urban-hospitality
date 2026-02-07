-- Add role and avatar to admin_users (run only if table exists and columns missing)
ALTER TABLE `admin_users` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'vendor';
ALTER TABLE `admin_users` ADD COLUMN `avatar` VARCHAR(191) NULL;

-- CreateTable: HR under vendor (admin_user)
CREATE TABLE `hr` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendorId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add columns to candidates
ALTER TABLE `candidates` ADD COLUMN `resumeUpdatedAt` DATETIME(3) NULL;
ALTER TABLE `candidates` ADD COLUMN `addedByHrId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `hr` ADD CONSTRAINT `hr_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `candidates` ADD CONSTRAINT `candidates_addedByHrId_fkey` FOREIGN KEY (`addedByHrId`) REFERENCES `hr`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
