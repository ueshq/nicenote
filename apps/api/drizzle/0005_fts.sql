-- FTS5 virtual table for full-text search on notes
CREATE VIRTUAL TABLE IF NOT EXISTS `notes_fts` USING fts5(
  id UNINDEXED,
  title,
  content,
  summary
);

-- Backfill existing notes into FTS
INSERT INTO `notes_fts` (id, title, content, summary)
SELECT id, COALESCE(title, ''), COALESCE(content, ''), COALESCE(summary, '')
FROM `notes`;
