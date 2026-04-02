const app = require("./app");
const pool = require("./db");
const { scheduleSteamCatalogSync } = require("./services/steamCatalogSync");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`GameVault serveris veikia: http://localhost:${PORT}`);
  scheduleSteamCatalogSync(pool, {
    cc: process.env.STEAM_CC || "lt",
    l: "english",
  });
});
