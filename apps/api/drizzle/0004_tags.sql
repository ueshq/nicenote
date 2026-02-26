-- Tags table
CREATE TABLE `tags` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL UNIQUE,
  `color` text,
  `created_at` text NOT NULL
);

-- Note-Tag junction table
CREATE TABLE `note_tags` (
  `note_id` text NOT NULL REFERENCES `notes`(`id`) ON DELETE CASCADE,
  `tag_id` text NOT NULL REFERENCES `tags`(`id`) ON DELETE CASCADE,
  PRIMARY KEY (`note_id`, `tag_id`)
);

CREATE INDEX `idx_note_tags_note` ON `note_tags` (`note_id`);
CREATE INDEX `idx_note_tags_tag` ON `note_tags` (`tag_id`);
