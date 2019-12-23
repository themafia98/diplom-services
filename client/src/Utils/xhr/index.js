import _ from "lodash";
import axios from "axios";

class Request {
    constructor(prop) {
        /** @const {string} */
        this.status = prop;

        /** @private {string} */
        this.testAPI = "/favicon.ico?_=";

        /** @type {function} */
        this.followObserver = null;

        /** @type {function} */
        this.observerOffline = null;

        /** @type {function} */
        this.observerOnline = null;
    }

    /** @public
     *  @param {boolean} flag
     */
    getTestAPI(flag = null) {
        if (flag) return this.testAPI + new Date().getTime();
        else return this.testAPI.split("_")[0];
    }

    /** @public
     * @param {function} event function
     * @param {string} mode string
     */
    subscribe(event, mode = "offline") {
        if (mode === "offline") {
            this.observerOffline = event;
            return { status: "ok", mode: "offline", event: this.observerOffline };
        } else if (mode === "online") {
            this.observerOnline = event;
            return { status: "ok", mode: "online", event: this.observerOnline };
        }
    }

    /** @public
     * @param {string} mode string
     * @param {function} callback function
     * @param {number} timeout number
     */
    follow(mode = "offline", callback, timeout = 5000) {
        if (_.isNull(this.followObserver))
            this.followObserver = setInterval(() => {
                this.test(callback);
            }, timeout);
        else return null;
    }

    /** @public
     * @param {void} void
     */
    unfollow() {
        if (this.followObserver) {
            clearInterval(this.followObserver);
            this.followObserver = null;
        }
        return true;
    }

    /** @public
     * @param {string} prop string
     */
    factory(prop) {
        return new Request(prop);
    }

    /** @public
     * @param {function} callback function
     */
    async test(callback = null) {
        console.clear();
        try {
            const response = await new Promise((resolve, reject) => {
                const testRequst = new XMLHttpRequest();
                const api = this.getTestAPI(true);
                testRequst.open("GET", api);
                testRequst.onload = function() {
                    if (this.status === 200 || this.status === 204) {
                        resolve("online");
                    } else {
                        reject("offline");
                    }
                };
                testRequst.send();
            });
            if (response === "online" && callback) {
                callback(response);
            }
        } catch (error) {
            if (callback) callback(error);
        }
    }

    async authCheck() {
        return await axios.post("/rest/auth", {
            headers: {
                Authorization: this.getToken(true)
            },
            credentials: "include"
        });
    }

    sendRequest(url, method, body, auth = false, customHeaders = {}) {
        const props =
            auth && body
                ? {
                      headers: {
                          Authorization: this.getToken(auth)
                      },
                      data: body
                  }
                : {
                      headers: {
                          ...customHeaders
                      },
                      data: body ? body : null
                  };

        return axios({
            method,
            url,
            ...props
        });
    }

    restartApp() {
        sessionStorage.clear();
        window.location.assign("/");
    }

    getToken(auth) {
        const token = sessionStorage.getItem("token") || "";
        if ((auth && !token) || !token) {
            return null;
        }
        return `Token ${token}`;
    }

    signOut = async () => {
        await axios
            .delete("/rest/logout", {
                headers: {
                    Authorization: this.getToken(true)
                },
                credentials: "include"
            })
            .then(res => {
                if (res.status === 200) this.restartApp();
                else throw new Error("invalid logout");
            })
            .catch(error => console.error(error));
    };
}

export default Request;
