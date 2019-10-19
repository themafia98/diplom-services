import firebase from "firebase/app";
import firebaseConfig from "./firebaseConfig";
import config from "../config.json";
const auth = require("firebase/auth");
const firestore = require("firebase/firestore");
class Firebase {
    constructor(firebaseConfig) {
        /** @Init firebase */

        firebase.initializeApp(firebaseConfig);
        this.auth = firebase.auth();
        this.db = firebase.firestore();

        if (config.firebase.lowConnection === "true" && process.env.NODE_ENV !== "test")
            this.db
                .enablePersistence()
                .then(res => console.warn(res))
                .catch(er => console.error(er)); /** if user use low internet @connection */
    }

    saveSession(rules) {
        /** @Set firebase type session */
        return this.auth.setPersistence(firebase.auth.Auth.Persistence[rules]);
    }

    login(email, password) {
        /** @login firebase */
        try {
            return this.auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    registration(email, password) {
        /** @create new user */
        return this.auth.createUserWithEmailAndPassword(email, password);
    }

    signOut() {
        /** @destroy session */
        return this.auth.signOut();
    }

    getCurrentUser() {
        /** @get current user */
        return this.auth.currentUser;
    }
}

let firebaseInterface = new Firebase(firebaseConfig);

if (process.env.NODE_ENV !== "test") firebaseInterface.saveSession(config.firebase.session);

export default firebaseInterface;
export { auth, firestore };
