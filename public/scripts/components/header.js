class Header {
  constructor($el) {
    this.$el = $el;
  }

  render() {
    this.$el.html(`
      <header class="navbar navbar-static-top navbar-dark bg-inverse">
        <div class="pull-right">
          <div class="user-signed-in" style="display: none;">
            <img src="" class="avatar" style="border-radius: 20px; width: 40px; height: 40px;"/>
          </div>
          <div class="user-signed-out" style="display: none;">
            <a href="#" class="btn btn-secondary sign-in">Sign in</a>
          </div>
        </div>
        <a class="navbar-brand" href="/">BIGDOTS</a>
      </header>
    `);

    firebase.auth().onAuthStateChanged((user) => {
      var $signedIn = this.$el.find('.user-signed-in'),
          $signedOut = this.$el.find('.user-signed-out');
          
      if(user) {
        this.$el.find('.avatar').attr('src', user.photoURL);
        $signedOut.hide();
        $signedIn.show();
      } else {
        this.$el.find('.user-signed-out').show();
        $signedIn.hide();
        $signedOut.show();
      }
    });

    this.$el.find('.sign-in').click((ev) => {
      ev.preventDefault();
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then((result) => {
        var user = result.user;
        debugger
        this.$el.find('.avatar').attr('src', user.photoURL);
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
    });
  }
}

export { Header as default }
