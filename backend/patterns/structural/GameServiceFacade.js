class GameServiceFacade {
  constructor({ gameRepository, reviewRepository, genreRepository, screenshotRepository }) {
    this.gameRepository = gameRepository;
    this.reviewRepository = reviewRepository;
    this.genreRepository = genreRepository;
    this.screenshotRepository = screenshotRepository;
  }

  async getGameDetailsBySlug(slug) {
    const game = await this.gameRepository.findBySlug(slug);
    if (!game) return null;

    const rating = await this.reviewRepository.getStatsByGameId(game.id);
    const genres = await this.genreRepository.listByGameId(game.id);
    const screenshots = await this.screenshotRepository.listByGameId(game.id);
    const reviews = await this.reviewRepository.listByGameId(game.id);

    return {
      ...game,
      avg_rating: rating.avg_rating,
      review_count: rating.review_count,
      genres: genres.map((g) => g.name),
      screenshots,
      reviews,
    };
  }
}

module.exports = GameServiceFacade;
