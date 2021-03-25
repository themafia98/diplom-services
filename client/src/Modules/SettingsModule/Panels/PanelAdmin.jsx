import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import { Button, Collapse, Select } from 'antd';
import { useTranslation } from 'react-i18next';

const { Panel } = Collapse;

const { Option } = Select;

const PanelAdmin = ({
  onSaveSettings,
  statusList: statusConfig,
  settingsTasksPriority: settingsTasksPriorityConfig,
}) => {
  const { t } = useTranslation();

  const { settings: settingsTasksPriority = [] } = settingsTasksPriorityConfig;
  const { settings: statusSettings = [] } = statusConfig;

  const memoStatusList = useMemo(() => statusSettings.filter(({ active }) => active).map(({ id }) => id), [
    statusSettings,
  ]);

  const memoSettingsTasksPriority = useMemo(
    () => settingsTasksPriority.filter(({ active }) => active).map(({ id }) => id),
    [settingsTasksPriority],
  );

  const [priorityList, setPriorityList] = useState(settingsTasksPriority);
  const [statusList, setStatusList] = useState(statusSettings);
  const [readOnly, setReadOnly] = useState(true);
  const [priorityValue, setPriorityValue] = useState(memoSettingsTasksPriority);
  const [statusValue, seStatusValue] = useState(memoStatusList);
  const [haveChanges, setChanges] = useState([]);

  useEffect(() => {
    if (statusSettings?.length !== statusList?.length) {
      setStatusList(statusSettings);
    }

    if (settingsTasksPriority?.length !== priorityList?.length) {
      setPriorityList(settingsTasksPriority);
    }
  }, [statusSettings, statusList, settingsTasksPriority, priorityList]);

  const onClear = (clearType, response) => {
    if (Array.isArray(response) && clearType === 'statusSettings') {
      setStatusList(response);
      seStatusValue(response.filter(({ active }) => active).map(({ id }) => id));
    }

    if (Array.isArray(response) && clearType === 'tasksPriority') {
      setPriorityList(response);
      setPriorityValue(response.filter(({ active }) => active).map(({ id }) => id));
    }

    if (haveChanges.length) {
      setChanges([]);
    }

    if (!readOnly) {
      setReadOnly(true);
    }
  };

  const onSubmit = () => {
    const statusListForSave = statusValue.map((statusId) => {
      const item = statusList.find(({ id: selectedId = '' }) => {
        return selectedId === statusId;
      });

      const isObj = item && typeof item === 'object';

      if (!statusId && isObj) {
        return { ...item, active: false };
      }

      if (statusId && isObj) {
        return { ...item, active: true };
      }

      return { id: `virtual_${uuid()}`, value: statusId, active: true };
    });

    if (onSaveSettings) {
      onSaveSettings(['tasksPriority', 'statusSettings'], statusListForSave, onClear);
    }
  };

  const renderStatusList = () => {
    return statusList.reduce((elementsList, status) => {
      const { id = '', value = '' } = status;
      if (!id) return elementsList;
      return [
        ...elementsList,
        <Option key={id} value={id} label={value}>
          <span className="value">{value}</span>
        </Option>,
      ];
    }, []);
  };

  const renderPriorityList = () => {
    return priorityList.reduce((elementsList, status) => {
      const { id = '', value = '' } = status;
      if (!id) return elementsList;
      return [
        ...elementsList,
        <Option key={id} value={id} label={value}>
          <span className="value">{value}</span>
        </Option>,
      ];
    }, []);
  };

  const addStatus = (newStatusArray) => {
    if (!newStatusArray) return null;

    if (!_.includes(haveChanges, 'statusSettings')) {
      setChanges([...haveChanges, 'statusSettings']);
    }

    seStatusValue([...newStatusArray]);
  };

  const addPriority = (newPriorityArray) => {
    if (!newPriorityArray) return null;

    if (!_.includes(haveChanges, 'tasksPriority')) {
      setChanges([...haveChanges, 'tasksPriority']);
    }

    setPriorityValue([...newPriorityArray]);
  };

  useEffect(() => {
    if (readOnly && haveChanges.includes('statusSettings')) {
      setReadOnly(false);
      return;
    }

    if (!haveChanges.includes('statusSettings') && readOnly) {
      setReadOnly(true);
    }
  }, [readOnly, haveChanges, statusValue]);

  return (
    <Collapse>
      <Panel header={t('settingsModule_admin_name')} key="statusSettings">
        <Select
          className="settingsSelect-status"
          mode="tags"
          placeholder={t('settingsModule_admin_statusSelectPlaceholder')}
          onChange={addStatus}
          value={statusValue}
          optionLabelProp="label"
          tokenSeparators={[',']}
        >
          {renderStatusList()}
        </Select>
        <Select
          className="settingsSelect-priority"
          mode="tags"
          placeholder={t('settingsModule_admin_statusSelectPlaceholder')}
          onChange={addPriority}
          value={priorityValue}
          optionLabelProp="label"
          tokenSeparators={[',']}
        >
          {renderPriorityList()}
        </Select>
        <Button onClick={onSubmit} className="submit" type="primary" disabled={readOnly}>
          {t('settingsModule_submitButton')}
        </Button>
      </Panel>
    </Collapse>
  );
};

PanelAdmin.defaultProps = {
  onSaveSettings: null,
  statusList: {},
};

export default PanelAdmin;
