import _ from "lodash";
import axios from 'axios';

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

    sendRequest(url, method, body, auth = false, customHeaders = {}){
        const token = localStorage["user"] && auth ? `Token ${JSON.parse(localStorage.getItem("user"))["user"].token}` : null;
        console.log(token);
        const props =  auth && body ? {
                headers: { 
                    Authorization: token
                },
                data: body,
        } : {
            headers: {
                ...customHeaders
            },
            data: body ? body : null
        };

        return axios({
            method,
            url,
            ...props,
        })
    }

}

export default Request;
