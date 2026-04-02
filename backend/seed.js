const pool = require("./db");
const games = require("./games-data");

async function seed() {
  console.log("Kuriamos lentelės...");

  await pool.query("DROP TABLE IF EXISTS reviews");
  await pool.query("DROP TABLE IF EXISTS game_genres");
  await pool.query("DROP TABLE IF EXISTS genres");
  await pool.query("DROP TABLE IF EXISTS screenshots");
  await pool.query("DROP TABLE IF EXISTS games");

  await pool.query(`
    CREATE TABLE games (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(200) NOT NULL,
      genre VARCHAR(200),
      description TEXT,
      price DECIMAL(10,2),
      is_free TINYINT(1) DEFAULT 0,
      discount_percent INT DEFAULT 0,
      price_before_discount DECIMAL(10,2) NULL,
      metacritic_score INT,
      metacritic_label VARCHAR(100),
      developer VARCHAR(200),
      publisher VARCHAR(200),
      release_date DATE,
      platforms VARCHAR(200),
      header_image VARCHAR(500),
      capsule_image VARCHAR(500),
      metacritic_url VARCHAR(500),
      store_url VARCHAR(600),
      trailer_youtube_id VARCHAR(24)
    )
  `);

  await pool.query(`
    CREATE TABLE screenshots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      image_url VARCHAR(800) NOT NULL,
      alt_text VARCHAR(200),
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE genres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) UNIQUE NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE game_genres (
      game_id INT NOT NULL,
      genre_id INT NOT NULL,
      PRIMARY KEY (game_id, genre_id),
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
      FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      author VARCHAR(120) NOT NULL,
      rating INT NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
      CHECK (rating >= 1 AND rating <= 10)
    )
  `);

  console.log("Įterpiami žaidimai...");
  const genreIds = new Map();

  for (const g of games) {
    const [result] = await pool.query(
      `INSERT INTO games (slug, title, genre, description, price, is_free, discount_percent, price_before_discount, metacritic_score, metacritic_label, developer, publisher, release_date, platforms, header_image, capsule_image, metacritic_url, store_url, trailer_youtube_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        g.slug,
        g.title,
        g.genre,
        g.description,
        g.price,
        g.is_free ? 1 : 0,
        g.discount_percent ?? 0,
        g.price_before_discount ?? null,
        g.metacritic_score,
        g.metacritic_label,
        g.developer,
        g.publisher,
        g.release_date,
        g.platforms,
        g.header_image,
        g.capsule_image,
        g.metacritic_url,
        g.store_url,
        g.trailer_youtube_id,
      ]
    );

    const gameId = result.insertId;

    for (const s of g.screenshots) {
      await pool.query(
        "INSERT INTO screenshots (game_id, image_url, alt_text) VALUES (?, ?, ?)",
        [gameId, s.url, s.alt]
      );
    }

    const splitGenres = String(g.genre)
      .split("/")
      .map((x) => x.trim())
      .filter(Boolean);

    for (const genreName of splitGenres) {
      let genreId = genreIds.get(genreName);
      if (!genreId) {
        const [genreResult] = await pool.query(
          "INSERT INTO genres (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
          [genreName]
        );
        genreId = genreResult.insertId;
        genreIds.set(genreName, genreId);
      }
      await pool.query(
        "INSERT IGNORE INTO game_genres (game_id, genre_id) VALUES (?, ?)",
        [gameId, genreId]
      );
    }

    await pool.query(
      "INSERT INTO reviews (game_id, author, rating, comment) VALUES (?, ?, ?, ?)",
      [
        gameId,
        "GameVault User",
        Math.max(6, Math.min(10, Math.round(g.metacritic_score / 10))),
        `${g.title} įvertinimas pagal bendrą įspūdį.`,
      ]
    );

    console.log(`  ✔ ${g.title}`);
  }

  console.log("\nDuomenų bazė sėkmingai užpildyta!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Klaida:", err);
  process.exit(1);
});
