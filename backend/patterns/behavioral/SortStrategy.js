class ScoreDescStrategy {
  orderBy() {
    return "g.metacritic_score DESC";
  }
}

class ScoreAscStrategy {
  orderBy() {
    return "g.metacritic_score ASC";
  }
}

class TitleAscStrategy {
  orderBy() {
    return "g.title ASC";
  }
}

class TitleDescStrategy {
  orderBy() {
    return "g.title DESC";
  }
}

class PriceAscStrategy {
  orderBy() {
    return "g.price ASC";
  }
}

class PriceDescStrategy {
  orderBy() {
    return "g.price DESC";
  }
}

class DateDescStrategy {
  orderBy() {
    return "g.release_date DESC";
  }
}

class DateAscStrategy {
  orderBy() {
    return "g.release_date ASC";
  }
}

class SortStrategyContext {
  constructor() {
    this.strategies = {
      score_desc: new ScoreDescStrategy(),
      score_asc: new ScoreAscStrategy(),
      title_asc: new TitleAscStrategy(),
      title_desc: new TitleDescStrategy(),
      price_asc: new PriceAscStrategy(),
      price_desc: new PriceDescStrategy(),
      date_desc: new DateDescStrategy(),
      date_asc: new DateAscStrategy(),
    };
  }

  resolve(sortKey) {
    return this.strategies[sortKey] || this.strategies.score_desc;
  }
}

module.exports = SortStrategyContext;
