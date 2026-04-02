class EventBusObserver {
  constructor() {
    this.listeners = {};
  }

  subscribe(eventName, listener) {
    if (!this.listeners[eventName]) this.listeners[eventName] = [];
    this.listeners[eventName].push(listener);
  }

  notify(eventName, payload) {
    const ls = this.listeners[eventName] || [];
    for (const l of ls) {
      l(payload);
    }
  }
}

module.exports = EventBusObserver;
