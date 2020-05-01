import PropTypes from 'prop-types';
const { array, string, object, func } = PropTypes;

export const fileType = {
  module: string.isRequired,
  moduleData: object.isRequired,
  onRemoveFile: func,
  onAddFileList: func,
  filesArray: array,
  rest: object,
};
