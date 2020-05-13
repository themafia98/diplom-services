//@ts-nocheck
import React, { useState } from 'react';
import _ from 'lodash';
import { DatePicker } from 'antd';
import moment from 'moment';

import Request from '../../Models/Rest';

import style from './demo.module.scss';

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

  const onSubmit = _.debounce(async (event) => {
    event.preventDefault();
    if (disabled) return;

    if (message) setMessage('');
    debugger;
    try {
      const rest = new Request();
      const res = await rest.sendRequest(
        '/tasks/regTicket',
        'PUT',
        {
          ...formData,
          date: [
            formData.date[0].format('DD.MM.YYYY HH:mm:ss'),
            formData.date[1].format('DD.MM.YYYY HH:mm:ss'),
          ],
        },
        false,
      );

      if (res.status !== 200) throw new Error('Не удалось отправить заявку');
      setMessage('Ваша заявка принята');
      setFormData({
        name: '',
        lastName: '',
        address: '',
        phone: '',
        email: '',
        other: '',
        cause: '',
        date: [moment(), moment()],
      });
      setDisabled(true);
    } catch (error) {
      const { request: { status = '' } = {}, response: { data = '' } = [] } = error || {};
      console.error(error);

      if (status === 404 || status === 503) setMessage('Ошибка обработки заявки');
      if (status === 429 && data) setMessage(data);
      else setMessage(error.message);
    }
  }, 600);

  return (
    <div className={style.demoPage}>
      <h1 className="title">Форма обращения в учереждение здравоохранения</h1>
      <form name="ticket" className="demo-form">
        <label>
          Имя
          <input
            required={true}
            autoFocus={true}
            name="name"
            type="text"
            placeholder="John"
            value={formData.value}
            onChange={({ target: { value } }) => onChange('name', value)}
          />
        </label>
        <label>
          Фамилия
          <input
            required={true}
            name="lastName"
            type="text"
            placeholder="Smit"
            value={formData.lastName}
            onChange={({ target: { value } }) => onChange('lastName', value)}
          />
        </label>
        <label>
          Причина
          <input
            required={true}
            name="cause"
            placeholder="sick"
            type="text"
            value={formData.cause}
            onChange={({ target: { value } }) => onChange('cause', value)}
          />
        </label>
        <label>
          Адрес
          <input
            required={true}
            name="address"
            placeholder="Jon's street 6, apt. 9"
            type="text"
            value={formData.address}
            onChange={({ target: { value } }) => onChange('address', value)}
          />
        </label>
        <label>
          Телефон
          <input
            required={true}
            placeholder="+37529..."
            type="tel"
            value={formData.phone}
            onChange={({ target: { value } }) => onChange('phone', value)}
          />
        </label>
        <label>
          Электронная почта
          <input
            required={true}
            name="email"
            placeholder="mail@mail.com"
            type="text"
            value={formData.email}
            onChange={({ target: { value } }) => onChange('email', value)}
          />
        </label>
        <label className="textarea-wrapper">
          Другая информация
          <textarea
            placeholder="I want..."
            value={formData.other}
            onChange={({ target: { value } }) => onChange('other', value)}
          />
        </label>
        <RangePicker
          className={style.rangePickerCss}
          format="DD.MM.YYYY HH:mm:ss"
          value={formData.date}
          onChange={(value) => onChange('date', value)}
        />
        <div className={style.wrapperController}>
          <input disabled={disabled} type="button" value="Отправить" onClick={onSubmit} />
        </div>
        {message ? <p className={style.message}>{message}</p> : null}
      </form>
    </div>
  );
};

export default Demo;
