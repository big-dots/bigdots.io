import Resource from '../lib/resource';

class MacroManager {
  install(key, config, cb) {
    var data = {};
    data[key] = config;

    new Resource().macros().update(data).then(function() {
      cb(key);
    });
  }

  uninstall(identifier) {

  }

  getInstalledMacros(callback) {
    new Resource().macros().once('value').then((snapshot) => {
      callback(snapshot.val());
    });
  }
}

export { MacroManager as default }
