import React, { memo, useState, useCallback, useMemo } from 'react';
import { newsType } from '../ContactModule.types';
import { connect } from 'react-redux';
import { Pagination, Button, message, Empty, Spin } from 'antd';

import Scrollbars from 'react-custom-scrollbars';
import { addTabAction } from 'Redux/actions/routerActions';
import { middlewareCaching } from 'Redux/actions/publicActions/middleware';

import NewsCard from './NewsCard';
import TitleModule from 'Components/TitleModule';

import { routePathNormalise, routeParser } from 'Utils';
import { compose } from 'redux';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { openTab } from 'Redux/actions/routerActions/middleware';

const News = memo(({ addTab, router, setCurrentTab, appConfig, data, onOpenTab }) => {
  const { activeTabs = [], routeData = {} } = router || {};
  const { news: newsData = [], loading = false, load = false } = data || {};
  const { contactModule: { news: newsStore = [] } = {} } = routeData;

  const [currentPage, setCurrentPage] = useState(1);

  const onOpenCreateNews = useCallback(() => {
    const moduleId = 'createNews';
    const page = 'contactModule';
    const { tabsLimit = 0 } = appConfig;

    const { path: pathNormalize = '' } = routePathNormalise({
      pathData: { page, moduleId },
    });

    const index = activeTabs.findIndex((tab) => tab === pathNormalize);
    const isFind = index !== -1;

    if (isFind) setCurrentTab(activeTabs[index], { hardCodeUpdate: false });

    if (tabsLimit <= activeTabs.length) {
      message.error(`Максимальное количество вкладок: ${tabsLimit}`);
      return;
    }

    if (!isFind) addTab(routeParser({ path: pathNormalize }), { hardCodeUpdate: false });
  }, [activeTabs, addTab, appConfig, setCurrentTab]);

  const onOpen = useCallback(
    (uuid) => {
      const dataList = Array.isArray(newsData) ? newsData : newsStore;
      const data = dataList?.find(({ _id = '' }) => _id === uuid) || dataList || {};

      onOpenTab({ uuid, data, action: 'contactModule' });
    },
    [newsData, newsStore, onOpenTab],
  );

  const renderNewsBlock = useCallback(
    (currentPage, listdata = []) => {
      const start = currentPage > 1 ? currentPage * 4 - 4 : 0;

      if (!listdata?.length) return <Empty description={<span>Данных нету</span>} />;

      return listdata
        .slice(start, start + 4 > listdata.length ? listdata.length : start + 4)
        ?.map((it, index) => (
          <NewsCard key={it._id || index} onClick={onOpen.bind(this, it._id)} className="card" data={it} />
        ));
    },
    [onOpen],
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
      <TitleModule classNameTitle="mainModuleTitle" title="Информация" />
      <Button onClick={onOpenCreateNews} type="primary">
        Создать новость
      </Button>
      <Scrollbars autoHide hideTracksWhenNotNeeded>
        <div className="news__main">
          <div className="col-fullscreen">
            {(loading && !listdata?.length) || !load ? (
              <Spin size="large" />
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
  addTab: null,
  router: {},
  setCurrentTab: null,
  appConfig: {},
  data: {},
  onOpenTab: null,
};

News.propTypes = newsType;

const mapStateToProps = (state) => {
  const { publicReducer: { status: statusApp = '', appConfig } = {}, router = {} } = state;
  return {
    router,
    statusApp,
    appConfig,
  };
};

const mapDispathToProps = (dispatch) => {
  return {
    addTab: (tab, config = {}) => dispatch(addTabAction({ tab, config })),
    onOpenTab: (params) => dispatch(openTab(params)),
    onCaching: async (params) => await dispatch(middlewareCaching(params)),
  };
};

export default compose(moduleContextToProps, connect(mapStateToProps, mapDispathToProps))(News);
