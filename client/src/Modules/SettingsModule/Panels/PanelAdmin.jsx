// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import { Button, Collapse, Select } from 'antd';
const { Panel } = Collapse;

const { Option } = Select;

const PanelAdmin = (props) => {
  const { onSaveSettings, statusList: statusListProps } = props;

  const [statusList] = useState(statusListProps);
  const [readOnly, setReadOnly] = useState(true);
  const [value, setValue] = useState([]);
  const [haveChanges, setChanges] = useState([]);

  const onCear = () => {
    setChanges([]);
    setReadOnly(true);
  };

  const onSubmit = () => {
    const statusListForSave = value.map((val) => {
      const status = statusList.find(({ id = '' }) => {
        return id === val;
      });

      if (status && _.isPlainObject(status)) {
        return { ...status };
      }

      return { id: `virtual_${uuid()}`, value: val };
    });

    if (onSaveSettings && statusListForSave?.length) {
      onSaveSettings('statusSettings', statusListForSave, onCear);
    }
  };

  const renderStatusList = () => {
    return statusList
      .map((status) => {
        const { id = '', value = '' } = status;
        if (!id) return null;

        return (
          <Option key={id} value={id} label={value}>
            <span className="value">{value}</span>
          </Option>
        );
      })
      .filter(Boolean);
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
