import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import Tab from "./Tab";
import { Layout } from "antd";

import { setParentSizeAction, setChildrenSizeAction } from "../../Redux/actions/tabActions";
import uuid from "uuid/v4";

const { Header } = Layout;

class HeaderView extends React.Component {
    state = {
        defaultSizeTab: 160,
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
                const size = tabData.parentSize / (tabArray.length + 1) - 24;
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
                            key={item.EUID + uuid()}
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

    render() {
        const { logout, actionTabs } = this.props;
        return (
            <Header>
                {actionTabs ? this.renderTabs(actionTabs) : null}
                <div onClick={logout} className="logout">
                    Выйти
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
