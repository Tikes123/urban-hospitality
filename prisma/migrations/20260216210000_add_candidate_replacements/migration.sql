-- CreateTable
CREATE TABLE `candidate_replacements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `replacedCandidateId` INTEGER NOT NULL,
    `replacementCandidateId` INTEGER NOT NULL,
    `outletId` INTEGER NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `replacedHrId` INTEGER NULL,
    `replacementHrId` INTEGER NULL,
    `dateOfJoining` DATETIME(3) NOT NULL,
    `exitDate` DATETIME(3) NOT NULL,
    `salary` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CandidateReplacement_replacedCandidateId_idx`(`replacedCandidateId`),
    INDEX `CandidateReplacement_replacementCandidateId_idx`(`replacementCandidateId`),
    INDEX `CandidateReplacement_outletId_idx`(`outletId`),
    INDEX `CandidateReplacement_replacedHrId_idx`(`replacedHrId`),
    INDEX `CandidateReplacement_replacementHrId_idx`(`replacementHrId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `candidate_replacements` ADD CONSTRAINT `CandidateReplacement_replacedCandidateId_fkey` FOREIGN KEY (`replacedCandidateId`) REFERENCES `candidates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidate_replacements` ADD CONSTRAINT `CandidateReplacement_replacementCandidateId_fkey` FOREIGN KEY (`replacementCandidateId`) REFERENCES `candidates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidate_replacements` ADD CONSTRAINT `CandidateReplacement_outletId_fkey` FOREIGN KEY (`outletId`) REFERENCES `outlets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidate_replacements` ADD CONSTRAINT `CandidateReplacement_replacedHrId_fkey` FOREIGN KEY (`replacedHrId`) REFERENCES `hr`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidate_replacements` ADD CONSTRAINT `CandidateReplacement_replacementHrId_fkey` FOREIGN KEY (`replacementHrId`) REFERENCES `hr`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
