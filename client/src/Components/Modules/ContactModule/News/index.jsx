import React from "react";
import { connect } from "react-redux";

import { middlewareCaching } from "../../../../Redux/actions/publicActions/middleware";
import TitleModule from "../../../TitleModule";

class News extends React.PureComponent {
    state = {
        isLoading: false,
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

    renderNewsBlock = () => {
        const { path = "", storeCache: { [path]: { newsArray = [] } = {} } = {} } = this.props;
        return newsArray.map(it => {
            return <div className="news-card"></div>;
        });
    };

    render() {
        return (
            <div className="news">
                <TitleModule classNameTitle="mainModuleTitle" title="Информация по предприятию" />
                <div className="news__main">
                    <div className="col-fullscreen">{this.renderNewsBlock()}</div>
                </div>
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
        onCaching: async (data, primaryKey, type, pk, store) =>
            await dispatch(middlewareCaching({ data, primaryKey, type, pk, store }))
    };
};

export default connect(mapStateToProps, mapDispathToProps)(News);
