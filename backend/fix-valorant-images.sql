-- Valorant buvo su CS2 (Steam app 730) nuotraukomis — keičiame į oficialius Riot cmsassets URL.
UPDATE games SET
  header_image = 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/e742662bb4de343c3a63e16e3fbef6f9a0e9a98c-1920x1080.jpg?accountingTag=VAL',
  capsule_image = 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/e742662bb4de343c3a63e16e3fbef6f9a0e9a98c-1920x1080.jpg?accountingTag=VAL'
WHERE slug = 'valorant';

DELETE s FROM screenshots s
INNER JOIN games g ON s.game_id = g.id
WHERE g.slug = 'valorant';

INSERT INTO screenshots (game_id, image_url, alt_text)
SELECT id,
  'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/73720b5fc165c2503ded9f3b061bee9199558480-1920x1080.png?accountingTag=VAL',
  'Valorant'
FROM games WHERE slug = 'valorant';

INSERT INTO screenshots (game_id, image_url, alt_text)
SELECT id,
  'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/393b36cdbcc6c436cff076848408aea45e90ec31-1920x1081.jpg?accountingTag=VAL',
  'Valorant'
FROM games WHERE slug = 'valorant';
