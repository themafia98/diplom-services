import React from "react";
import { connect } from "react-redux";
import { Pagination, Button, message } from "antd";

import config from '../../../../config.json';
import Scrollbars from 'react-custom-scrollbars';
import { setActiveTabAction, openPageWithDataAction } from "../../../../Redux/actions/routerActions";
import { middlewareCaching } from "../../../../Redux/actions/publicActions/middleware";

import TabContainer from "../../../TabContainer";
import NewsCard from "./NewsCard";
import TitleModule from "../../../TitleModule";

import { routePathNormalise } from "../../../../Utils";
import { newsArray } from "./testData";

class News extends React.PureComponent {
    state = {
        isLoading: false,
        isOpen: false,
        prewPage: 1,
        currentPage: 1,
        start: 0,
        newsArray: [...newsArray],
        counter: newsArray.length < 8 ? newsArray.length : 8,
        intialDefault: newsArray.length < 8 ? newsArray.length : 8,
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

    onOpen = key => {
        const { onOpenPageWithData, router: { actionTabs = [] } = {}, setCurrentTab } = this.props;
        const { newsArray = [] } = this.state;
        const moduleId = "informationPage";
        const page = "contactModule";

        const routeNormalize = routePathNormalise({
            pathType: "moduleItem",
            pathData: { page, moduleId, key }
        });

        const index = actionTabs.findIndex(tab => tab === routeNormalize.path);
        const data = newsArray.find(it => it.id === key);
        const isFind = index !== -1;

        if (!isFind) {

            if (config.tabsLimit <= actionTabs.length)
                return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

            onOpenPageWithData({
                activePage: routeNormalize,
                routeDataActive: { key, listdata: data ? { ...data } : {} }
            });
        } else setCurrentTab(actionTabs[index]);
    };

    renderNewsBlock = currentPage => {
        const { newsArray = [] } = this.state;

        const start = currentPage > 1 ? currentPage * 4 - 4 : 0;
        let arrayCards = [...newsArray];

        return arrayCards
            .slice(start, start + 4 > arrayCards.length ? arrayCards.length : start + 4)
            .map(it => {
                return <NewsCard onClick={this.onOpen.bind(this, it.id)} className="card" key={it.id} data={it} />;
            })
            .filter(Boolean);
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
        const rules = true;
        return (
            <div className="news">
                <Scrollbars>
                    <TitleModule classNameTitle="mainModuleTitle" title="Информация" />
                    {rules ? <Button type="primary">Создать новость</Button> : null}
                    <TabContainer visible={!isOpen}>
                        <div className="news__main">
                            <div className="col-fullscreen">{this.renderNewsBlock(currentPage)}</div>
                        </div>
                        <Pagination
                            className="pagination-news"
                            onChange={this.onChange}
                            pageSize={(newsArray.length / 4) | 0}
                            defaultCurrent={currentPage}
                            total={newsArray.length}
                        />
                    </TabContainer>
                </Scrollbars>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        storeCache: state.publicReducer.caches,
        router: state.router
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
