-- AlterTable
ALTER TABLE `clients` ADD COLUMN `contractFile` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `client_requirements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `outletId` INTEGER NULL,
    `designationId` INTEGER NULL,
    `designation` VARCHAR(191) NOT NULL,
    `numberOfOpenings` INTEGER NOT NULL,
    `gender` VARCHAR(191) NULL,
    `minSalary` DOUBLE NULL,
    `maxSalary` DOUBLE NULL,
    `perks` TEXT NOT NULL,
    `bothAvailable` VARCHAR(191) NULL,
    `jdFile` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `remark` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `client_requirements` ADD CONSTRAINT `client_requirements_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `client_requirements` ADD CONSTRAINT `client_requirements_outletId_fkey` FOREIGN KEY (`outletId`) REFERENCES `outlets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
