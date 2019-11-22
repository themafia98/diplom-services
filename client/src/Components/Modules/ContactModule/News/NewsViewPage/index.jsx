import React from "react";
import { connect } from "react-redux";
import { openPageWithDataAction } from "../../../../../Redux/actions/routerActions";
import { loadCurrentData } from "../../../../../Redux/actions/routerActions/middleware";

class NewsViewPage extends React.PureComponent {
    render() {
        return (
            <div className="newsView-page">
                <div className="newsView-page__main">NewsViewPage</div>
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
