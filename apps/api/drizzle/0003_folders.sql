-- Create folders table
CREATE TABLE `folders` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `parent_id` text REFERENCES `folders`(`id`) ON DELETE CASCADE,
  `position` integer DEFAULT 0 NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

-- Add folder_id to notes
ALTER TABLE `notes` ADD COLUMN `folder_id` text REFERENCES `folders`(`id`) ON DELETE SET NULL;

-- Indexes
CREATE INDEX `idx_folders_parent` ON `folders` (`parent_id`);
CREATE INDEX `idx_notes_folder` ON `notes` (`folder_id`);
