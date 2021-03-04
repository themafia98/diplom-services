import axios from 'axios';

class Request {
  /** @private {string} */
  #testAPI;
  /** @private {string} */
  #api;

  /**
   * @param {string} [prop]
   */
  constructor(token = '') {
    this.#testAPI = '/favicon.ico?_=';
    this.#api = '/rest';

    /** @const {string} */
    this.token = token;

    /** @type {function} */
    this.followObserver = null;

    /** @type {function} */
    this.observerOffline = null;

    /** @type {function} */
    this.observerOnline = null;
  }

  /** @static
   * @param {string} prop string
   */
  static factory(prop) {
    return new Request(prop);
  }

  /** @public
   *  @param {boolean} flag
   */
  getTestAPI(flag = null) {
    if (flag) return this.#testAPI + new Date().getTime();
    else return this.#testAPI.split('_')[0];
  }

  /**
   * @public
   * @return {string} entrypoint
   */
  getApi() {
    return this.#api;
  }

  parseResponse(requestResponse = {}) {
    const {
      status = 503,
      statusText = 'Bad update',
      data: { response = {} },
    } = requestResponse || {};

    const { metadata = [], params = {}, params: { fromCache = false } = {} } = response;

    const isArray = Array.isArray(metadata);
    if (status !== 200) return [metadata, statusText];

    if (isArray && fromCache && !metadata?.length) {
      return [metadata, 'Network error'];
    }

    const dataItems = isArray
      ? [...metadata]
      : metadata && typeof metadata === 'object'
      ? { ...metadata }
      : metadata;

    return [
      {
        dataItems,
        responseOptions: { ...params },
      },
      null,
    ];
  }

  /** @public
   * @param {CallableFunction} event function
   * @param {string} mode string
   */
  subscribe(event, mode = 'offline') {
    if (mode === 'offline') {
      this.observerOffline = event;
      return { status: 'ok', mode: 'offline', event: this.observerOffline };
    } else if (mode === 'online') {
      this.observerOnline = event;
      return { status: 'ok', mode: 'online', event: this.observerOnline };
    }
  }

  /** @public
   * @param {string} mode string
   * @param {function} callback function
   * @param {number|undefiend} timeout number
   */
  follow(mode = 'offline', callback, timeout = 5000) {
    if (this.followObserver === null)
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
   * @param {function} callback function
   */
  async test(callback = null) {
    try {
      const response = await new Promise((resolve, reject) => {
        const testRequst = new XMLHttpRequest();
        const api = this.getTestAPI(true);
        testRequst.open('GET', api);
        testRequst.onload = function () {
          if (this.status === 200 || this.status === 204) {
            console.clear();
            resolve('online');
          } else {
            reject('offline');
          }
        };
        testRequst.onerror = function () {
          reject('offline');
        };
        testRequst.send();
      });
      if (response === 'online' && callback) {
        callback(response);
      }
    } catch (error) {
      if (callback) callback(error);
    }
  }

  async authCheck() {
    return await axios.post(this.getApi() + '/auth', {
      headers: {
        Authorization: this.getToken(true),
      },
      credentials: 'include',
    });
  }

  getHeaders() {
    return {
      Authorization: this.getToken(true),
    };
  }

  /**
   * @param {string} requestUrl
   * @param {any} method
   * @param {any} body
   * @param {boolean} auth
   * @param {object} customHeaders
   */
  sendRequest(requestUrl, method, body, auth = false, customHeaders = {}) {
    let jsonwebtoken = null;

    const isObjectBody = body && typeof body === 'object';

    if (auth) {
      jsonwebtoken = auth === 'worker' ? this.getLocalToken() : this.getToken(auth);
    }

    const props = auth
      ? {
          headers: {
            Authorization: `Bearer ${jsonwebtoken}`,
          },
          data: isObjectBody
            ? {
                actionType: null,
                ...body,
              }
            : body,
        }
      : {
          headers: {
            ...customHeaders,
          },
          data: body ? body : null,
        };
    if ((props.headers.Authorization === null && auth) || (!props.headers.Authorization && auth)) {
      return this.signOut();
    }

    return axios({
      method,
      url: `${this.getApi()}${requestUrl}`,
      ...props,
    });
  }

  restartApp() {
    localStorage.clear();
    window.location.assign('/');
  }

  /**
   * @param {boolean} auth
   */
  getToken(auth) {
    const token = localStorage && localStorage?.getItem ? localStorage.getItem('token') : this.token;
    if ((auth && !token) || !token) {
      return null;
    }
    return `Token ${token}`;
  }

  getLocalToken() {
    return this.token;
  }

  signOut = async () => {
    /**
     * @param {any} error
     */
    await /**
     * @param {{ status: number }} res
     */
    axios
      .delete(this.getApi() + '/logout', {
        headers: {
          Authorization: this.getToken(true),
        },
        credentials: 'include',
      })
      .then((res) => {
        if (res.status === 200) this.restartApp();
        else throw new Error('invalid logout');
      })
      .catch((error) => error?.response?.status !== 404 && console.error(error));
  };
}

export default Request;
