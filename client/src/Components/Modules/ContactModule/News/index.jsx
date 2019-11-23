import React from "react";
import { connect } from "react-redux";
import { Pagination } from "antd";
import { addTabAction, openPageWithDataAction } from "../../../../Redux/actions/routerActions";
import { middlewareCaching } from "../../../../Redux/actions/publicActions/middleware";
import NewsCard from "./NewsCard";
import TitleModule from "../../../TitleModule";
import NewsViewPage from "./NewsViewPage";

import { routePathNormalise } from "../../../../Utils";
import { newsArray } from "./testData";

class News extends React.PureComponent {
    state = {
        isLoading: false,
        prewPage: 1,
        currentPage: 1,
        start: 0,
        newsArray: [...newsArray],
        counter: newsArray.length < 8 ? newsArray.length : 8,
        intialDefault: newsArray.length < 8 ? newsArray.length : 8,
        load: false
    };

    componentDidMount = () => {
        const { storeCache = null } = this.props;
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
        const {
            onOpenPageWithData,
            router: { routeData = {}, currentActionTab = "", actionTabs = [] } = {},
            setCurrentTab
        } = this.props;

        onOpenPageWithData({
            activePage: routePathNormalise({
                pathType: "moduleItem",
                pathData: { page: "contactModule", moduleId: "informationPage", key }
            }),
            routeDataActive: { key, activePage: key }
        });
    };

    renderNewsBlock = currentPage => {
        const { start } = this.state;
        const {
            path = "",
            storeCache: {
                [path]: {
                    /** newsArray = [] */
                } = {}
            } = {}
        } = this.props;
        const { counter, intialDefault, newsArray = [] } = this.state;
        let arrayCards = [...newsArray];

        return arrayCards
            .slice(start, start + 4 > arrayCards.length ? arrayCards.length : start + 4)
            .map(it => {
                return <NewsCard onClick={this.onOpen.bind(this, it.id)} className="card" key={it.id} data={it} />;
            })
            .filter(Boolean);
    };

    onChange = pageNumber => {
        const { start, currentPage } = this.state;
        if (currentPage !== pageNumber)
            this.setState({
                ...this.state,
                currentPage: pageNumber,
                start: currentPage < pageNumber ? start + 4 : start - 4
            });
    };

    render() {
        const { currentPage, IsOpen, openKey } = this.state;
        return (
            <div className="news">
                <TitleModule classNameTitle="mainModuleTitle" title="Информация по предприятию" />
                {!IsOpen ? (
                    <React.Fragment>
                        <div className="news__main">
                            <div className="col-fullscreen">{this.renderNewsBlock(currentPage)}</div>
                        </div>
                        <Pagination
                            className="pagination-news"
                            onChange={this.onChange}
                            pageSize={~~(newsArray.length / 4)}
                            defaultCurrent={currentPage}
                            total={newsArray.length}
                        />
                    </React.Fragment>
                ) : (
                    <NewsViewPage key={openKey} id={openKey} IsOpen={IsOpen} />
                )}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        storeCache: state.publicReducer.caches
    };
};

const mapDispathToProps = dispatch => {
    return {
        onOpenPageWithData: data => dispatch(openPageWithDataAction(data)),
        onCaching: async (data, primaryKey, type, pk, store) =>
            await dispatch(middlewareCaching({ data, primaryKey, type, pk, store }))
    };
};

export default connect(mapStateToProps, mapDispathToProps)(News);
