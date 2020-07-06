import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import { Button, Collapse, Select } from 'antd';
const { Panel } = Collapse;

const { Option } = Select;

const PanelAdmin = ({ onSaveSettings, statusList: { settings: statusListProps = [] } = {} }) => {
  const memoStatusList = useMemo(() => statusListProps.filter(({ active }) => active).map(({ id }) => id), [
    statusListProps,
  ]);

  const [statusList, setStatusList] = useState(statusListProps);
  const [readOnly, setReadOnly] = useState(true);
  const [value, setValue] = useState(memoStatusList);
  const [haveChanges, setChanges] = useState([]);

  const onCear = (response) => {
    if (Array.isArray(response)) {
      setStatusList(response);
      setValue(response.filter(({ active }) => active).map(({ id }) => id));
    }

    setChanges([]);
    setReadOnly(true);
  };

  const onSubmit = () => {
    const statusListForSave = value.map((statusId) => {
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
      onSaveSettings('statusSettings', statusListForSave, onCear);
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

  const addStatus = (newStatusArray) => {
    if (!newStatusArray) return null;

    if (!_.includes(haveChanges, 'statusSettings')) {
      setChanges([...haveChanges, 'statusSettings']);
    }

    setValue([...newStatusArray]);
  };

  useEffect(() => {
    if (readOnly && haveChanges.includes('statusSettings')) {
      setReadOnly(false);
      return;
    }

    if (!haveChanges.includes('statusSettings') && readOnly) {
      setReadOnly(true);
    }
  }, [readOnly, haveChanges, value]);

  return (
    <Collapse>
      <Panel header="Настройка статусов задач" key="statusSettings">
        <Select
          className="settingsSelect-status"
          mode="tags"
          placeholder="Статусы задач"
          onChange={addStatus}
          value={value}
          optionLabelProp="label"
          tokenSeparators={[',']}
        >
          {renderStatusList()}
        </Select>
        <Button onClick={onSubmit} className="submit" type="primary" disabled={readOnly}>
          Принять изменения
        </Button>
      </Panel>
    </Collapse>
  );
};

PanelAdmin.defaultProps = {
  onSaveSettings: null,
  statusList: [],
};

export default PanelAdmin;
