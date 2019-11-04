import _ from "lodash";

class Request {
    constructor(prop) {
        this.status = prop;
        this.testAPI = "/favicon.ico?_=";
        this.followObserver = null;
        this.observerOffline = null;
        this.observerOnline = null;
    }

    getTestAPI(flag = null) {
        if (flag) return this.testAPI + new Date().getTime();
        else return this.testAPI;
    }

    subscribe(event, mode = "offline") {
        if (mode === "offline") {
            this.observerOffline = event;
            return { status: "ok", mode: "offline", event: this.observerOffline };
        } else if (mode === "online") {
            this.observerOnline = event;
            return { status: "ok", mode: "online", event: this.observerOnline };
        }
    }

    follow(mode = "offline", callback, timeout = 5000) {
        if (_.isNull(this.followObserver))
            this.followObserver = setInterval(() => {
                this.test(callback);
            }, timeout);
        else return null;
    }

    unfollow() {
        if (this.followObserver) {
            clearInterval(this.followObserver);
            this.followObserver = null;
        }
        return true;
    }

    factory(prop) {
        return new Request(prop);
    }

    test(callback = null) {
        return new Promise((resolve, reject) => {
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
        })
            .then(response => {
                if (response === "online" && callback) {
                    callback(response);
                }
            })
            .catch(error => {
                console.error(error);
                if (callback) callback(error);
            });
    }
}

export default Request;
