//@ts-nocheck
import React, { useState } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

import Request from '../../Models/Rest';

import './demo.scss';

const { RangePicker } = DatePicker;

const Demo = (props) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    address: '',
    phone: '',
    email: '',
    other: '',
    cause: '',
    date: [moment(), moment()],
  });

  const [message, setMessage] = useState('');
  const [disabled, setDisabled] = useState(true);

  const onChange = (key, value) => {
    if (message) setMessage('');
    setFormData({
      ...formData,
      [key]: value,
    });
    onCheck({ [key]: value });
  };

  const onCheck = (currentValue = {}) => {
    const formValuesList = Object.values({ ...formData, ...currentValue, other: 'skip' });
    const invalid = !formValuesList.every((it) => it);
    if (disabled !== invalid) setDisabled(invalid);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (disabled) return;

    if (message) setMessage('');

    try {
      const rest = new Request();
      const res = await rest.sendRequest('/tasks/regTicket', 'PUT', formData, false);

      if (res.status !== 200) throw new Error('Не удалось отправить заявку');
      setMessage('Ваша заявка принята');

      const { data = {} } = res;
      const { response = {} } = data;
      console.log('response', response);
    } catch (error) {
      const { request: { status = '' } = {} } = error || {};
      console.error(error);
      debugger;
      if (status === 404 || status === 503) setMessage('Ошибка обработки заявки');
      else setMessage(error.message);
    }
  };

  return (
    <div className="demo-page">
      <h1 className="title-demoPage">Форма обращения в учереждение здравоохранения</h1>
      <form name="ticket" className="demo-form">
        <label>
          Имя
          <input
            autoFocus={true}
            name="name"
            type="text"
            value={formData.value}
            onChange={({ target: { value } }) => onChange('name', value)}
          />
        </label>
        <label>
          Фамилия
          <input
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={({ target: { value } }) => onChange('lastName', value)}
          />
        </label>
        <label>
          Причина
          <input
            name="cause"
            type="text"
            value={formData.cause}
            onChange={({ target: { value } }) => onChange('cause', value)}
          />
        </label>
        <label>
          Адрес
          <input
            name="address"
            type="text"
            value={formData.address}
            onChange={({ target: { value } }) => onChange('address', value)}
          />
        </label>
        <label>
          Телефон
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={({ target: { value } }) => onChange('phone', value)}
          />
        </label>
        <label>
          Электронная почта
          <input
            name="email"
            type="text"
            value={formData.email}
            onChange={({ target: { value } }) => onChange('email', value)}
          />
        </label>
        <label className="textarea-wrapper">
          Другая информация
          <textarea value={formData.other} onChange={({ target: { value } }) => onChange('other', value)} />
        </label>
        <RangePicker
          format="DD.MM.YYYY"
          value={formData.date}
          onChange={(value) => onChange('date', value)}
        />
        <div className="wrapper-controller">
          <input disabled={disabled} type="button" value="Отправить" onClick={onSubmit} />
        </div>
        {message ? <p className="message">{message}</p> : null}
      </form>
    </div>
  );
};

export default Demo;
