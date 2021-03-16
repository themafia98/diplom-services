import PropTypes from 'prop-types';
import { udataType } from '../../App.types';
const { func, string, oneOf, object, bool, array } = PropTypes;

export const wikiModuleType = {
  path: string.isRequired,
  visible: bool,
  rest: object.isRequired,
  statusApp: string.isRequired,
  router: object.isRequired,
  metadata: array.isRequired,
  onLoadCurrentData: func.isRequired,
};

export const wikiPageTypes = {
  selectedNode: PropTypes.oneOfType([oneOf([null]), string]).isRequired,
  metadata: PropTypes.oneOfType([oneOf([null]), object]).isRequired,
};
