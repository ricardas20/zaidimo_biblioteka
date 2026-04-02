const {
  extractSteamAppId,
  scoreToMetacriticLabel,
  buildUpdatesFromSteamAppData,
  getSteamRegionList,
} = require("../utils/steamStoreApi");

describe("steamStoreApi", () => {
  test("extractSteamAppId ištraukia app id", () => {
    expect(extractSteamAppId("https://store.steampowered.com/app/271590/GTA/")).toBe(271590);
    expect(extractSteamAppId("https://playvalorant.com/")).toBeNull();
    expect(extractSteamAppId(null)).toBeNull();
  });

  test("scoreToMetacriticLabel", () => {
    expect(scoreToMetacriticLabel(95)).toBe("Universal Acclaim");
    expect(scoreToMetacriticLabel(80)).toBe("Generally Favorable");
    expect(scoreToMetacriticLabel(55)).toBe("Mixed or Average");
  });

  test("buildUpdatesFromSteamAppData — nemokamas ir kaina", () => {
    expect(
      buildUpdatesFromSteamAppData({
        is_free: true,
      })
    ).toMatchObject({ price: 0, is_free: true });

    expect(
      buildUpdatesFromSteamAppData({
        is_free: false,
        price_overview: { final: 1999, currency: "EUR" },
      })
    ).toMatchObject({ price: 19.99, is_free: false });
  });

  test("buildUpdatesFromSteamAppData — Metacritic", () => {
    const u = buildUpdatesFromSteamAppData({
      is_free: false,
      price_overview: { final: 1000 },
      metacritic: { score: 88 },
    });
    expect(u.metacritic_score).toBe(88);
    expect(u.metacritic_label).toBe("Generally Favorable");
  });

  test("buildUpdatesFromSteamAppData — nuolaida (initial / final)", () => {
    const u = buildUpdatesFromSteamAppData({
      is_free: false,
      price_overview: {
        initial: 5999,
        final: 2999,
        discount_percent: 50,
      },
    });
    expect(u.price).toBe(29.99);
    expect(u.discount_percent).toBe(50);
    expect(u.price_before_discount).toBe(59.99);
  });

  test("buildUpdatesFromSteamAppData — be nuolaidos", () => {
    const u = buildUpdatesFromSteamAppData({
      is_free: false,
      price_overview: {
        initial: 1999,
        final: 1999,
        discount_percent: 0,
      },
    });
    expect(u.discount_percent).toBe(0);
    expect(u.price_before_discount).toBeNull();
  });

  test("getSteamRegionList — be dublikatų, primary pirmas", () => {
    const prev = process.env.STEAM_CC;
    process.env.STEAM_CC = "de";
    const list = getSteamRegionList();
    expect(list[0]).toBe("de");
    expect(list.filter((x) => x === "lt").length).toBeLessThanOrEqual(1);
    process.env.STEAM_CC = prev;
  });
});
