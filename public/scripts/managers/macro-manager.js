import Resource from '../lib/resource';
import MacroLibrary from 'macro-library';

class MacroManager {
  install(key, config, cb) {
    var data = {};
    data[key] = config;

    new Resource().macros().update(data).then(function() {
      cb(key);
    });
  }

  getInstalledMacros(callback) {
    new Resource().macros().once('value').then((snapshot) => {
      callback(snapshot.val());
    });
  }

  getAvailableMacros() {
    var macroLibrary = new MacroLibrary();
    macroLibrary.registerMacros();
    return macroLibrary.availableMacros();
  }
}

export { MacroManager as default }
