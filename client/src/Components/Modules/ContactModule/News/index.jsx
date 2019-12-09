import React from "react";
import { connect } from "react-redux";
import { Pagination, Button, message, Empty } from "antd";

import config from "../../../../config.json";
import Scrollbars from "react-custom-scrollbars";
import { setActiveTabAction, openPageWithDataAction } from "../../../../Redux/actions/routerActions";
import { middlewareCaching } from "../../../../Redux/actions/publicActions/middleware";

import TabContainer from "../../../TabContainer";
import NewsCard from "./NewsCard";
import TitleModule from "../../../TitleModule";

import { routePathNormalise } from "../../../../Utils";

class News extends React.PureComponent {
    state = {
        isLoading: false,
        isOpen: false,
        prewPage: 1,
        currentPage: 1,
        start: 0,

        load: false
    };

    componentDidUpdate = () => {
        const { load, isLoading } = this.state;
        if (load && isLoading) {
            this.setState({
                ...this.state,
                load: true
            });
        }
    };

    onOpenCreateNews = event => {
        const { onOpenPageWithData, router: { actionTabs = [] } = {}, setCurrentTab } = this.props;
        const moduleId = "createNews";
        const page = "contactModule";

        const routeNormalize = routePathNormalise({
            pathData: { page, moduleId }
        });

        const index = actionTabs.findIndex(tab => tab === routeNormalize.path);
        const isFind = index !== -1;

        if (!isFind) {
            if (config.tabsLimit <= actionTabs.length)
                return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);
            onOpenPageWithData({
                activePage: routeNormalize,
                routeDataActive: { key: routeNormalize.path, title: "Создание новой новости" }
            });
        } else setCurrentTab(actionTabs[index]);
    };

    onOpen = key => {
        const { onOpenPageWithData, router: { actionTabs = [] } = {}, setCurrentTab, data = {} } = this.props;
        let listdata = data && data.news && Array.isArray(data.news) ? [...data.news] : [];
        const moduleId = "informationPage";
        const page = "contactModule";

        const routeNormalize = routePathNormalise({
            pathType: "moduleItem",
            pathData: { page, moduleId, key }
        });

        const index = actionTabs.findIndex(tab => tab === routeNormalize.path);
        const findItem = listdata.find(it => it.id === key);
        const dataFind = findItem ? { ...findItem } : {};
        const isFind = index !== -1;

        if (!isFind) {
            if (config.tabsLimit <= actionTabs.length)
                return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);
            onOpenPageWithData({
                activePage: routeNormalize,
                routeDataActive: { key, listdata: dataFind ? { ...dataFind } : {} }
            });
        } else setCurrentTab(actionTabs[index]);
    };

    renderNewsBlock = currentPage => {
        const { data = {} } = this.props;

        const start = currentPage > 1 ? currentPage * 4 - 4 : 0;
        let listdata = data && data.news && Array.isArray(data.news) ? [...data.news] : [];
        if (listdata.length)
            return listdata
                .slice(start, start + 4 > listdata.length ? listdata.length : start + 4)
                .map((it, index) => {
                    return (
                        <NewsCard
                            key={it._id || Math.random()}
                            onClick={this.onOpen.bind(this, it._id)}
                            className="card"
                            data={it}
                        />
                    );
                })
                .filter(Boolean);
        else return <Empty description={<span>Данных нету</span>} />;
    };

    onChange = pageNumber => {
        const { currentPage } = this.state;
        if (currentPage !== pageNumber)
            this.setState({
                ...this.state,
                currentPage: pageNumber
            });
    };

    render() {
        const { currentPage, isOpen } = this.state;
        const { data = {}, statusApp } = this.props;
        let listdata = data && data.news && Array.isArray(data.news) ? [...data.news] : [];
        const rules = true;

        const total = Math.ceil(listdata.length / 4);
        const pageSize = listdata.length > 4 ? (listdata.length / 4) | 0 : 1;

        return (
            <div className="news">
                <TitleModule classNameTitle="mainModuleTitle" title="Информация" />
                {rules ? (
                    <Button disabled={statusApp === "offline"} onClick={this.onOpenCreateNews} type="primary">
                        Создать новость
                    </Button>
                ) : null}
                <Scrollbars>
                    <TabContainer visible={!isOpen}>
                        <div className="news__main">
                            <div className="col-fullscreen">{this.renderNewsBlock(currentPage)}</div>
                        </div>
                        <Pagination
                            className="pagination-news"
                            onChange={this.onChange}
                            pageSize={pageSize}
                            defaultCurrent={currentPage}
                            total={total}
                        />
                    </TabContainer>
                </Scrollbars>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const { publicReducer: { status: statusApp = "" } = {}, router = {} } = state;
    return {
        router,
        statusApp
    };
};

const mapDispathToProps = dispatch => {
    return {
        onOpenPageWithData: data => dispatch(openPageWithDataAction(data)),
        setCurrentTab: tab => dispatch(setActiveTabAction(tab)),
        onCaching: async (data, primaryKey, type, pk, store) =>
            await dispatch(middlewareCaching({ data, primaryKey, type, pk, store }))
    };
};

export default connect(mapStateToProps, mapDispathToProps)(News);
