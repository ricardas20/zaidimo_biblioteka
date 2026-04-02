class ScreenshotRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async listByGameId(gameId) {
    const [rows] = await this.pool.query(
      "SELECT image_url, alt_text FROM screenshots WHERE game_id = ? ORDER BY id",
      [gameId]
    );
    return rows;
  }
}

module.exports = ScreenshotRepository;
