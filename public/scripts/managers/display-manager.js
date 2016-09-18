import Resource from '../lib/resource';

class DisplayManager {
  create(matrix, config, uid, cb) {
    var matrixKey = firebase.database().ref('matrices').push().key,
        displayKey = firebase.database().ref('displays').push().key;

    new Resource().matrix(matrixKey).set(matrix).then(function() {

      config.matrix = matrixKey;
      config.owners = {}
      config.owners[uid] = true;
      
      new Resource().display(displayKey).set(config).then(function() {
        var data = {};
        data[displayKey] = true;

        new Resource().userDisplays(uid).update(data).then(function() {
          cb(displayKey);
        });
      });
    });
  }

  getUserDisplays(uid, callback) {
    new Resource().userDisplays(uid).once('value').then((snapshot) => {
      var displayKeys = Object.keys(snapshot.val()),
          assembledDisplays = [];

      displayKeys.forEach((displayKey) => {
        this.getDisplay(displayKey, (displayData) => {
          assembledDisplays.push(displayData);

          if(assembledDisplays.length == displayKeys.length) {
            callback(displayKeys, assembledDisplays);
          }
        });
      });
    });
  }

  getOwners(key, callback) {
    new Resource().displayOwners(key).once('value').then((snapshot) => {
      var userKeys = Object.keys(snapshot.val()),
          assembledUsers = [];

      userKeys.forEach((userKey) => {
        new Resource().userIdentity(userKey).once('value').then((identity) => {
          assembledUsers.push(identity.val());

          if(assembledUsers.length == userKeys.length) {
            callback(userKeys, assembledUsers);
          }
        });
      });
    });
  }

  getDisplay(key, callback) {
    new Resource().display(key).once('value').then(function(snapshot) {
      callback(snapshot.val());
    });
  }

  getDisplay(key, callback) {
    new Resource().display(key).once('value').then(function(snapshot) {
      callback(snapshot.val());
    });
  }

  update(key, config, cb) {
    new Resource().display(key).update(config).then(function() {
      cb();
    });
  }
}

export { DisplayManager as default }
