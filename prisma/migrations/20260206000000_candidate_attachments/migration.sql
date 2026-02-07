-- AlterTable: add attachments column to candidates for multiple files (PDF, images)
ALTER TABLE `candidates` ADD COLUMN `attachments` TEXT NULL;
