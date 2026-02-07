/*
  Warnings:

  - You are about to drop the `menu_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendor_hr_mails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendor_usage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `menu_permissions` DROP FOREIGN KEY `menu_permissions_vendorId_fkey`;

-- DropForeignKey
ALTER TABLE `vendor_hr_mails` DROP FOREIGN KEY `vendor_hr_mails_vendorId_fkey`;

-- DropForeignKey
ALTER TABLE `vendor_usage` DROP FOREIGN KEY `vendor_usage_vendorId_fkey`;

-- AlterTable
ALTER TABLE `candidates` ADD COLUMN `inactivatedByAdminUserId` INTEGER NULL,
    ADD COLUMN `inactivatedByHrId` INTEGER NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE `menu_permissions`;

-- DropTable
DROP TABLE `vendor_hr_mails`;

-- DropTable
DROP TABLE `vendor_usage`;

-- CreateTable
CREATE TABLE `custom_locations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` VARCHAR(191) NOT NULL,
    `createdByAdminUserId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `custom_locations` ADD CONSTRAINT `custom_locations_createdByAdminUserId_fkey` FOREIGN KEY (`createdByAdminUserId`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
