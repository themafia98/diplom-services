import React, { useMemo } from 'react';
import { newsCardType } from '../../ContactModule.types';
import _ from 'lodash';
import { Card, Button } from 'antd';
import clsx from 'clsx';

const NewsCard = ({ onClick, className, data }) => {
  const cardTitle = useMemo(() => (data?.title ? data?.title : data?._id ? data?._id : null), [data]);

  if (!data || _.isEmpty(data)) return null;

  return (
    <Card
      className={clsx('news-card', className ? className : null)}
      title={cardTitle}
      extra={
        <Button onClick={onClick} type="primary">
          Читать
        </Button>
      }
    >
      Нажмите "читать" для просмотра новости.
    </Card>
  );
};

NewsCard.defaultProps = {
  onClick: null,
  className: '',
  data: {},
};
NewsCard.propTypes = newsCardType;
export default NewsCard;
