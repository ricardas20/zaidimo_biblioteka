class ReviewRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async getStatsByGameId(gameId) {
    const [[row]] = await this.pool.query(
      "SELECT ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count FROM reviews WHERE game_id = ?",
      [gameId]
    );
    return row;
  }

  async listByGameId(gameId) {
    const [rows] = await this.pool.query(
      "SELECT id, author, rating, comment, created_at FROM reviews WHERE game_id = ? ORDER BY created_at DESC",
      [gameId]
    );
    return rows;
  }

  async create(gameId, author, rating, comment) {
    const [result] = await this.pool.query(
      "INSERT INTO reviews (game_id, author, rating, comment) VALUES (?, ?, ?, ?)",
      [gameId, author || "Anonimas", Number(rating), comment || ""]
    );
    return result.insertId;
  }

  async updateById(id, author, rating, comment) {
    const [result] = await this.pool.query(
      "UPDATE reviews SET author = ?, rating = ?, comment = ? WHERE id = ?",
      [author, Number(rating), comment, id]
    );
    return result.affectedRows;
  }

  async deleteById(id) {
    const [result] = await this.pool.query("DELETE FROM reviews WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = ReviewRepository;
