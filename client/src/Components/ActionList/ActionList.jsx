//@ts-nocheck
import React, { useState } from 'react';
import { Dropdown, Icon, Menu, Spin, Tooltip } from 'antd';
import { ActionListType } from './types';

const ActionList = (props) => {
  const {
    viewType,
    entityName: entityNameProps,
    showModal,
    onMessage,
    onSendMailResponse,
    modeControll,
    onUpdateEditable,
    onRejectEdit,
    isLoadList,
    rulesStatus,
    rulesEdit,
    onEdit,
  } = props;

  const [entityName] = useState(entityNameProps);
  const isEdit = modeControll === 'edit';

  const showLoader = () => {
    return (
      <Tooltip mouseEnterDelay={0.1} title="Загрузка или обновление данных">
        <Spin type="small" />
      </Tooltip>
    );
  };

  const getBodyByEntityName = () => {
    switch (entityName) {
      case 'taskView':
        return (
          <>
            <Menu>
              <Menu.Item>
                <p className="jur" onClick={isEdit ? onMessage : showModal}>
                  Занести в журнал работы
                </p>
              </Menu.Item>
              {rulesStatus ? (
                <Menu.Item>
                  <p className="statusTask" onClick={isEdit ? onMessage : showModal}>
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
                  <p className="mailResponseType" onClick={onSendMailResponse}>
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
  };

  return (
    <>
      <Dropdown overlay={getBodyByEntityName()}>
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
};

ActionList.propTypes = ActionListType;

export default ActionList;
