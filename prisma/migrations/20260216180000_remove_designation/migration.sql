-- AlterTable: Remove designationId from candidates
ALTER TABLE `candidates` DROP FOREIGN KEY `candidates_designationId_fkey`;
ALTER TABLE `candidates` DROP COLUMN `designationId`;

-- AlterTable: Remove designationId from job_postings and add position column
-- Drop FK first (index is used by FK), then index, then column
ALTER TABLE `job_postings` DROP FOREIGN KEY `job_postings_designationId_fkey`;
ALTER TABLE `job_postings` DROP INDEX `job_postings_designationId_outletId_key`;
ALTER TABLE `job_postings` DROP COLUMN `designationId`;
ALTER TABLE `job_postings` ADD COLUMN `position` VARCHAR(191) NOT NULL DEFAULT '';
ALTER TABLE `job_postings` ADD UNIQUE INDEX `job_postings_position_outletId_key`(`position`, `outletId`);

-- AlterTable: Remove designationId from client_requirements
ALTER TABLE `client_requirements` DROP COLUMN `designationId`;

-- DropTable: Remove designations table
DROP TABLE IF EXISTS `designations`;
