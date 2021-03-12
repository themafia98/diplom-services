//@ts-nocheck
import React, { useState, useCallback, useMemo } from 'react';
import { Dropdown, Icon, Menu, Spin, Tooltip } from 'antd';
import { ActionListType } from './ActionList.types';
import { useTranslation } from 'react-i18next';

const ActionList = ({
  viewType,
  entityName: entityNameProps,
  showModal: onShowModal,
  onMessage,
  modeControll,
  onUpdateEditable,
  onRejectEdit,
  isLoadList,
  rulesStatus,
  rulesEdit,
  onEdit,
}) => {
  const { t } = useTranslation();
  const showModal = useCallback(onShowModal, [onShowModal]);

  const onAction = useCallback(
    (event, key) => {
      showModal(event, key);
    },
    [showModal],
  );

  const [entityName] = useState(entityNameProps);
  const isEdit = modeControll === 'edit';

  const showLoader = () => {
    return (
      <Tooltip mouseEnterDelay={0.1} title={t('components_actionList_loading')}>
        <Spin type="small" />
      </Tooltip>
    );
  };

  const overlay = useMemo(() => {
    switch (entityName) {
      case 'taskView':
        return (
          <>
            <Menu>
              <Menu.Item>
                <p className="jur" onClick={isEdit ? onMessage : (evt) => onAction(evt, 'jur')}>
                  {t('components_actionList_enterWorkLogs')}
                </p>
              </Menu.Item>
              {rulesStatus ? (
                <Menu.Item>
                  <p
                    className="statusTask"
                    onClick={isEdit ? onMessage : (evt) => onAction(evt, 'statusTask')}
                  >
                    {t('components_actionList_changeTaskStatus')}
                  </p>
                </Menu.Item>
              ) : null}
              {rulesEdit ? (
                <Menu.Item>
                  <p className="statusTask" onClick={isEdit ? onMessage : onEdit}>
                    {t('components_actionList_editTask')}
                  </p>
                </Menu.Item>
              ) : null}
              {viewType === 'remote' ? (
                <Menu.Item>
                  <p className="mailResponseType" onClick={(evt) => onAction(evt, 'mailResponse')}>
                    {t('components_actionList_sendMail')}
                  </p>
                </Menu.Item>
              ) : null}
            </Menu>
          </>
        );

      default:
        return <div className="empty" />;
    }
  }, [entityName, isEdit, onAction, onEdit, onMessage, rulesEdit, rulesStatus, t, viewType]);

  return (
    <>
      <Dropdown overlay={overlay}>
        <p className="action-dropdown-link">
          {t('components_actionList_controlTask')}
          <Icon type="down" />
        </p>
      </Dropdown>
      {isEdit ? (
        <>
          <p onClick={onUpdateEditable} className="modeControllEdit">
            {t('components_actionList_save')}
          </p>
          <p onClick={onRejectEdit} className="modeControllEditReject">
            {t('components_actionList_reject')}
          </p>
        </>
      ) : null}
      {!isLoadList ? showLoader() : null}
    </>
  );
};

ActionList.defaultProps = {
  viewType: 'default',
  entityName: '',
  modeControll: '',
  isLoadList: true,
  rulesStatus: true,
  rulesEdit: true,
  showModal: null,
  onMessage: null,
  onUpdateEditable: null,
  onRejectEdit: null,
  onEdit: null,
};

ActionList.propTypes = ActionListType;

export default ActionList;
