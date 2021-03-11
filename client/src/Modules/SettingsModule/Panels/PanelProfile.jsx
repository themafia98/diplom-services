import React, { useState, useEffect, useCallback } from 'react';
import { panelProfileType } from './types';
import { Button, Collapse, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
const { Panel } = Collapse;

const PanelProfile = ({ onSaveSettings, isHideEmail: isHideEmailProps, isHidePhone: isHidePhoneProps }) => {
  const { t } = useTranslation();
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

  const saveSettings = useCallback(onSaveSettings, [isHideEmail, isHidePhone, onClear, onSaveSettings]);

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
      <Panel header={t('settingsModule_profile_name')} key="profile">
        <div className="configWrapper">
          <Switch defaultChecked={isHideEmail} onChange={onHide.bind(this, 'isHideEmail')} />
          <span className="configTitle">{t('settingsModule_profile_hideEmail')}</span>
        </div>
        <div className="configWrapper">
          <Switch defaultChecked={isHidePhone} onChange={onHide.bind(this, 'isHidePhone')} />
          <span className="configTitle">{t('settingsModule_profile_hidePhone')}</span>
        </div>
        <Button onClick={onSubmit} className="submit" type="primary" disabled={readOnly}>
          {t('settingsModule_submitButton')}
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
