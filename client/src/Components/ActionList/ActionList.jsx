//@ts-nocheck
import React, { useState, useCallback, useMemo } from 'react';
import { Dropdown, Icon, Menu, Spin, Tooltip } from 'antd';
import { ActionListType } from './ActionList.types';

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
      <Tooltip mouseEnterDelay={0.1} title="Loading data">
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
                  Занести в журнал работы
                </p>
              </Menu.Item>
              {rulesStatus ? (
                <Menu.Item>
                  <p
                    className="statusTask"
                    onClick={isEdit ? onMessage : (evt) => onAction(evt, 'statusTask')}
                  >
                    Сменить статус задачи
                  </p>
                </Menu.Item>
              ) : null}
              {rulesEdit ? (
                <Menu.Item>
                  <p className="statusTask" onClick={isEdit ? onMessage : onEdit}>
                    Редактировать задачу
                  </p>
                </Menu.Item>
              ) : null}
              {viewType === 'remote' ? (
                <Menu.Item>
                  <p className="mailResponseType" onClick={(evt) => onAction(evt, 'mailResponse')}>
                    Отправить ответ на почту
                  </p>
                </Menu.Item>
              ) : null}
            </Menu>
          </>
        );

      default:
        return <div className="empty" />;
    }
  }, [entityName, isEdit, onAction, onEdit, onMessage, rulesEdit, rulesStatus, viewType]);

  return (
    <>
      <Dropdown overlay={overlay}>
        <p className="action-dropdown-link">
          Управление задачей
          <Icon type="down" />
        </p>
      </Dropdown>
      {isEdit ? (
        <>
          <p onClick={onUpdateEditable} className="modeControllEdit">
            Сохранить изменения
          </p>
          <p onClick={onRejectEdit} className="modeControllEditReject">
            Отмена изменений
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
