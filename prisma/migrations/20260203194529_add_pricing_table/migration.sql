-- CreateTable
CREATE TABLE `pricing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `yearlyVendorPrice` DOUBLE NOT NULL DEFAULT 6000,
    `hrMailPrice` DOUBLE NOT NULL DEFAULT 2000,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
