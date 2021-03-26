import PropTypes from 'prop-types';
const { string, oneOf, object } = PropTypes;

export const wikiModuleType = {
  moduleContext: object.isRequired,
  clientDB: object.isRequired,
};

export const wikiPageTypes = {
  selectedNode: PropTypes.oneOfType([oneOf([null]), string]).isRequired,
  metadata: PropTypes.oneOfType([oneOf([null]), object]).isRequired,
};
