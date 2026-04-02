const GameRepository = require("../../repositories/GameRepository");
const ReviewRepository = require("../../repositories/ReviewRepository");
const GenreRepository = require("../../repositories/GenreRepository");
const ScreenshotRepository = require("../../repositories/ScreenshotRepository");

class RepositoryFactory {
  static create(type, pool) {
    if (type === "game") return new GameRepository(pool);
    if (type === "review") return new ReviewRepository(pool);
    if (type === "genre") return new GenreRepository(pool);
    if (type === "screenshot") return new ScreenshotRepository(pool);
    throw new Error(`Unknown repository type: ${type}`);
  }
}

module.exports = RepositoryFactory;
