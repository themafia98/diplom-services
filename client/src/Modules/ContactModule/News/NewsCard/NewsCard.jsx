import React from 'react';
import { newsCardType } from '../../types';
import _ from 'lodash';
import { Card, Button } from 'antd';
import clsx from 'clsx';

const NewsCard = (props) => {
  const { onClick, className, data } = props;

  if (!data || _.isEmpty(data)) return null;
  else
    return (
      <Card
        className={clsx('news-card', className ? className : null)}
        title={data?.title ? data?.title : data?._id ? data?._id : null}
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
