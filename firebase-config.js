// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyAmZDW2pNTBgZAiNodtQasvpVVS54B-l1Y",
  authDomain: "actividad6-1c02b.firebaseapp.com",
  databaseURL: "https://actividad6-1c02b-default-rtdb.firebaseio.com",
  projectId: "actividad6-1c02b",
  storageBucket: "actividad6-1c02b.appspot.com",
  messagingSenderId: "1068123953650",
  appId: "1:1068123953650:web:c23e86bf4b1d42168cf36b"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
