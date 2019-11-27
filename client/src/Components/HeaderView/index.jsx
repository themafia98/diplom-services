import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash";
import { Layout } from "antd";

import { setParentSizeAction, setChildrenSizeAction } from "../../Redux/actions/tabActions";
import Tab from "./Tab";
import RightPanel from "./RightPanel";

const { Header } = Layout;

class HeaderView extends React.PureComponent {
    state = {
        defaultSizeTab: 160
    };

    static propTypes = {
        dashboardStrem: PropTypes.object.isRequired,
        cbMenuTabHandler: PropTypes.func.isRequired,
        activeTabEUID: PropTypes.string.isRequired,
        actionTabs: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]).isRequired,
        logout: PropTypes.func.isRequired
    };

    componentDidUpdate = () => {
        const { tabArray = [], tabReducer = {}, onSetChildrenSizeAction, onsetParentSizeAction } = this.props;
        let sizeTab = !tabReducer.flag ? this.state.defaultSizeTab : tabReducer.childrenSize;
        if (!_.isNull(this.wrapper) && !_.isNull(tabReducer) && _.isNull(tabReducer.parentSize)) {
            const newSize = this.wrapper.getBoundingClientRect().width;
            if (tabReducer.parentSize !== newSize) onsetParentSizeAction(newSize);
        }

        if (
            !_.isNull(tabReducer) &&
            !_.isNull(tabReducer.childrenSize) &&
            !_.isNull(tabReducer.parentSize) &&
            tabArray.length > 1
        ) {
            const length = tabReducer.childrenSize * tabArray.length;
            if (tabReducer.parentSize < length + sizeTab) {
                const size = tabReducer.parentSize / tabArray.length;
                if (size !== tabReducer.childrenSize) onSetChildrenSizeAction(size, true);
            }
        }
    };

    wrapper = null;
    refWrapper = node => (this.wrapper = node);

    renderTabs = items => {
        const { activeTabEUID = "mainModule", cbMenuTabHandler, tabArray = [], tabReducer = {} } = this.props;
        let sizeTab = !tabReducer.flag ? this.state.defaultSizeTab : tabReducer.childrenSize;
        let flag = false;
        const length = sizeTab * tabArray.length;
        if (sizeTab > tabReducer.childrenSize && tabReducer.parentSize < length + sizeTab) {
            flag = true;
        }

        return (
            <ul ref={this.refWrapper} className="tabsMenu">
                {items.map(item => {
                    return (
                        <Tab
                            hendlerTab={cbMenuTabHandler}
                            active={activeTabEUID === item.EUID}
                            key={item.EUID}
                            itemKey={item.EUID}
                            value={item.VALUE}
                            sizeTab={sizeTab}
                            flag={flag}
                        />
                    );
                })}
            </ul>
        );
    };

    update = () => {
        const { dashboardStrem } = this.props;
        dashboardStrem.emit("EventUpdate", true);
    };

    render() {
        const { actionTabs = ["mainModule"], goCabinet, status, shouldUpdate } = this.props;

        return (
            <Header>
                {actionTabs ? this.renderTabs(actionTabs) : null}
                <RightPanel
                    shouldUpdate={shouldUpdate}
                    status={status}
                    goCabinet={goCabinet}
                    onLogout={this.logout}
                    onUpdate={this.update}
                />
            </Header>
        );
    }
}

const mapStateTopProps = state => {
    const { status = "online" } = state.publicReducer;
    const { shouldUpdate = false } = state.router;
    return {
        tabReducer: state.tabReducer,
        tabArray: state.router.actionTabs,
        shouldUpdate,
        status
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onsetParentSizeAction: size => dispatch(setParentSizeAction(size)),
        onSetChildrenSizeAction: (size, flag) => dispatch(setChildrenSizeAction(size, flag))
    };
};

export default connect(mapStateTopProps, mapDispatchToProps)(HeaderView);
export { HeaderView };
