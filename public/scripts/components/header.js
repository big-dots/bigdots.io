import UserManager from '../managers/user-manager';
import DisplayManager from '../managers/display-manager';

var userManager = new UserManager(),
    displayManager = new DisplayManager();

class Header {
  constructor($el) {
    this.$el = $el;
  }

  render() {
    this.$el.html(`
      <header class="navbar navbar-static-top" style="border-radius: 0;">
        <div class="pull-right hidden-xl-down">
          <img src="" class="avatar" style="border-radius: 20px; width: 40px; height: 40px;"/>
        </div>
        <a class="navbar-brand" href="/">BIGDOTS</a>
      </header>
    `);

    firebase.auth().onAuthStateChanged((user) => {
      if(user) {
        this.$el.find('header').removeClass('logged-out');
        this.$el.find('.avatar').attr('src', user.photoURL);

        var identity = {
          name: user.displayName,
          profileImageUrl: user.photoURL,
          uid: user.uid
        };

        userManager.updateIdentity(user.uid, identity, function() {
          // Something...
        });

      } else {
        this.$el.find('header').addClass('logged-out');
        this.$el.find('.user-signed-out').show();
      }
    });

    this.$el.find('.sign-in').click((ev) => {
      ev.preventDefault();
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then((result) => {
        var user = result.user;
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
