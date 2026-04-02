const GameRepository = require("../repositories/GameRepository");
const ReviewRepository = require("../repositories/ReviewRepository");
const GenreRepository = require("../repositories/GenreRepository");
const ScreenshotRepository = require("../repositories/ScreenshotRepository");

describe("repositories", () => {
  test("GameRepository methods call pool and return expected values", async () => {
    const pool = { query: jest.fn() };
    const repo = new GameRepository(pool);

    pool.query.mockResolvedValueOnce([[{ id: 1 }]]);
    await expect(repo.findAllWithStats()).resolves.toEqual([{ id: 1 }]);

    pool.query.mockResolvedValueOnce([[{ id: 2 }]]);
    await expect(repo.search("1=1", [], "g.id DESC")).resolves.toEqual([{ id: 2 }]);

    pool.query.mockResolvedValueOnce([[{ id: 3 }]]);
    await expect(repo.findBySlug("gta5")).resolves.toEqual({ id: 3 });

    pool.query.mockResolvedValueOnce([[ ]]);
    await expect(repo.findBySlug("none")).resolves.toBeNull();

    pool.query.mockResolvedValueOnce([{ insertId: 11 }]);
    await expect(repo.create({ slug: "x", title: "X" })).resolves.toBe(11);

    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    await expect(repo.updateBySlug("x", {})).resolves.toBe(1);

    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    await expect(repo.deleteBySlug("x")).resolves.toBe(1);

    pool.query.mockResolvedValueOnce([[{ slug: "a", store_url: "https://store.steampowered.com/app/1/x/" }]]);
    await expect(repo.listSlugsWithStoreUrl()).resolves.toEqual([
      { slug: "a", store_url: "https://store.steampowered.com/app/1/x/" },
    ]);

    await expect(repo.updateSteamSyncFields("a", {})).resolves.toBe(0);

    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    await expect(
      repo.updateSteamSyncFields("a", { price: 9.99, is_free: false, metacritic_score: 90 })
    ).resolves.toBe(1);
  });

  test("ReviewRepository CRUD and stats", async () => {
    const pool = { query: jest.fn() };
    const repo = new ReviewRepository(pool);

    pool.query.mockResolvedValueOnce([[{ avg_rating: 9, review_count: 2 }]]);
    await expect(repo.getStatsByGameId(1)).resolves.toEqual({ avg_rating: 9, review_count: 2 });

    pool.query.mockResolvedValueOnce([[{ id: 1 }]]);
    await expect(repo.listByGameId(1)).resolves.toEqual([{ id: 1 }]);

    pool.query.mockResolvedValueOnce([{ insertId: 5 }]);
    await expect(repo.create(1, "A", 10, "ok")).resolves.toBe(5);

    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    await expect(repo.updateById(2, "B", 8, "upd")).resolves.toBe(1);

    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    await expect(repo.deleteById(2)).resolves.toBe(1);
  });

  test("Genre and Screenshot repositories list by game id", async () => {
    const pool = { query: jest.fn() };
    const genreRepo = new GenreRepository(pool);
    const screenshotRepo = new ScreenshotRepository(pool);

    pool.query.mockResolvedValueOnce([[{ name: "RPG" }]]);
    await expect(genreRepo.listByGameId(1)).resolves.toEqual([{ name: "RPG" }]);
    pool.query.mockResolvedValueOnce([[{ image_url: "x" }]]);
    await expect(screenshotRepo.listByGameId(1)).resolves.toEqual([{ image_url: "x" }]);
  });
});
