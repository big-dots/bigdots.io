class Page {
  constructor() {
    this.$el = $('#page');
  }

  $(selector) {
    return this.$el.find(selector);
  }
}

export { Page as default }
