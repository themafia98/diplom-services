// @ts-nocheck
import React, { useState } from 'react';
import Request from '../../Models/Rest';
import { DatePicker, message } from 'antd';
import moment from 'moment';
const { RangePicker } = DatePicker;
const LandingPage = (props) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    address: '',
    phone: '',
    recordingDay: [moment(), moment()],
  });

  const onChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    debugger;
    form.append(
      'recordingDay',
      JSON.stringify([
        formData.recordingDay[0].format('DD.MM.YYYY'),
        formData.recordingDay[1].format('DD.MM.YYYY'),
      ]),
    );
    try {
      const rest = new Request();
      const res = await rest.sendRequest('/ticket', 'POST', form, false);

      if (res.status === 200) {
        message.success('Заявка зарегистрирована, вам скоро перезвонят');
      }
    } catch (error) {
      message.warning('Заявка отклонена');
    }
  };

  return (
    <div className="landingPage">
      <header>
        <h1>Получить талон к врачу</h1>
      </header>
      <section>
        <form name="ticket" onSubmit={onSubmit}>
          <div>
            <label>Имя </label>
            <input
              name="name"
              onChange={({ target: { value = '' } = {} }) => onChange('name', value)}
              type="text"
              value={formData.name}
            />
          </div>
          <div>
            <label>Фамилия </label>
            <input
              name="lastName"
              onChange={({ target: { value = '' } = {} }) => onChange('lastName', value)}
              type="text"
              value={formData.lastName}
            />
          </div>
          <div>
            <label>Адресс </label>
            <input
              name="address"
              onChange={({ target: { value = '' } = {} }) => onChange('address', value)}
              type="text"
              value={formData.address}
            />
          </div>
          <div>
            <label>Телефон</label>
            <input
              name="phone"
              onChange={({ target: { value = '' } = {} }) => onChange('phone', value)}
              type="phone"
              value={formData.phone}
            />
          </div>
          <div style={{ alignItems: 'unset', width: '50%' }}>
            <RangePicker
              value={formData.recordingDay}
              name="recordingDay"
              onChange={(value) => onChange('recordingDay', value)}
            />
          </div>
          <input type="submit" value="Отправить" />
        </form>
      </section>
      <footer></footer>
    </div>
  );
};

export default LandingPage;
