import React from 'react';
import firebase from './Firebase';
/** @ContextAPI for firebase */
const firebaseContext = React.createContext(firebase);
export default firebaseContext;