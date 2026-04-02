const request = require("supertest");

const mockGameRepo = {
  findAllWithStats: jest.fn(),
  search: jest.fn(),
  findBySlug: jest.fn(),
  create: jest.fn(),
  updateBySlug: jest.fn(),
  deleteBySlug: jest.fn(),
};
const mockReviewRepo = {
  listByGameId: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
  create: jest.fn(),
  getStatsByGameId: jest.fn(),
};
const mockGenreRepo = { listByGameId: jest.fn() };
const mockScreenshotRepo = { listByGameId: jest.fn() };

jest.mock("../patterns/creational/AppConfigSingleton", () => ({
  getInstance: () => ({ get: (k) => (k === "defaultSort" ? "score_desc" : 9999) }),
}));

jest.mock("../patterns/creational/RepositoryFactory", () => ({
  create: (type) => {
    if (type === "game") return mockGameRepo;
    if (type === "review") return mockReviewRepo;
    if (type === "genre") return mockGenreRepo;
    return mockScreenshotRepo;
  },
}));

const app = require("../app");

describe("app routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/games success", async () => {
    mockGameRepo.findAllWithStats.mockResolvedValue([{ id: 1, slug: "gta5" }]);
    const res = await request(app).get("/api/games");
    expect(res.statusCode).toBe(200);
    expect(res.body[0].slug).toBe("gta5");
  });

  test("GET /api/games handles failure", async () => {
    mockGameRepo.findAllWithStats.mockRejectedValue(new Error("db"));
    const res = await request(app).get("/api/games");
    expect(res.statusCode).toBe(500);
  });

  test("GET /api/games/search success", async () => {
    mockGameRepo.search.mockResolvedValue([{ id: 1, slug: "x" }]);
    const res = await request(app).get("/api/games/search?title=a&genre=b");
    expect(res.statusCode).toBe(200);
    expect(mockGameRepo.search).toHaveBeenCalled();
  });

  test("GET /api/games/:slug success and not found", async () => {
    mockGameRepo.findBySlug.mockResolvedValueOnce(null);
    let res = await request(app).get("/api/games/not-found");
    expect(res.statusCode).toBe(404);

    mockGameRepo.findBySlug.mockResolvedValueOnce({ id: 1, slug: "gta5" });
    mockReviewRepo.getStatsByGameId.mockResolvedValue({ avg_rating: 9.1, review_count: 1 });
    mockGenreRepo.listByGameId.mockResolvedValue([{ name: "RPG" }]);
    mockScreenshotRepo.listByGameId.mockResolvedValue([{ image_url: "x" }]);
    mockReviewRepo.listByGameId.mockResolvedValue([{ id: 8 }]);
    res = await request(app).get("/api/games/gta5");
    expect(res.statusCode).toBe(200);
    expect(res.body.slug).toBe("gta5");
  });

  test("POST /api/games and error", async () => {
    mockGameRepo.create.mockResolvedValueOnce(10);
    let res = await request(app).post("/api/games").send({ slug: "a", title: "A" });
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(10);

    mockGameRepo.create.mockRejectedValueOnce(new Error("err"));
    res = await request(app).post("/api/games").send({ slug: "a", title: "A" });
    expect(res.statusCode).toBe(500);
  });

  test("PUT/DELETE /api/games/:slug", async () => {
    mockGameRepo.updateBySlug.mockResolvedValueOnce(0);
    let res = await request(app).put("/api/games/a").send({});
    expect(res.statusCode).toBe(404);

    mockGameRepo.updateBySlug.mockResolvedValueOnce(1);
    res = await request(app).put("/api/games/a").send({});
    expect(res.statusCode).toBe(200);

    mockGameRepo.deleteBySlug.mockResolvedValueOnce(0);
    res = await request(app).delete("/api/games/a");
    expect(res.statusCode).toBe(404);

    mockGameRepo.deleteBySlug.mockResolvedValueOnce(1);
    res = await request(app).delete("/api/games/a");
    expect(res.statusCode).toBe(200);
  });

  test("review endpoints", async () => {
    mockGameRepo.findBySlug.mockResolvedValueOnce(null);
    let res = await request(app).get("/api/games/x/reviews");
    expect(res.statusCode).toBe(404);

    mockGameRepo.findBySlug.mockResolvedValueOnce({ id: 1 });
    mockReviewRepo.listByGameId.mockResolvedValueOnce([{ id: 1 }]);
    res = await request(app).get("/api/games/x/reviews");
    expect(res.statusCode).toBe(200);

    mockGameRepo.findBySlug.mockResolvedValueOnce(null);
    res = await request(app).post("/api/games/x/reviews").send({ rating: 8 });
    expect(res.statusCode).toBe(404);

    mockGameRepo.findBySlug.mockResolvedValueOnce({ id: 1 });
    mockReviewRepo.create.mockResolvedValueOnce(99);
    res = await request(app).post("/api/games/x/reviews").send({ author: "A", rating: 8, comment: "ok" });
    expect(res.statusCode).toBe(201);

    mockReviewRepo.updateById.mockResolvedValueOnce(0);
    res = await request(app).put("/api/reviews/1").send({ rating: 7 });
    expect(res.statusCode).toBe(404);

    mockReviewRepo.updateById.mockResolvedValueOnce(1);
    res = await request(app).put("/api/reviews/1").send({ rating: 7 });
    expect(res.statusCode).toBe(200);

    mockReviewRepo.deleteById.mockResolvedValueOnce(0);
    res = await request(app).delete("/api/reviews/1");
    expect(res.statusCode).toBe(404);

    mockReviewRepo.deleteById.mockResolvedValueOnce(1);
    res = await request(app).delete("/api/reviews/1");
    expect(res.statusCode).toBe(200);
  });
});
