import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash";
import { Layout } from "antd";

import { setParentSizeAction, setChildrenSizeAction } from "../../Redux/actions/tabActions";
import Tab from "./Tab";
import Updater from "../Updater";

const { Header } = Layout;

class HeaderView extends React.PureComponent {
    state = {
        defaultSizeTab: 160,
    };

    static propTypes = {
        dashboardStrem: PropTypes.object.isRequired,
        cbMenuTabHandler: PropTypes.func.isRequired,
        activeTabEUID: PropTypes.string.isRequired,
        actionTabs: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]).isRequired,
        logout: PropTypes.func.isRequired,
    };

    componentDidUpdate = () => {
        const { tabArray, tabData, onSetChildrenSizeAction, onsetParentSizeAction } = this.props;
        let sizeTab = !tabData.flag ? this.state.defaultSizeTab : tabData.childrenSize;
        if (!_.isNull(this.wrapper) && !_.isNull(tabData) && _.isNull(tabData.parentSize)) {
            const newSize = this.wrapper.getBoundingClientRect().width;
            if (tabData.parentSize !== newSize) onsetParentSizeAction(newSize);
        }

        if (
            !_.isNull(tabData) &&
            !_.isNull(tabData.childrenSize) &&
            !_.isNull(tabData.parentSize) &&
            tabArray.length > 1
        ) {
            const length = tabData.childrenSize * tabArray.length;
            if (tabData.parentSize < length + sizeTab) {
                const size = tabData.parentSize / tabArray.length;
                if (size !== tabData.childrenSize) onSetChildrenSizeAction(size, true);
            }
        }
    };

    wrapper = null;
    refWrapper = node => (this.wrapper = node);

    renderTabs = items => {
        const { activeTabEUID, cbMenuTabHandler, tabArray, tabData } = this.props;
        let sizeTab = !tabData.flag ? this.state.defaultSizeTab : tabData.childrenSize;
        let flag = false;
        const length = sizeTab * tabArray.length;
        if (sizeTab > tabData.childrenSize && tabData.parentSize < length + sizeTab) {
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
        dashboardStrem.emit("EventUpdate");
    };

    render() {
        const { logout = null, actionTabs = false } = this.props;

        return (
            <Header>
                {actionTabs ? this.renderTabs(actionTabs) : null}
                <div className="headerControllers">
                    <Updater onClick={this.update} additionalClassName="updaterDefault" />
                    <div onClick={logout} className="logout">
                        Выйти
                    </div>
                </div>
            </Header>
        );
    }
}

const mapStateTopProps = state => {
    return {
        tabData: state.tabReducer,
        tabArray: state.router.actionTabs,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onsetParentSizeAction: size => dispatch(setParentSizeAction(size)),
        onSetChildrenSizeAction: (size, flag) => dispatch(setChildrenSizeAction(size, flag)),
    };
};

export default connect(
    mapStateTopProps,
    mapDispatchToProps,
)(HeaderView);
