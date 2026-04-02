class GameQueryBuilder {
  constructor() {
    this.conditions = [];
    this.params = [];
  }

  withTitle(title) {
    if (title) {
      this.conditions.push("g.title LIKE ?");
      this.params.push(`%${title}%`);
    }
    return this;
  }

  withMinScore(minScore) {
    this.conditions.push("g.metacritic_score >= ?");
    this.params.push(Number(minScore || 0));
    return this;
  }

  withMaxPrice(maxPrice) {
    this.conditions.push("g.price <= ?");
    this.params.push(Number(maxPrice ?? 9999));
    return this;
  }

  withGenre(genre) {
    this.conditions.push("(? = '' OR ge.name = ?)");
    this.params.push(genre || "", genre || "");
    return this;
  }

  buildWhereClause() {
    if (!this.conditions.length) return { where: "1=1", params: this.params };
    return { where: this.conditions.join(" AND "), params: this.params };
  }
}

module.exports = GameQueryBuilder;
