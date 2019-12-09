import React from "react";
import firebase from "./Firebase";
/** @exports ContextAPI for firebase */
const firebaseContext = React.createContext(firebase);
export default firebaseContext;
