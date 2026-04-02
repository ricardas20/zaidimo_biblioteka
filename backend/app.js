const express = require("express");
const path = require("path");
const cors = require("cors");
const pool = require("./db");
const AppConfigSingleton = require("./patterns/creational/AppConfigSingleton");
const RepositoryFactory = require("./patterns/creational/RepositoryFactory");
const GameQueryBuilder = require("./patterns/creational/GameQueryBuilder");
const LegacyGameAdapter = require("./patterns/structural/LegacyGameAdapter");
const GameServiceFacade = require("./patterns/structural/GameServiceFacade");
const SortStrategyContext = require("./patterns/behavioral/SortStrategy");
const EventBusObserver = require("./patterns/behavioral/EventBusObserver");
const CreateReviewCommand = require("./patterns/behavioral/CreateReviewCommand");

const app = express();
const appConfig = AppConfigSingleton.getInstance();
const gameRepository = RepositoryFactory.create("game", pool);
const reviewRepository = RepositoryFactory.create("review", pool);
const genreRepository = RepositoryFactory.create("genre", pool);
const screenshotRepository = RepositoryFactory.create("screenshot", pool);
const gameFacade = new GameServiceFacade({
  gameRepository,
  reviewRepository,
  genreRepository,
  screenshotRepository,
});
const sortContext = new SortStrategyContext();
const eventBus = new EventBusObserver();
const createReviewCommand = new CreateReviewCommand(reviewRepository, eventBus);

eventBus.subscribe("review.created", (payload) => {
  console.log(
    `[Observer] Naujas atsiliepimas sukurtas: reviewId=${payload.id}, gameId=${payload.gameId}, rating=${payload.rating}`
  );
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/api/games", async (req, res) => {
  try {
    const rows = await gameRepository.findAllWithStats();
    res.json(rows.map((r) => LegacyGameAdapter.toCardDto(r)));
  } catch (err) {
    res.status(500).json({ error: "Serverio klaida", details: err.message });
  }
});

app.get("/api/games/search", async (req, res) => {
  try {
    const {
      title = "",
      genre = "",
      minScore = 0,
      maxPrice = appConfig.get("maxPrice"),
      sort = appConfig.get("defaultSort"),
    } = req.query;

    const queryBuilder = new GameQueryBuilder()
      .withTitle(title)
      .withMinScore(minScore)
      .withMaxPrice(maxPrice)
      .withGenre(genre);
    const built = queryBuilder.buildWhereClause();
    const orderBy = sortContext.resolve(sort).orderBy();
    const rows = await gameRepository.search(built.where, built.params, orderBy);
    res.json(rows.map((r) => LegacyGameAdapter.toCardDto(r)));
  } catch (err) {
    res.status(500).json({ error: "Serverio klaida", details: err.message });
  }
});

app.get("/api/games/:slug", async (req, res) => {
  try {
    const game = await gameFacade.getGameDetailsBySlug(req.params.slug);
    if (!game) return res.status(404).json({ error: "Žaidimas nerastas" });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: "Serverio klaida", details: err.message });
  }
});

app.post("/api/games", async (req, res) => {
  try {
    const id = await gameRepository.create(req.body);
    res.status(201).json({ id, message: "Sukurtas" });
  } catch (err) {
    res.status(500).json({ error: "Serverio klaida", details: err.message });
  }
});

app.put("/api/games/:slug", async (req, res) => {
  try {
    const affectedRows = await gameRepository.updateBySlug(req.params.slug, req.body);
    if (!affectedRows) return res.status(404).json({ error: "Žaidimas nerastas" });
    res.json({ message: "Atnaujintas" });
  } catch (err) {
    res.status(500).json({ error: "Serverio klaida", details: err.message });
  }
});

app.delete("/api/games/:slug", async (req, res) => {
  try {
    const affectedRows = await gameRepository.deleteBySlug(req.params.slug);
    if (!affectedRows) return res.status(404).json({ error: "Žaidimas nerastas" });
    res.json({ message: "Ištrintas" });
  } catch (err) {
    res.status(500).json({ error: "Serverio klaida", details: err.message });
  }
});

app.get("/api/games/:slug/reviews", async (req, res) => {
  const game = await gameRepository.findBySlug(req.params.slug);
  if (!game) return res.status(404).json({ error: "Žaidimas nerastas" });
  const reviews = await reviewRepository.listByGameId(game.id);
  res.json(reviews);
});

app.post("/api/games/:slug/reviews", async (req, res) => {
  const game = await gameRepository.findBySlug(req.params.slug);
  if (!game) return res.status(404).json({ error: "Žaidimas nerastas" });
  const { author, rating, comment } = req.body;
  const id = await createReviewCommand.execute(game.id, author, rating, comment);
  res.status(201).json({ id, message: "Komentaras sukurtas" });
});

app.put("/api/reviews/:id", async (req, res) => {
  const { author, rating, comment } = req.body;
  const affectedRows = await reviewRepository.updateById(req.params.id, author, rating, comment);
  if (!affectedRows) return res.status(404).json({ error: "Komentaras nerastas" });
  res.json({ message: "Komentaras atnaujintas" });
});

app.delete("/api/reviews/:id", async (req, res) => {
  const affectedRows = await reviewRepository.deleteById(req.params.id);
  if (!affectedRows) return res.status(404).json({ error: "Komentaras nerastas" });
  res.json({ message: "Komentaras ištrintas" });
});

app.get("/games/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "games", "game.html"));
});

module.exports = app;
