import { APP_STATUS } from 'App.constant';
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
  subscribe(event, mode = APP_STATUS.OFF) {
    if (mode === APP_STATUS.OFF) {
      this.observerOffline = event;
      return { status: 'ok', mode: APP_STATUS.OFF, event: this.observerOffline };
    } else if (mode === APP_STATUS.ON) {
      this.observerOnline = event;
      return { status: 'ok', mode: APP_STATUS.ON, event: this.observerOnline };
    }
  }

  /** @public
   * @param {string} mode string
   * @param {function} callback function
   * @param {number|undefiend} timeout number
   */
  follow(mode = APP_STATUS.OFF, callback, timeout = 5000) {
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
            resolve(APP_STATUS.ON);
          } else {
            reject(APP_STATUS.OFF);
          }
        };
        testRequst.onerror = function () {
          reject(APP_STATUS.OFF);
        };
        testRequst.send();
      });
      if (response === APP_STATUS.ON && callback) {
        callback(response);
      }
    } catch (error) {
      if (callback) callback(error);
    }
  }

  async authCheck() {
    const authorizationHeaderObject = this.getAuthorizationHeaderObjectWithCredentials();

    if (!authorizationHeaderObject) {
      throw new Error('Unauthorized');
    }
    return await axios.post(this.getApi() + '/auth', { authorization: true }, authorizationHeaderObject);
  }

  getAuthorizationHeaderObjectWithCredentials() {
    const token = this.getToken(true);

    if (!token) {
      return null;
    }

    return {
      headers: {
        Authorization: token,
      },
      withCredentials: true,
    };
  }

  getAuthorizationHeader() {
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
    const isObjectBody = body && typeof body === 'object';

    const props = auth
      ? {
          headers: {
            Authorization: auth === 'worker' ? this.getLocalToken() : this.getToken(auth),
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
    return `Bearer ${token}`;
  }

  getLocalToken() {
    return `Bearer ${this.token}`;
  }

  signOut = async () => {
    try {
      const authorizationHeaderObject = this.getAuthorizationHeaderObjectWithCredentials();

      if (!authorizationHeaderObject) {
        throw new Error('Invalid jwt');
      }

      const response = await axios.delete(this.getApi() + '/logout', authorizationHeaderObject);

      if (response.status === 200) {
        this.restartApp();
        return;
      }

      throw new Error('invalid logout');
    } catch (error) {
      if (error?.response?.status !== 404) {
        console.error(error);
      }
    }
  };
}

export default Request;
