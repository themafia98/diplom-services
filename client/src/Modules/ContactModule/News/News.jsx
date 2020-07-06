import React from 'react';
import { newsType } from '../types';
import { connect } from 'react-redux';
import { Pagination, Button, message, Empty, Spin } from 'antd';

import Scrollbars from 'react-custom-scrollbars';
import { setActiveTabAction, openPageWithDataAction, addTabAction } from 'Redux/actions/routerActions';
import { middlewareCaching } from 'Redux/actions/publicActions/middleware';

import TabContainer from 'Components/TabContainer';
import NewsCard from './NewsCard';
import TitleModule from 'Components/TitleModule';

import { routePathNormalise, routeParser } from 'Utils';

import modelContext from 'Models/context';

class News extends React.PureComponent {
  state = {
    isLoading: false,
    isOpen: false,
    prewPage: 1,
    currentPage: 1,
    start: 0,
    load: false,
  };

  static contextType = modelContext;
  static propTypes = newsType;

  componentDidUpdate = () => {
    const { load, isLoading } = this.state;

    if (!load && !isLoading) return;

    this.setState({
      ...this.state,
      load: true,
    });
  };

  onOpenCreateNews = () => {
    const { addTab, router: { activeTabs = [] } = {}, setCurrentTab } = this.props;
    const moduleId = 'createNews';
    const page = 'contactModule';
    const { config = {}, config: { tabsLimit = 0 } = {} } = this.context;

    const { path: pathNormalize = '' } = routePathNormalise({
      pathData: { page, moduleId },
    });

    const index = activeTabs.findIndex((tab) => tab === pathNormalize);
    const isFind = index !== -1;

    if (isFind) setCurrentTab(activeTabs[index], { hardCodeUpdate: false });

    if (tabsLimit <= activeTabs.length) {
      message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);
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
    } = this.props;
    const { config = {} } = this.context;

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

    if (config.tabsLimit <= activeTabs.length) {
      message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);
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

  renderNewsBlock = (currentPage) => {
    const { path = '' } = this.props;
    const {
      router: { routeData: { [path]: { news = [] } = {} } = {} },
    } = this.props;

    const start = currentPage > 1 ? currentPage * 4 - 4 : 0;
    let listdata = news;
    if (!listdata.length) return <Empty description={<span>Данных нету</span>} />;

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
    const { currentPage, isOpen } = this.state;
    const {
      data = {},
      router: { routeData: { contactModule: { news = [] } = {} } = {} },
      isLoading = false,
    } = this.props;
    let listdata = data?.news && Array.isArray(data.news) ? [...data.news] : news.length ? news : data;
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
        <Scrollbars hideTracksWhenNotNeeded={true}>
          <TabContainer visible={!isOpen}>
            <div className="news__main">
              <div className="col-fullscreen">
                {isLoading ? <Spin size="large" /> : this.renderNewsBlock(currentPage)}
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
          </TabContainer>
        </Scrollbars>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { publicReducer: { status: statusApp = '' } = {}, router = {} } = state;
  return {
    router,
    statusApp,
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

export default connect(mapStateToProps, mapDispathToProps)(News);
