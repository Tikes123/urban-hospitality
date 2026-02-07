-- CreateTable: admin_users (vendor / super-admin login). Role and avatar added in add_hr_resume_role.
CREATE TABLE `admin_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: sessions (admin login sessions)
CREATE TABLE `sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adminUserId` INTEGER NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `deviceInfo` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `sessions` ADD CONSTRAINT `sessions_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
