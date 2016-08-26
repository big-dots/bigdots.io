import Resource from '../lib/resource';

class UserManager {
  create(matrix, config, cb) {
    var matrixKey = firebase.database().ref('matrices').push().key,
        displayKey = firebase.database().ref('displays').push().key;

    new Resource().matrix(matrixKey).set(matrix).then(function() {
      new Resource().display(displayKey).set(config).then(function() {
        cb(displayKey);
      });
    });
  }

  getDisplay(key, callback) {
    new Resource().display(key).once('value').then(function(snapshot) {
      callback(snapshot.val());
    });
  }

  updateIdentity(key, identity, cb) {
    new Resource().userIdentity(key).update(identity).then(function() {
      cb();
    });
  }
}

export { UserManager as default }
