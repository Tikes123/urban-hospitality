-- Candidate: use single full name, make email optional
-- Backfill name from firstName + lastName where needed
UPDATE `candidates` SET `name` = TRIM(CONCAT(IFNULL(`firstName`, ''), ' ', IFNULL(`lastName`, ''))) WHERE `name` = '' OR `name` IS NULL;

ALTER TABLE `candidates` DROP COLUMN `firstName`;
ALTER TABLE `candidates` DROP COLUMN `lastName`;
ALTER TABLE `candidates` MODIFY COLUMN `email` VARCHAR(191) NULL;
