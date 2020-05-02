// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Button, Collapse } from 'antd';
const { Panel } = Collapse;

const PanelAdmin = (props) => {
  const { onSaveSettings } = props;
  const [haveChanges] = useState([]);

  const onSubmit = (event) => {
    if (onSaveSettings) onSaveSettings(event, 'access');
  };

  const text = useMemo(() => `A dog is a type of domesticated animal.`, []);

  return (
    <Collapse>
      <Panel header="Настройки уровней доступа" key="access">
        <Collapse bordered={false}>
          <Panel header="Администратор" key="admin">
            {text}
          </Panel>
          <Panel header="Начальник отдела" key="headDepartament">
            {text}
          </Panel>
          <Panel header="Сотрудник" key="solider">
            {text}
          </Panel>
        </Collapse>
        <Button
          onClick={onSubmit}
          className="submit"
          type="primary"
          disabled={!haveChanges.includes('profile')}
        >
          Принять изменения
        </Button>
      </Panel>
    </Collapse>
  );
};

PanelAdmin.defaultProps = {
  onSaveSettings: null,
};

export default PanelAdmin;
