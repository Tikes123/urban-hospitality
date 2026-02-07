-- CreateTable: users (job seekers)
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: user_sessions
CREATE TABLE `user_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_sessions_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddColumn: candidates.userId
ALTER TABLE `candidates` ADD COLUMN `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `candidates` ADD CONSTRAINT `candidates_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
