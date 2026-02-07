CREATE TABLE `admin_user_menu_permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adminUserId` INTEGER NOT NULL,
    `menuKey` VARCHAR(191) NOT NULL,
    `allowed` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_user_menu_permissions_adminUserId_menuKey_key`(`adminUserId`, `menuKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `admin_user_menu_permissions` ADD CONSTRAINT `admin_user_menu_permissions_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
