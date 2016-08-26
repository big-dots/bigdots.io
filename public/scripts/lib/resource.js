class Resource {
  matrix(id) {
    return firebase.database().ref(`matrices/${id}`);
  }

  matrixPixel(id, y, x) {
    return firebase.database().ref(`matrices/${id}/${y}:${x}`);
  }

  displays() {
    return firebase.database().ref('displays');
  }

  display(id) {
    return firebase.database().ref(`displays/${id}`);
  }

  displayConnectedHardware(id) {
    return firebase.database().ref(`displays/${id}/connectedHardware`);
  }

  displayMacroConfig(id, mode) {
    return firebase.database().ref(`displays/${id}/macros/${mode}`);
  }

  macros() {
    return firebase.database().ref('macros');
  }

  hardwares() {
    return firebase.database().ref('hardware');
  }

  hardware(id) {
    return firebase.database().ref(`hardware/${id}`);
  }

  userIdentity(id) {
    return firebase.database().ref(`users/public/${id}/identity`);
  }
}

export { Resource as default }
