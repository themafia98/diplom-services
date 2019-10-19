import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import Tab from "./Tab";
import { Layout } from "antd";

import { setparentSizeAction, setChildrenSizeAction } from "../../Redux/actions/tabActions";
import uuid from "uuid/v4";

const { Header } = Layout;

class HeaderView extends React.Component {
    state = {
        sizeCount: 10,
        parentSize: null,
    };

    componentDidMount = () => {
        const { tabData, onSetparentSizeAction } = this.props;
        if (!_.isNull(this.wrapper) && !_.isNull(tabData) && _.isNull(tabData.parentSize)) {
            onSetparentSizeAction(this.wrapper.getBoundingClientRect().width);
        }
    };

    componentDidUpdate = () => {
        const { tabArray, tabData, onSetChildrenSizeAction } = this.props;
        if (
            !_.isNull(tabData) &&
            !_.isNull(tabData.childrenSize) &&
            !_.isNull(tabData.parentSize) &&
            tabArray.length > 1
        ) {
            const length = tabData.childrenSize + 15 * tabArray.length;
            if (tabData.parentSize <= length || tabData.parentSize / tabArray.length < tabData.childrenSize + 15) {
                const size = tabData.parentSize / tabArray.length / 1.6;
                onSetChildrenSizeAction(size);
            }
        }
    };

    wrapper = null;
    refWrapper = node => (this.wrapper = node);

    renderTabs = items => {
        const { activeTabEUID, cbMenuTabHandler, tabArray, tabData } = this.props;
        let sizeTab = 160;
        let flag = false;
        const length = sizeTab * tabArray.length;
        if (sizeTab > tabData.childrenSize + 15 && tabData.parentSize <= length) {
            flag = true;
            sizeTab = tabData.childrenSize;
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
        onSetparentSizeAction: size => dispatch(setparentSizeAction(size)),
        onSetChildrenSizeAction: size => dispatch(setChildrenSizeAction(size)),
    };
};

export default connect(
    mapStateTopProps,
    mapDispatchToProps,
)(HeaderView);
