const AppConfigSingleton = require("../patterns/creational/AppConfigSingleton");
const GameQueryBuilder = require("../patterns/creational/GameQueryBuilder");
const RepositoryFactory = require("../patterns/creational/RepositoryFactory");
const LegacyGameAdapter = require("../patterns/structural/LegacyGameAdapter");
const GameServiceFacade = require("../patterns/structural/GameServiceFacade");
const SortStrategyContext = require("../patterns/behavioral/SortStrategy");
const EventBusObserver = require("../patterns/behavioral/EventBusObserver");
const CreateReviewCommand = require("../patterns/behavioral/CreateReviewCommand");

describe("patterns", () => {
  test("Singleton returns same instance", () => {
    const a = AppConfigSingleton.getInstance();
    const b = AppConfigSingleton.getInstance();
    expect(a).toBe(b);
    expect(a.get("defaultSort")).toBe("score_desc");
  });

  test("Builder builds SQL clause and params", () => {
    const built = new GameQueryBuilder()
      .withTitle("GTA")
      .withMinScore(80)
      .withMaxPrice(50)
      .withGenre("RPG")
      .buildWhereClause();
    expect(built.where).toMatch(/g.title LIKE/);
    expect(built.params).toEqual(["%GTA%", 80, 50, "RPG", "RPG"]);
  });

  test("Builder fallback where when no conditions", () => {
    const empty = new GameQueryBuilder();
    empty.conditions = [];
    empty.params = [];
    const built = empty.buildWhereClause();
    expect(built.where).toBe("1=1");
    expect(built.params).toEqual([]);
  });

  test("RepositoryFactory creates known repositories and throws unknown", () => {
    const pool = {};
    expect(() => RepositoryFactory.create("game", pool)).not.toThrow();
    expect(() => RepositoryFactory.create("review", pool)).not.toThrow();
    expect(() => RepositoryFactory.create("genre", pool)).not.toThrow();
    expect(() => RepositoryFactory.create("screenshot", pool)).not.toThrow();
    expect(() => RepositoryFactory.create("x", pool)).toThrow(/Unknown repository/);
  });

  test("Adapter converts row to card DTO", () => {
    const dto = LegacyGameAdapter.toCardDto({ id: 1, slug: "gta5", title: "GTA V" });
    expect(dto).toEqual(expect.objectContaining({ id: 1, slug: "gta5", title: "GTA V" }));
  });

  test("Facade returns null when game not found", async () => {
    const facade = new GameServiceFacade({
      gameRepository: { findBySlug: jest.fn().mockResolvedValue(null) },
      reviewRepository: {},
      genreRepository: {},
      screenshotRepository: {},
    });
    await expect(facade.getGameDetailsBySlug("none")).resolves.toBeNull();
  });

  test("Facade returns composed object", async () => {
    const facade = new GameServiceFacade({
      gameRepository: { findBySlug: jest.fn().mockResolvedValue({ id: 1, slug: "gta5" }) },
      reviewRepository: {
        getStatsByGameId: jest.fn().mockResolvedValue({ avg_rating: 9.2, review_count: 2 }),
        listByGameId: jest.fn().mockResolvedValue([{ id: 1 }]),
      },
      genreRepository: { listByGameId: jest.fn().mockResolvedValue([{ name: "RPG" }]) },
      screenshotRepository: { listByGameId: jest.fn().mockResolvedValue([{ image_url: "x" }]) },
    });
    const game = await facade.getGameDetailsBySlug("gta5");
    expect(game.avg_rating).toBe(9.2);
    expect(game.genres).toEqual(["RPG"]);
    expect(game.screenshots).toHaveLength(1);
    expect(game.reviews).toHaveLength(1);
  });

  test("Strategy resolves default and explicit strategy", () => {
    const ctx = new SortStrategyContext();
    expect(ctx.resolve("price_asc").orderBy()).toBe("g.price ASC");
    expect(ctx.resolve("unknown").orderBy()).toBe("g.metacritic_score DESC");
  });

  test("Observer notifies subscribers", () => {
    const bus = new EventBusObserver();
    const fn = jest.fn();
    bus.subscribe("evt", fn);
    bus.notify("evt", { a: 1 });
    bus.notify("other", { a: 2 });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({ a: 1 });
  });

  test("Command executes and publishes event", async () => {
    const repo = { create: jest.fn().mockResolvedValue(7) };
    const bus = { notify: jest.fn() };
    const cmd = new CreateReviewCommand(repo, bus);
    const id = await cmd.execute(1, "A", 9, "ok");
    expect(id).toBe(7);
    expect(bus.notify).toHaveBeenCalledWith(
      "review.created",
      expect.objectContaining({ id: 7, gameId: 1, rating: 9 })
    );
  });
});
