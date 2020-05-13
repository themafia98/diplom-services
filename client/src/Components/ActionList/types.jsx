// @ts-nocheck
import PropTypes from 'prop-types';

const { string, func, bool } = PropTypes;

const ActionListType = {
  viewType: string.isRequired,
  entityName: string.isRequired,
  modeControll: string.isRequired,
  showModal: func,
  onMessage: func,
  onSendMailResponse: func,
  onUpdateEditable: func,
  onRejectEdit: func,
  isLoadList: bool,
  rulesStatus: bool,
  rulesEdit: bool,
  onEdit: func,
};

export { ActionListType };
