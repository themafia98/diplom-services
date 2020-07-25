import React from 'react';
import { newsType } from '../types';
import { connect } from 'react-redux';
import { Pagination, Button, message, Empty, Spin } from 'antd';

import Scrollbars from 'react-custom-scrollbars';
import { setActiveTabAction, openPageWithDataAction, addTabAction } from 'Redux/actions/routerActions';
import { middlewareCaching } from 'Redux/actions/publicActions/middleware';

import NewsCard from './NewsCard';
import TitleModule from 'Components/TitleModule';

import { routePathNormalise, routeParser } from 'Utils';
import { compose } from 'redux';
import { moduleContextToProps } from 'Components/Helpers/moduleState';

class News extends React.PureComponent {
  state = {
    isOpen: false,
    prewPage: 1,
    currentPage: 1,
    start: 0,
  };

  static propTypes = newsType;

  onOpenCreateNews = () => {
    const { addTab, router: { activeTabs = [] } = {}, setCurrentTab, appConfig } = this.props;
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
  };

  onOpen = (openKey = '') => {
    const {
      onOpenPageWithData,
      router: { activeTabs = [], routeData: { contactModule: { news = [] } = {} } = {} } = {},
      setCurrentTab,
      data = {},
      appConfig: { tabsLimit = 0 },
    } = this.props;

    const key = typeof openKey === 'string' ? openKey.replace('_informationPage', '') : '';

    let listdata = data && data.news && Array.isArray(data.news) ? [...data.news] : news;
    const moduleId = 'informationPage';
    const page = 'contactModule';

    const routeNormalize = routePathNormalise({
      pathType: 'moduleItem',
      pathData: { page, key },
    });

    const index = activeTabs.findIndex((tab) => tab.replace('_informationPage', '') === routeNormalize.path);
    const findItem = listdata.find((it) => it._id === key);
    const dataFind = findItem ? { ...findItem } : {};
    const isFind = index !== -1;

    if (isFind) {
      setCurrentTab(activeTabs[index]);
      return;
    }

    if (tabsLimit <= activeTabs.length) {
      message.error(`Максимальное количество вкладок: ${tabsLimit}`);
      return;
    }

    onOpenPageWithData({
      activePage: routePathNormalise({
        pathType: 'moduleItem',
        pathData: { page, key, moduleId },
      }),
      routeDataActive: { key, listdata: dataFind ? { ...dataFind } : {} },
    });
  };

  renderNewsBlock = (currentPage, listdata = []) => {
    const start = currentPage > 1 ? currentPage * 4 - 4 : 0;

    if (!listdata?.length) return <Empty description={<span>Данных нету</span>} />;

    return listdata
      .slice(start, start + 4 > listdata.length ? listdata.length : start + 4)
      ?.map((it, index) => (
        <NewsCard key={it._id || index} onClick={this.onOpen.bind(this, it._id)} className="card" data={it} />
      ));
  };

  onChange = (pageNumber) => {
    const { currentPage } = this.state;
    if (currentPage === pageNumber) return;

    this.setState({
      ...this.state,
      currentPage: pageNumber,
    });
  };

  render() {
    const { currentPage } = this.state;
    const {
      data: { news: newsData = [], loading = false, load = false } = {},
      router: { routeData: { contactModule: { news: newsStore = [] } = {} } = {} },
    } = this.props;
    const listdata = newsData && Array.isArray(newsData) ? newsData : newsStore?.length ? newsStore : [];
    const rules = true;

    const pageSize = 4;
    const total = Math.ceil(listdata.length - 1 / pageSize);

    return (
      <div className="news">
        <TitleModule classNameTitle="mainModuleTitle" title="Информация" />
        {rules ? (
          <Button onClick={this.onOpenCreateNews} type="primary">
            Создать новость
          </Button>
        ) : null}
        <Scrollbars autoHide hideTracksWhenNotNeeded>
          <div className="news__main">
            <div className="col-fullscreen">
              {(loading && !listdata?.length) || !load ? (
                <Spin size="large" />
              ) : (
                this.renderNewsBlock(currentPage, listdata)
              )}
            </div>
          </div>
          <Pagination
            className="pagination-news"
            onChange={this.onChange}
            current={currentPage}
            pageSize={pageSize}
            defaultCurrent={currentPage}
            total={total ? total : undefined}
          />
        </Scrollbars>
      </div>
    );
  }
}

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
    onOpenPageWithData: (data) => dispatch(openPageWithDataAction(data)),
    addTab: (tab, config = {}) => dispatch(addTabAction({ tab, config })),
    setCurrentTab: (tab, config = {}) => dispatch(setActiveTabAction({ tab, config })),
    onCaching: async (props) => await dispatch(middlewareCaching(props)),
  };
};

export default compose(moduleContextToProps, connect(mapStateToProps, mapDispathToProps))(News);
