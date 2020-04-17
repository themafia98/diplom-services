import PropTypes from 'prop-types';
const { array, string, object, func } = PropTypes;

export const fileType = {
  filesArray: array.isRequired,
  module: string.isRequired,
  moduleData: object.isRequired,
  onAddFileList: func.isRequired,
  onRemoveFile: func.isRequired,
  rest: object.isRequired,
};
