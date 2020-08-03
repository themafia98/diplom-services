import React from 'react';
import { string, bool, oneOf } from 'prop-types';
import clsx from 'clsx';
import styleNotFound from './notFound.module.scss';
import { Button } from 'antd';

const NotFound = ({ message, showRedirectIndexButton, redirectType }) => {
  const onRedirect = () => {
    if (redirectType === 'hard') window.location.reload(true);
    else window.location.reload(false);
  };

  return (
    <div className={clsx('notFound-module', styleNotFound.empty)}>
      <p>{message}</p>
      {showRedirectIndexButton ? (
        <Button onClick={onRedirect} type="default">
          Попробовать снова
        </Button>
      ) : null}
    </div>
  );
};

NotFound.propsTypes = {
  message: string.isRequired,
  redirectType: oneOf(['hard', 'soft']).isRequired,
  showRedirectIndexButton: bool.isRequired,
};

NotFound.defaultProps = {
  message: 'Страница удалена либо ещё не создана',
  redirectType: 'soft',
  showRedirectIndexButton: false,
};

export default NotFound;
