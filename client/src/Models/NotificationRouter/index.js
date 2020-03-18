class Notification {
  /**
   * @param {string} type
   */
  constructor(type) {
    this.notificationType = type;
  }

  /**
   * @access public
   * @returns {string} notification type
   */
  getRouteType() {
    return this.notificationType;
  }

  /**
   * @access private
   * @param {object} params
   */
  callMassNotification(params) {
    console.log('callMassNotification with params:', params);
  }

  /**
   * @access private
   * @param {object} params
   */
  callGlobalNotification(params) {
    console.log('callCommonNotification with params:', params);
  }

  /**
   * @access public
   * @param {object} params
   */
  router(params) {
    switch (this.getRouteType()) {
      case 'mass': {
        return this.callMassNotification(params);
      }
      case 'global': {
        return this.callGlobalNotification(params);
      }
      default: {
        return null;
      }
    }
  }
}

export default Notification;
