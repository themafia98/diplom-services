import React from 'react';
import { useTranslation } from 'react-i18next';

const LogItem = ({ index, editor, timeLost, date, message }) => {
  const { t } = useTranslation();
  return (
    <div key={index} className="journalItem">
      <p className="editor">{editor}</p>
      <p className="timeLost">
        <span className="title">{t('taskModule_view_spendTime')}:</span>
        {timeLost}
      </p>
      <p className="date">
        <span className="title">{t('taskModule_view_historyDate')}:</span>
        {date}
      </p>
      <p className="comment">
        <span className="title">{t('taskModule_view_comments')}:</span>
      </p>
      <p className="msg">{message}</p>
    </div>
  );
};

export default LogItem;
