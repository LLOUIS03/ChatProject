import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
  // Please add your firebase credentials
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
