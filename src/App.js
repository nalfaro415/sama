import React, { useState, useRef } from "react";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import Phone from "@mui/icons-material/Phone";
import Favorite from "@mui/icons-material/Favorite";
import PersonPin from "@mui/icons-material/PersonPin";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import SendIcon from "@mui/icons-material/Send";
import { Badge } from "@mui/material";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { IconButton } from "@mui/material";

firebase.initializeApp({
  apiKey: "AIzaSyD2u5XRQmw44zGUreScy3QJWpp6AGmtQSg",
  authDomain: "sama-221b0.firebaseapp.com",
  projectId: "sama-221b0",
  storageBucket: "sama-221b0.appspot.com",
  messagingSenderId: "996144645847",
  appId: "1:996144645847:web:312616d7add04154c15292",
  measurementId: "G-5Y8R5MCJD0",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>Welcome to Sama!</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out-btn" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const { uid, photoURL, email } = auth.currentUser;

  const sendMessage = async (e) => {
    e.preventDefault();

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      email,
      clicked: false,
      takenBy: "",
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  const sendHelp = (id) => {
    firestore
      .collection("messages")
      .doc(id)
      .get()
      .then(function (doc) {
        if (doc.exists) {
          return doc.ref.update({
            clicked: !doc.data().clicked,
            takenBy: email,
          });
        } else {
          // Throw an error
        }
      })
      .then(function () {
        console.log("Firestore successfully updated!");
      })
      .catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating firestore: ", error);
      });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onClick={() => {
                sendHelp(msg.id);
              }}
            />
          ))}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">
          <SendIcon />
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, email, clicked, takenBy } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
      <IconButton color="primary" onClick={props.onClick}>
        {clicked ? (
          <div className="checked-msg">
            <PriceCheckIcon />
            <p
              className="taken-msg"
              style={{ background: "green", color: "white" }}
            >{`Taken by ${takenBy}`}</p>
          </div>
        ) : (
          <AccessibilityNewIcon />
        )}
      </IconButton>
    </div>
  );
}

//to deploy
//firebase deploy --only functions
//ref:
// https://www.youtube.com/watch?v=zQyrwxMPm88&t=392s

export default App;
