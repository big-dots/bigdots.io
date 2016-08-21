import MacroManager from '../managers/macro-manager';

var macroManager = new MacroManager();

class InstallMacrosPage {
  constructor($el) {
    this.$el = $el;
  }

  render() {
    this.$el.html(`
      <h1>Macros</h1>
      <hr />
      <div class="container-fluid">
        <div class="row list-group"></div>
      </div>
    `);

    var availableMacros = macroManager.getAvailableMacros();

    for(let key in availableMacros) {
      var macro = availableMacros[key];
      this.$el.find('.list-group').append(`
        <div class="list-group-item list-group-item-action">
          <a href="#" class="btn btn-success pull-right install-macro" data-macro="${key}">Install</a>
          <h5 class="list-group-item-heading">${macro.name}</h5>
          <p class="list-group-item-text">${macro.description}</p>
        </div>
      `);
    }

    this.$el.find('.install-macro').click(function(ev) {
      ev.preventDefault();

      var $el = $(this),
          key = $el.data('macro'),
          config = availableMacros[key];

      macroManager.install(key, config, function() {
        $el.hide();
      });
    });

    macroManager.getInstalledMacros((macros) => {
      for(let key in macros) {
        this.$el.find(`.install-macro[data-macro=${key}]`).hide();
      }
    });
  }
}

export { InstallMacrosPage as default }
