import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

var firebaseConfig = {
    apiKey: "AIzaSyDHI5S7VvyYwtqG7Xn38PSOK9FZunIBV9s",
    authDomain: "slackchat-3de48.firebaseapp.com",
    databaseURL: "https://slackchat-3de48.firebaseio.com",
    projectId: "slackchat-3de48",
    storageBucket: "slackchat-3de48.appspot.com",
    messagingSenderId: "1026623506542",
    appId: "1:1026623506542:web:271ab6dde0095914"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase;