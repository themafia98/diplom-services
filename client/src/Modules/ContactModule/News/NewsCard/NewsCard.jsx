import React, { useMemo } from 'react';
import { newsCardType } from '../../ContactModule.types';
import _ from 'lodash';
import { Card, Button } from 'antd';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const NewsCard = ({ onClick, className, data }) => {
  const { t } = useTranslation();
  const cardTitle = useMemo(() => (data?.title ? data?.title : data?._id ? data?._id : null), [data]);

  if (!data || _.isEmpty(data)) return null;

  return (
    <Card
      className={clsx('news-card', className ? className : null)}
      title={cardTitle}
      extra={
        <Button onClick={onClick} type="primary">
          {t('news_card_readButton')}
        </Button>
      }
    >
      {t('news_card_cardContent')}
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
