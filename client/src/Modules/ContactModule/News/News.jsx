import React, { memo, useState, useCallback, useMemo } from 'react';
import { newsType } from '../ContactModule.types';
import { useDispatch, useSelector } from 'react-redux';
import { Pagination, Button, message, Empty, Spin } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import { addTabAction, setActiveTabAction } from 'Redux/actions/routerActions';
import NewsCard from './NewsCard';
import Title from 'Components/Title';
import { routePathNormalise, routeParser } from 'Utils';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { openTab } from 'Redux/actions/routerActions/middleware';
import { useTranslation } from 'react-i18next';

const News = memo(({ data }) => {
  const { news: newsData = [], loading = false, load = false } = data || {};

  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();

  const { router, appConfig } = useSelector((state) => {
    const { publicReducer, router } = state;
    const { appConfig } = publicReducer;
    return {
      router,
      appConfig,
    };
  });

  const { activeTabs = [], routeData = {} } = router;
  const { contactModule = {} } = routeData;
  const { news: newsStore = [] } = contactModule;

  const onOpenCreateNews = useCallback(() => {
    const moduleId = 'createNews';
    const page = 'contactModule';
    const { tabsLimit = 0 } = appConfig;

    const { path: pathNormalize = '' } = routePathNormalise({
      pathData: { page, moduleId },
    });

    const index = activeTabs.findIndex((tab) => tab === pathNormalize);
    const isFind = index !== -1;

    if (isFind) dispatch(setActiveTabAction(activeTabs[index], { hardCodeUpdate: false }));

    if (tabsLimit <= activeTabs.length) {
      message.error(`${t('globalMessages_messages_maxTabs')} ${tabsLimit}`);
      return;
    }

    if (!isFind)
      dispatch(
        addTabAction({
          tab: routeParser({ path: pathNormalize }),
          config: { hardCodeUpdate: false },
        }),
      );
  }, [activeTabs, appConfig, dispatch, t]);

  const onOpen = useCallback(
    (uuid) => {
      const dataList = Array.isArray(newsData) ? newsData : newsStore;
      const data = dataList?.find(({ _id = '' }) => _id === uuid) || dataList || {};

      dispatch(openTab({ uuid, data, action: 'contactModule' }));
    },
    [dispatch, newsData, newsStore],
  );

  const renderNewsBlock = useCallback(
    (currentPage, listdata = []) => {
      const start = currentPage > 1 ? currentPage * 4 - 4 : 0;

      if (!listdata?.length) return <Empty description={<span>{t('news_list_emptyData')}</span>} />;

      return listdata
        .slice(start, start + 4 > listdata.length ? listdata.length : start + 4)
        ?.map((it, index) => (
          <NewsCard key={it._id || index} onClick={onOpen.bind(this, it._id)} className="card" data={it} />
        ));
    },
    [onOpen, t],
  );

  const onChange = (pageNumber) => {
    if (currentPage === pageNumber) return;

    setCurrentPage(pageNumber);
  };

  const listdata = useMemo(
    () => (newsData && Array.isArray(newsData) ? newsData : newsStore?.length ? newsStore : []),
    [newsData, newsStore],
  );

  const pageSize = 4;
  const total = Math.ceil(listdata.length - 1 / pageSize);

  return (
    <div className="news">
      <Title classNameTitle="mainModuleTitle" title={t('news_list_title')} />
      <Button onClick={onOpenCreateNews} type="primary">
        {t('news_list_createNewsButton')}
      </Button>
      <Scrollbars autoHide hideTracksWhenNotNeeded>
        <div className="news__main">
          <div className="col-fullscreen">
            {(loading && !listdata?.length) || !load ? (
              <Spin size="large" tip={t('news_list_loadingList')} />
            ) : (
              renderNewsBlock(currentPage, listdata)
            )}
          </div>
        </div>
        <Pagination
          className="pagination-news"
          onChange={onChange}
          current={currentPage}
          pageSize={pageSize}
          defaultCurrent={currentPage}
          total={total ? total : undefined}
        />
      </Scrollbars>
    </div>
  );
});

News.defaultProps = {
  data: {},
};

News.propTypes = newsType;

export default moduleContextToProps(News);
