import React, { useState, useContext } from 'react';
import { Button, Input } from 'antd';

import modelContext from '../../../Models/context';

const Recovory = props => {
  const { Request } = useContext(modelContext);
  const [status, setStatus] = useState(null);
  const [mode, setMode] = useState('emailMode');
  const [recovoryField, setField] = useState('');

  const onChange = ({ currentTarget: { value = '' } = {} }) => {
    setField(value);
  };

  const onSubmit = async () => {
    try {
      const regexp = mode === 'emailMode' ? /\w+@\w+\.\D+/i : /\w+/i;

      if (!regexp.test(recovoryField)) {
        setStatus(mode === 'emailMode' ? 'Неверный формат почты' : 'Неверный формат поля');
        return;
      }

      const recovoryData = {
        recovoryField,
        mode,
      };

      const rest = new Request();
      const result = await rest.sendRequest('/recovory', 'POST', recovoryData);

      if (result.status !== 200) throw new Error('Bad data for recovory');

      setStatus('Новый пароль будет выслан вам на почту.');
      setField('');
    } catch (error) {
      console.error(error.message);
      setStatus('Ошибка восстановления пароля, возможно данные не верны.');
    }
  };

  const onChangeMode = () => {
    if (mode === 'emailMode') setMode('loginMode');
    else setMode('emailMode');

    setField('');
    setStatus('');
  };

  const OnLocation = () => {
    window.location.assign('/');
  };

  const msgLink = mode === 'emailMode' ? 'Я не помню почту' : 'Я не помню логин';

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

        <Button onClick={onChangeMode} type="link">
          {msgLink}
        </Button>
        <Button disabled={!recovoryField} type="primary" onClick={onSubmit}>
          Восстановить
        </Button>
        <Button type="primary" onClick={OnLocation}>
          На главную
        </Button>
      </form>
    </div>
  );
};
export default Recovory;
