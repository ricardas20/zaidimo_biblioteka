class AppConfigSingleton {
  constructor() {
    if (AppConfigSingleton.instance) {
      return AppConfigSingleton.instance;
    }
    this.config = {
      defaultSort: "score_desc",
      maxPrice: 9999,
    };
    AppConfigSingleton.instance = this;
  }

  static getInstance() {
    return new AppConfigSingleton();
  }

  get(key) {
    return this.config[key];
  }
}

module.exports = AppConfigSingleton;
