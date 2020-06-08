import React from 'react';
import clsx from 'clsx';
import styleNotFound from './notFound.module.scss';

const NotFound = () => {
  return (
    <div className={clsx('notFound-module', styleNotFound.empty)}>Страница удалена либо ещё не создана</div>
  );
};

export default NotFound;
