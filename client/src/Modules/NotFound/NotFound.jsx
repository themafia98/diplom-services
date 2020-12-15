import React, { useState } from 'react';
import { string, bool, oneOf } from 'prop-types';
import clsx from 'clsx';
import {
  notFoundModule,
  empty,
  traceBox,
  traceBoxVisible,
  notFoundTraceHeader,
  traceBox__traceMessage,
  iconRow,
} from './notFound.module.scss';
import { Button, Icon } from 'antd';

const NotFound = ({ message, showRedirectIndexButton, redirectType, trace }) => {
  const [stackList] = useState(() => new Error().stack);
  const [visible, setVisibility] = useState(false);

  const onChangeTraceMessageVisibility = () => setVisibility((value) => !value);

  const onRedirect = () => {
    if (redirectType === 'hard') window.location.reload(true);
    else window.location.reload(false);
  };

  return (
    <div className={notFoundModule}>
      <section className={empty}>
        <p>{message}</p>
        {showRedirectIndexButton ? <Button onClick={onRedirect}>Попробовать снова</Button> : null}
      </section>
      {process.env.NODE_ENV === 'development' && (
        <section className={traceBox}>
          <header className={notFoundTraceHeader} onClick={onChangeTraceMessageVisibility}>
            Trace
            <Icon className={iconRow} type={visible ? 'up' : 'down'} />
          </header>
          <article className={clsx(traceBox__traceMessage, visible && traceBoxVisible)}>
            <p>{trace}</p>
            <pre>{stackList}</pre>
          </article>
        </section>
      )}
    </div>
  );
};

NotFound.propsTypes = {
  message: string.isRequired,
  redirectType: oneOf(['hard', 'soft']).isRequired,
  showRedirectIndexButton: bool.isRequired,
  trace: string,
};

NotFound.defaultProps = {
  message: 'Страница удалена либо ещё не создана',
  trace: '',
  redirectType: 'soft',
  showRedirectIndexButton: false,
};

export default NotFound;
