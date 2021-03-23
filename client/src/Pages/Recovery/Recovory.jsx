import React, { useState, useContext } from 'react';
import { recovoryType } from './Recovory.types';
import { Button, Input } from 'antd';

import ModelContext from 'Models/context';
import actionsTypes from 'actions.types';
import regExpRegister from 'Utils/Tools/regexpStorage';

const Recovory = () => {
  const { Request } = useContext(ModelContext);
  const [status, setStatus] = useState(null);
  const [mode] = useState('emailMode');
  const [recovoryField, setField] = useState('');

  const onChange = ({ currentTarget }) => setField(currentTarget.value);

  const onSubmit = async () => {
    try {
      if (!(mode === 'emailMode' ? regExpRegister.VALID_EMAIL : /\w+/g).test(recovoryField)) {
        setStatus(mode === 'emailMode' ? 'Неверный формат почты' : 'Неверный формат поля');
        return;
      }

      const recovoryData = {
        actionType: actionsTypes.$RECOVORY,
        recovoryField,
        mode,
      };

      const rest = new Request();
      const result = await rest.sendRequest('/verifyRecovory', 'POST', recovoryData);

      if (result.status !== 200) throw new Error('Bad data for recovory');

      setStatus('Письмо с подтверждением смены пароля выслано на почту.');
      setField('');
    } catch (error) {
      console.error(error.message);
      setStatus('Ошибка восстановления пароля, возможно данные не верны.');
    }
  };

  const onLocation = () => window.location.assign('/');

  return (
    <div className="recovory">
      <p className="recovory_title">Восстоновление доступа в систему</p>
      <form className="recovory_form" name="recovoryForm">
        <span className="status">{status ? status : 'Заполните поле'}</span>
        <Input
          onChange={onChange}
          type="text"
          placeholder={mode === 'emailMode' ? 'введите ваш email' : 'введите ваш логин'}
          value={recovoryField}
        />

        {
          // TODO: should impelement in future
          /* <Button onClick={onChangeMode} type="link">
          {msgLink}
        </Button> */
        }
        <Button disabled={!recovoryField} type="primary" onClick={onSubmit}>
          Восстановить
        </Button>
        <Button type="primary" onClick={onLocation}>
          На главную
        </Button>
      </form>
    </div>
  );
};

Recovory.propTypes = recovoryType;
export default Recovory;
