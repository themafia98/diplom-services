import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import { openPageWithDataAction } from "../../../../../Redux/actions/routerActions";
import { loadCurrentData } from "../../../../../Redux/actions/routerActions/middleware";
import Loader from "../../../../Loader";
import TitleModule from "../../../../TitleModule";
import EditorTextarea from "../../../../Textarea/EditorTextarea";

class NewsViewPage extends React.PureComponent {
    state = {
        isLoading: true,
        loading: true
    };

    render() {
        const { listdata = null } = this.props;

        return (
            <div className="newsView-page">
                <TitleModule
                    classNameTitle="tittle_contactModule_pageNews"
                    title={listdata && listdata._id ? listdata._id : "Новость"}
                />
                <div className="newsView-page__main">
                    <EditorTextarea
                        key={listdata ? listdata._id : null}
                        readOnly={true}
                        contentState={listdata ? listdata : null}
                    />
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
