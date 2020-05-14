// @ts-nocheck
import React from 'react';
import { newsType } from '../types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Pagination, Button, message, Empty, Spin } from 'antd';

import Scrollbars from 'react-custom-scrollbars';
import { setActiveTabAction, openPageWithDataAction } from '../../../Redux/actions/routerActions';
import { middlewareCaching } from '../../../Redux/actions/publicActions/middleware';

import TabContainer from '../../../Components/TabContainer';
import NewsCard from './NewsCard';
import TitleModule from '../../../Components/TitleModule';

import { routePathNormalise } from '../../../Utils';

import modelContext from '../../../Models/context';

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

    if (load && isLoading) {
      this.setState({
        ...this.state,
        load: true,
      });
    }
  };

  onOpenCreateNews = (event) => {
    const { onOpenPageWithData, router: { actionTabs = [] } = {}, setCurrentTab } = this.props;
    const moduleId = 'createNews';
    const page = 'contactModule';
    const { config = {} } = this.context;

    const routeNormalize = routePathNormalise({
      pathData: { page, moduleId },
    });

    const index = actionTabs.findIndex((tab) => tab === routeNormalize.path);
    const isFind = index !== -1;

    if (!isFind) {
      if (config.tabsLimit <= actionTabs.length)
        return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);
      onOpenPageWithData({
        activePage: routeNormalize,
        routeDataActive: { key: routeNormalize.path, title: 'Создание новой новости' },
      });
    } else setCurrentTab(actionTabs[index]);
  };

  onOpen = (openKey = '') => {
    const {
      onOpenPageWithData,
      router: { actionTabs = [], routeData: { contactModule: { news = [] } = {} } = {} } = {},
      setCurrentTab,
      data = {},
    } = this.props;
    const { config = {} } = this.context;

    const key = _.isString(openKey) ? openKey.replace('_informationPage', '') : '';

    let listdata = data && data.news && Array.isArray(data.news) ? [...data.news] : news;
    const moduleId = 'informationPage';
    const page = 'contactModule';

    const routeNormalize = routePathNormalise({
      pathType: 'moduleItem',
      pathData: { page, key },
    });

    const index = actionTabs.findIndex((tab) => tab.replace('_informationPage', '') === routeNormalize.path);
    const findItem = listdata.find((it) => it._id === key);
    const dataFind = findItem ? { ...findItem } : {};
    const isFind = index !== -1;

    if (!isFind) {
      if (config.tabsLimit <= actionTabs.length)
        return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);
      onOpenPageWithData({
        activePage: routePathNormalise({
          pathType: 'moduleItem',
          pathData: { page, key, moduleId },
        }),
        routeDataActive: { key, listdata: dataFind ? { ...dataFind } : {} },
      });
    } else setCurrentTab(actionTabs[index]);
  };

  renderNewsBlock = (currentPage) => {
    const { path = '' } = this.props;
    const {
      router: { routeData: { [path]: { news = [] } = {} } = {} },
    } = this.props;

    const start = currentPage > 1 ? currentPage * 4 - 4 : 0;
    let listdata = news;
    if (!listdata.length) return <Empty description={<span>Данных нету</span>} />;

    /**
     * @type {Array}
     */
    const pageCards = listdata.slice(start, start + 4 > listdata.length ? listdata.length : start + 4);

    return pageCards.map((it, index) => {
      return (
        <NewsCard key={it._id || index} onClick={this.onOpen.bind(this, it._id)} className="card" data={it} />
      );
    });
  };

  onChange = (pageNumber) => {
    const { currentPage } = this.state;
    if (currentPage !== pageNumber)
      this.setState({
        ...this.state,
        currentPage: pageNumber,
      });
  };

  render() {
    const { currentPage, isOpen } = this.state;
    const {
      data = {},
      statusApp,
      router: { routeData: { contactModule: { news = [] } = {} } = {} },
      isLoading = false,
    } = this.props;
    let listdata = data && data.news && Array.isArray(data.news) ? [...data.news] : news.length ? news : data;
    const rules = true;

    const pageSize = 4;

    const total = Math.ceil(listdata.length - 1 / pageSize);

    return (
      <div className="news">
        <TitleModule classNameTitle="mainModuleTitle" title="Информация" />
        {rules ? (
          <Button disabled={statusApp === 'offline'} onClick={this.onOpenCreateNews} type="primary">
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
    setCurrentTab: (tab) => dispatch(setActiveTabAction(tab)),
    onCaching: async (props) => await dispatch(middlewareCaching(props)),
  };
};

export default connect(mapStateToProps, mapDispathToProps)(News);
