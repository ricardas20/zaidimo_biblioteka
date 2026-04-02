class GenreRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async listByGameId(gameId) {
    const [rows] = await this.pool.query(
      `SELECT ge.name
       FROM genres ge
       JOIN game_genres gg ON gg.genre_id = ge.id
       WHERE gg.game_id = ?
       ORDER BY ge.name`,
      [gameId]
    );
    return rows;
  }
}

module.exports = GenreRepository;
