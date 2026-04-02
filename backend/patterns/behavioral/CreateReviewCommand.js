class CreateReviewCommand {
  constructor(reviewRepository, eventBus) {
    this.reviewRepository = reviewRepository;
    this.eventBus = eventBus;
  }

  async execute(gameId, author, rating, comment) {
    const id = await this.reviewRepository.create(gameId, author, rating, comment);
    this.eventBus.notify("review.created", { id, gameId, author, rating });
    return id;
  }
}

module.exports = CreateReviewCommand;
