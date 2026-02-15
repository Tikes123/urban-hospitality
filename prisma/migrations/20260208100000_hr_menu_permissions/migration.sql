-- CreateTable
CREATE TABLE `hr_menu_permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hrId` INTEGER NOT NULL,
    `menuKey` VARCHAR(191) NOT NULL,
    `allowed` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hr_menu_permissions_hrId_menuKey_key`(`hrId`, `menuKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hr_menu_permissions` ADD CONSTRAINT `hr_menu_permissions_hrId_fkey` FOREIGN KEY (`hrId`) REFERENCES `hr`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
