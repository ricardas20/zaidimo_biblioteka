const { searchByTitle, filterByGenre, sortByScore } = require("../utils/collectionUtils");

describe("collection utils", () => {
  const data = [
    { title: "Apex Legends", genre: "Šaudyklė", metacritic_score: 88 },
    { title: "Hades", genre: "Roguelike", metacritic_score: 93 },
    { title: "Portal 2", genre: "Galvosūkis", metacritic_score: 95 },
  ];

  test.each([
    ["portal", 1],
    ["apex", 1],
    ["x", 1],
  ])("searchByTitle('%s')", (q, expected) => {
    expect(searchByTitle(data, q)).toHaveLength(expected);
  });

  test("filterByGenre returns matched entries", () => {
    const out = filterByGenre(data, "šaudyklė");
    expect(out[0].title).toBe("Apex Legends");
  });

  test("sortByScore desc sorts correctly", () => {
    const out = sortByScore(data, "desc");
    expect(out.map((x) => x.metacritic_score)).toEqual([95, 93, 88]);
  });

  test("throws on invalid input", () => {
    expect(() => searchByTitle(null, "x")).toThrow("items must be an array");
  });

  test("performance sanity", () => {
    const big = Array.from({ length: 10000 }, (_, i) => ({
      title: `Game ${i}`,
      genre: i % 2 ? "A" : "B",
      metacritic_score: i % 100,
    }));
    const t1 = performance.now();
    const out = sortByScore(big, "asc");
    const t2 = performance.now();
    expect(out).toHaveLength(10000);
    expect(t2 - t1).toBeLessThan(150);
  });
});
