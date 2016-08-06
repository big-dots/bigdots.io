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

  hardwares() {
    return firebase.database().ref('hardware');
  }

  hardware(id) {
    return firebase.database().ref(`hardware/${id}`);
  }
}

export { Resource as default }
