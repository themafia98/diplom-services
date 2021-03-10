export const getClassNameByStatus = (status) => {
  return status === 'Выполнен'
    ? 'done'
    : status === 'Закрыт'
    ? 'close'
    : status === 'В работе'
    ? 'active'
    : null;
};
