const regExpRegister = Object.freeze({
  /**
   * /_\$link\$__|__\$\$\w+\$\$/i
   */
  MODULE_AND_ENTITYID: /_\$link\$__|__\$\$\w+\$\$/i,
  /**
   * /\w+@\w+\.\D+/i
   */
  VALID_EMAIL: /\w+@\w+\.\D+/i,
  /**
   * /Module/gi
   */
  INCLUDE_MODULE: /Module/gi,
  /**
   * /\w+[m|м|h|ч]$/gi
   */
  TIME_JURNAL_STRING: /\w+[m|м|h|ч]$/gi,
  /**
   * /\${2}(\w)+\${2}/
   */
  VIRTUAL_MODULE: /\${2}(\w)+\${2}/,
  /**
   * /__|_/gi
   */
  MODULE_KEY: /__|_/gi,
  /**
   * /__/i
   */
  MODULE_ID: /__/i,
  /**
   * /_/gi
   */
  MODULE_SUB: /_/gi,
});

export default regExpRegister;
