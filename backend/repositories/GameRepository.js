class GameRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findAllWithStats() {
    const [rows] = await this.pool.query(
      `SELECT g.id, g.slug, g.title, g.genre, g.price, g.is_free, g.discount_percent, g.price_before_discount, g.metacritic_score, g.metacritic_label, g.header_image, g.release_date, g.store_url,
              GROUP_CONCAT(DISTINCT ge.name ORDER BY ge.name SEPARATOR ', ') AS genres,
              ROUND(AVG(r.rating), 1) AS avg_rating
       FROM games g
       LEFT JOIN game_genres gg ON gg.game_id = g.id
       LEFT JOIN genres ge ON ge.id = gg.genre_id
       LEFT JOIN reviews r ON r.game_id = g.id
       GROUP BY g.id
       ORDER BY g.metacritic_score DESC`
    );
    return rows;
  }

  async search(whereClause, params, orderBy) {
    const [rows] = await this.pool.query(
      `SELECT g.id, g.slug, g.title, g.genre, g.price, g.is_free, g.discount_percent, g.price_before_discount, g.metacritic_score, g.metacritic_label, g.header_image, g.release_date, g.store_url
       FROM games g
       LEFT JOIN game_genres gg ON gg.game_id = g.id
       LEFT JOIN genres ge ON ge.id = gg.genre_id
       WHERE ${whereClause}
       GROUP BY g.id
       ORDER BY ${orderBy}`,
      params
    );
    return rows;
  }

  async findBySlug(slug) {
    const [rows] = await this.pool.query("SELECT * FROM games WHERE slug = ?", [slug]);
    return rows[0] || null;
  }

  async listSlugsWithStoreUrl() {
    const [rows] = await this.pool.query("SELECT slug, store_url FROM games ORDER BY id");
    return rows;
  }

  /**
   * Dalinis atnaujinimas (Steam sinchronizacija): tik leidžiami stulpeliai.
   */
  async updateSteamSyncFields(slug, fields) {
    const allowed = [
      "price",
      "is_free",
      "discount_percent",
      "price_before_discount",
      "metacritic_score",
      "metacritic_label",
    ];
    const cols = [];
    const vals = [];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(fields, key) && fields[key] !== undefined) {
        cols.push(`${key}=?`);
        if (key === "is_free") {
          vals.push(fields[key] ? 1 : 0);
        } else if (key === "price_before_discount" && fields[key] === null) {
          vals.push(null);
        } else {
          vals.push(fields[key]);
        }
      }
    }
    if (!cols.length) return 0;
    vals.push(slug);
    const [result] = await this.pool.query(
      `UPDATE games SET ${cols.join(", ")} WHERE slug=?`,
      vals
    );
    return result.affectedRows;
  }

  async create(g) {
    const [result] = await this.pool.query(
      `INSERT INTO games (slug, title, genre, description, price, is_free, discount_percent, price_before_discount, metacritic_score, metacritic_label, developer, publisher, release_date, platforms, header_image, capsule_image, metacritic_url, store_url, trailer_youtube_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        g.slug, g.title, g.genre || "", g.description || "", g.price || 0, g.is_free ? 1 : 0,
        g.discount_percent ?? 0, g.price_before_discount ?? null,
        g.metacritic_score || 0, g.metacritic_label || "", g.developer || "", g.publisher || "",
        g.release_date || null, g.platforms || "", g.header_image || "", g.capsule_image || "",
        g.metacritic_url || "", g.store_url || "", g.trailer_youtube_id || null,
      ]
    );
    return result.insertId;
  }

  async updateBySlug(slug, g) {
    const [result] = await this.pool.query(
      `UPDATE games
       SET title=?, genre=?, description=?, price=?, is_free=?, discount_percent=?, price_before_discount=?, metacritic_score=?, metacritic_label=?, developer=?, publisher=?, release_date=?, platforms=?, header_image=?, capsule_image=?, metacritic_url=?, store_url=?
       WHERE slug=?`,
      [
        g.title, g.genre, g.description, g.price, g.is_free ? 1 : 0, g.discount_percent ?? 0,
        g.price_before_discount ?? null, g.metacritic_score,
        g.metacritic_label, g.developer, g.publisher, g.release_date || null, g.platforms,
        g.header_image, g.capsule_image, g.metacritic_url, g.store_url, slug,
      ]
    );
    return result.affectedRows;
  }

  async deleteBySlug(slug) {
    const [result] = await this.pool.query("DELETE FROM games WHERE slug = ?", [slug]);
    return result.affectedRows;
  }
}

module.exports = GameRepository;
