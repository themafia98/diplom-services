import React, { useState, useEffect, useCallback } from 'react';
import { panelPasswordType } from './types';
import { Input, Collapse, Button } from 'antd';
const { Panel } = Collapse;

const PanelPassword = ({ onSaveSettings, oldPassword: oldPasswordProps, newPassword: newPasswordProps }) => {
  const [readOnly, setReadOnly] = useState(true);
  const [haveChanges, setChanges] = useState([]);
  const [newPassword, setNewPassword] = useState(newPasswordProps);
  const [oldPassword, setOldPassword] = useState(oldPasswordProps);

  useEffect(() => {
    const readonlyPassword = !haveChanges.includes('password_new') && !haveChanges.includes('password_old');
    if (readonlyPassword !== readOnly) setReadOnly(readonlyPassword);
  }, [haveChanges, readOnly]);

  const onChangeInput = ({ target: { value = '' } = {} }, key) => {
    const filterChanges = [...haveChanges];
    if (!filterChanges.includes(key)) {
      filterChanges.push(key);
    }

    switch (key) {
      case 'password_new': {
        if (value !== newPassword) setNewPassword(value);
        break;
      }
      case 'password_old': {
        if (value !== oldPassword) setOldPassword(value);
        break;
      }
      default:
        break;
    }

    setChanges(!filterChanges.length ? [key] : filterChanges);
  };

  const onClear = () => {
    setChanges([]);
    setReadOnly(true);
  };

  const saveSettings = useCallback(onSaveSettings, [newPassword, oldPassword, onClear]);

  const onSubmit = () => {
    if (onSaveSettings)
      saveSettings(
        'password',
        {
          newPassword,
          oldPassword,
        },
        onClear,
      );
  };

  return (
    <Collapse>
      <Panel header="Смена пароля" key="password">
        <div className="configWrapper flexWrapper">
          <span>Старый пароль:</span>
          <Input
            type="password"
            allowClear
            value={oldPassword}
            onChange={(evt) => onChangeInput(evt, 'password_old')}
          />
        </div>
        <div className="configWrapper flexWrapper">
          <span>Новый пароль:</span>
          <Input
            type="password"
            allowClear
            value={newPassword}
            onChange={(e) => onChangeInput(e, 'password_new')}
          />
        </div>
        <Button onClick={onSubmit} className="submit" type="primary" disabled={readOnly}>
          Принять изменения
        </Button>
      </Panel>
    </Collapse>
  );
};

PanelPassword.propTypes = panelPasswordType;

PanelPassword.defaultProps = {
  onSaveSettings: null,
  oldPassword: '',
  newPassword: '',
};

export default PanelPassword;
