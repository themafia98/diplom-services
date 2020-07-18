import React, { useState, useContext, useEffect, useCallback } from 'react';
import { panelCommonType } from './types';
import { Button, Collapse, Input } from 'antd';
import ModelContext from 'Models/context';
const { Panel } = Collapse;

const PanelCommon = ({ emailValue: emailValueProps, telValue: telValueProps, onSaveSettings }) => {
  const context = useContext(ModelContext);
  const { config: { settings: { includeChangeEmail = false } = {} } = {} } = context;

  const [readOnly, setReadOnly] = useState(true);
  const [haveChanges, setChanges] = useState([]);
  const [emailValue, setEmailValue] = useState(emailValueProps);
  const [telValue, setTelValue] = useState(telValueProps);

  useEffect(() => {
    const readonlyCommon = !haveChanges.includes('commonEmail') && !haveChanges.includes('commonPhone');
    if (readonlyCommon !== readOnly) setReadOnly(readonlyCommon);
  }, [haveChanges, readOnly]);

  const onChangeInput = ({ target: { value = '' } = {} }, key) => {
    const filterChanges = [...haveChanges];
    if (!filterChanges.includes(key)) {
      filterChanges.push(key);
    }

    switch (key) {
      case 'commonPhone': {
        if (value !== telValue) setTelValue(value);
        break;
      }
      case 'commonEmail': {
        if (value !== emailValue) setEmailValue(value);
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

  const saveSettings = useCallback(onSaveSettings, [emailValue, telValue, haveChanges, onClear]);

  const onSubmit = () => {
    if (onSaveSettings)
      saveSettings(
        'common',
        {
          emailValue,
          telValue,
          haveChanges,
        },
        onClear,
      );
  };

  return (
    <Collapse>
      <Panel header="Общие настройки" key="common">
        <div className="settingsPanel--center-flex">
          {includeChangeEmail ? (
            <div className="configWrapper flexWrapper">
              <span>Сменить почту:</span>
              <Input
                data-id="email"
                allowClear
                value={emailValue}
                onChange={(e) => onChangeInput(e, 'commonEmail')}
              />
            </div>
          ) : null}
          <div className="configWrapper flexWrapper">
            <span>Сменить телефон:</span>
            <Input
              data-id="tel"
              type="tel"
              allowClear
              value={telValue}
              onChange={(e) => onChangeInput(e, 'commonPhone')}
            />
          </div>
        </div>
        <Button onClick={onSubmit} className="submit" type="primary" disabled={readOnly}>
          Принять изменения
        </Button>
      </Panel>
    </Collapse>
  );
};

PanelCommon.propTypes = panelCommonType;

PanelCommon.defaultProps = {
  onSaveSettings: null,
  emailValue: '',
  telValue: '',
};

export default PanelCommon;
