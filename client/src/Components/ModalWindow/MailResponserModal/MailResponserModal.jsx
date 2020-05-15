// @ts-nocheck
import React, { useState, useContext } from 'react';
import { mailResponserType } from '../types';
import { Input, message, Modal } from 'antd';
import modalContext from '../../../Models/context';

const MailResponserModal = (props) => {
  const {
    routeDataActive: { additionalCreaterData: { email = '' } = {} } = {},
    visibleModal,
    handleCancel,
    handleOk,
  } = props || {};
  const context = useContext(modalContext);
  const [formData, setFormData] = useState({
    themeMail: 'Ответ на заявку об указании услуг',
    mailBody: '',
  });

  const [loading, setLoading] = useState(false);

  const onChange = (key, { target: { value } }) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const onSubmit = async (event) => {
    const { Request } = context || {};
    const { mailBody, themeMail } = formData || {};
    if (!mailBody) {
      message.error('Тело письма пустое.');
      return;
    }
    try {
      setLoading(true);
      const rest = new Request();
      await rest.sendRequest(
        '/mailerResponse',
        'POST',
        {
          queryParams: {
            to: email,
            mailBody,
            themeMail,
          },
        },
        true,
      );

      setLoading(false);
      message.success('Ответ отправлен');
      if (handleOk) handleOk(event, 'close');
      if (handleCancel) handleCancel(event);
    } catch (error) {
      console.error(error);
      setLoading(false);
      message.error('Оибка отправки ответа, либо получатель не найден');
    }
  };

  return (
    <Modal
      className="modalWindow"
      visible={visibleModal}
      onOk={onSubmit}
      destroyOnClose={true}
      onCancel={handleCancel}
      okText="Отправить"
      confirmLoading={loading}
      title="Форма ответа"
    >
      <div className="mailResponser">
        <form className="mailerSender_form">
          <p className="toEmail">Адрес почты получателя: {email ? email : 'Не найдена'}</p>
          <label className="themeMail label">Тема письма:</label>
          <Input onChange={(event) => onChange('themeMail', event)} value={formData.themeMail} />
          <label className="mailBody label">Содержание письма:</label>
          <Input onChange={(event) => onChange('mailBody', event)} value={formData.mailBody} />
        </form>
      </div>
    </Modal>
  );
};

MailResponserModal.defaultProps = {
  routeDataActive: {},
  visibleModal: false,
  handleCancel: null,
  handleOk: null,
};

MailResponserModal.propTypes = mailResponserType;

export default MailResponserModal;
