class Modal {
  constructor($el) {
    this.$el = $el;
  }

  $(selector) {
    return this.$el.find(selector);
  }
}

export { Modal as default }
