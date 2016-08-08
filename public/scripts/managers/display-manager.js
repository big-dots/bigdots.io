import Resource from '../lib/resource';

class DisplayManager {
  create(matrix, config, cb) {
    var matrixKey = firebase.database().ref('matrices').push().key,
        displayKey = firebase.database().ref('displays').push().key;

    config.matrix = matrixKey;

    new Resource().matrix(matrixKey).set(matrix).then(function() {
      new Resource().display(displayKey).set(config).then(function() {

        for (let hardwareKey in config.connectedHardware) {
          let hardwareRef = new Resource().hardware(hardwareKey)

          hardwareRef.once('value').then(function(snapshot) {
            let hardware = snapshot.val();
            
            if(hardware.display) {
              var ref = new Resource().displayConnectedHardware(hardware.display);
              var data = {};
              data[hardwareKey] = null;
              ref.update(data);
            }

            hardwareRef.update({ display: displayKey });

            cb(displayKey);
          });
        }
      });
    });
  }
}

export { DisplayManager as default }
