// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { panelProfileType } from './types';
import { Button, Collapse, Switch } from 'antd';
const { Panel } = Collapse;

const PanelProfile = (props) => {
  const { onSaveSettings, isHideEmail: isHideEmailProps, isHidePhone: isHidePhoneProps } = props;
  const [haveChanges, setChanges] = useState([]);
  const [isHideEmail, setHideEmail] = useState(isHideEmailProps);
  const [isHidePhone, setHidePhone] = useState(isHidePhoneProps);
  const [readOnly, setReadOnly] = useState(true);

  useEffect(() => {
    const readonlyProfile = !haveChanges.includes('isHideEmail') && !haveChanges.includes('isHidePhone');
    if (readonlyProfile !== readOnly) setReadOnly(readonlyProfile);
  }, [haveChanges, readOnly]);

  const onHide = (key) => {
    if (key.includes('Phone')) setHidePhone(!isHideEmail);
    else if (key.includes('Email')) setHideEmail(!isHideEmail);

    const filterChanges = [...haveChanges];
    if (!filterChanges.includes(key)) {
      filterChanges.push(key);
    }

    setChanges(!filterChanges.length ? [key] : filterChanges);
  };

  const onClear = () => {
    setChanges([]);
    setReadOnly(true);
  };

  const saveSettings = useCallback(onSaveSettings, [isHideEmail, isHidePhone, onClear]);

  const onSubmit = () => {
    if (onSaveSettings)
      saveSettings(
        'profile',
        {
          isHideEmail,
          isHidePhone,
        },
        onClear,
      );
  };

  return (
    <Collapse>
      <Panel header="Настройки профиля" key="profile">
        <div className="configWrapper">
          <Switch defaultChecked={isHideEmail} onChange={onHide.bind(this, 'isHideEmail')} />
          <span className="configTitle">Скрывать почту</span>
        </div>
        <div className="configWrapper">
          <Switch defaultChecked={isHidePhone} onChange={onHide.bind(this, 'isHidePhone')} />
          <span className="configTitle">Скрывать телефон</span>
        </div>
        <Button onClick={onSubmit} className="submit" type="primary" disabled={readOnly}>
          Принять изменения
        </Button>
      </Panel>
    </Collapse>
  );
};

PanelProfile.propTypes = panelProfileType;

PanelProfile.defaultProps = {
  onSaveSettings: null,
  isHidePhone: false,
  isHideEmail: false,
};

export default PanelProfile;
