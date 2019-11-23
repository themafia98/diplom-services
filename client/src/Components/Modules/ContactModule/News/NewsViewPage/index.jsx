import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import { openPageWithDataAction } from "../../../../../Redux/actions/routerActions";
import { loadCurrentData } from "../../../../../Redux/actions/routerActions/middleware";
import Loader from "../../../../Loader";
import TitleModule from "../../../../TitleModule";

import { newsArray } from "../testData";

class NewsViewPage extends React.PureComponent {
    state = {
        isLoading: true,
        loading: true,
        currentData: null
    };
    componentDidMount = () => {
        const {
            router: { routeDataActive: { activePage = "" } = {} }
        } = this.props;

        const data = newsArray.find(it => activePage === it.id) || {};

        this.setState({
            ...this.state,
            active: activePage,
            isLoading: !_.isEmpty(data) ? false : true,
            loading: !_.isEmpty(data) ? true : false,
            currentData: { ...data }
        });
    };

    componentDidUpdate = (prevProps, prevState) => {
        const {
            router: { routeDataActive: { activePage = "" } = {} }
        } = this.props;
        const { active } = this.state;

        if (activePage !== active) {
            const data = newsArray.find(it => activePage === it.id) || {};

            this.setState({
                ...this.state,
                active: activePage,
                isLoading: !_.isEmpty(data) ? false : true,
                loading: !_.isEmpty(data) ? true : false,
                currentData: { ...data }
            });
        }
    };

    render() {
        const { isLoading, currentData = {} } = this.state;

        if (isLoading || _.isEmpty(currentData)) return <Loader />;
        return (
            <div className="newsView-page">
                <TitleModule classNameTitle="tittle_contactModule_pageNews" title={currentData.title} />
                <div className="newsView-page__main">
                    <p>{currentData.content}</p>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        router: state.router,
        publicReducer: state.publicReducer
    };
};
const mapDispatchToProps = dispatch => {
    return {
        onOpenPageWithData: data => dispatch(openPageWithDataAction(data)),
        onLoadCurrentData: ({ path, storeLoad }) => dispatch(loadCurrentData({ path, storeLoad }))
    };
};

export { NewsViewPage };
export default connect(mapStateToProps, mapDispatchToProps)(NewsViewPage);
