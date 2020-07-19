const regExpRegister = Object.freeze({
  MODULE_AND_ENTITYID: /_\$link\$__|__\$\$\w+\$\$/i,
  VALID_EMAIL: /\w+@\w+\.\D+/i,
  INCLUDE_MODULE: /Module/gi,
  TIME_JURNAL_STRING: /\w+[m|м|h|ч]$/gi,
  VIRTUAL_MODULE: /\${2}(\w)+\${2}/,
});

export default regExpRegister;
