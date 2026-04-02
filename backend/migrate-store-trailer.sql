-- Vienkartinė migracija: parduotuvės nuoroda ir YouTube trailerio ID.
-- Jei stulpeliai jau yra, MySQL praneš klaidą — tada praleisk atitinkamas eilutes.

ALTER TABLE games ADD COLUMN store_url VARCHAR(600) NULL AFTER metacritic_url;
ALTER TABLE games ADD COLUMN trailer_youtube_id VARCHAR(24) NULL AFTER store_url;

ALTER TABLE screenshots MODIFY image_url VARCHAR(800) NOT NULL;
