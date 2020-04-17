import PropTypes from 'prop-types';

export const wikiPageTypes = {
  selectedNode: PropTypes.oneOfType([() => null, PropTypes.string]).isRequired,
  metadata: PropTypes.oneOfType([() => null, PropTypes.object]).isRequired,
};
