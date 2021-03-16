import React, { useMemo } from 'react';
import { instanceOf, func } from 'prop-types';
import { useTranslation } from 'react-i18next';

const ErrorPage = ({ error, logger, update }) => {
  const { t } = useTranslation();

  const hideStyle = useMemo(() => {
    return { display: 'none' };
  }, []);

  return (
    <div className="errorPage">
      <p className="errorStatus">App crash</p>
      <p style={hideStyle} className="messageError">
        {error.message}
      </p>
      <button disabled={false} onClick={logger}>
        {t('components_errorPage_reportButton')}
      </button>
      <button onClick={update}>{t('components_errorPage_updateButton')}</button>
    </div>
  );
};
ErrorPage.propTypes = {
  error: instanceOf(Error).isRequired,
  logger: func.isRequired,
  update: func.isRequired,
};
export default ErrorPage;
