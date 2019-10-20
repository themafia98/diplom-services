import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { Icon } from "antd";

import { setChildrenSizeAction } from "../../Redux/actions/tabActions";

class Tab extends React.Component {
    componentDidMount = () => {
        const { tabData, onSetChildrenSizeAction } = this.props;

        if (!_.isNull(this.tab) && !_.isNull(tabData) && _.isNull(tabData.childrenSize)) {
            onSetChildrenSizeAction(this.tab.getBoundingClientRect().width);
        }
    };

    eventHandler = event => {
        const { hendlerTab: callbackHendlerTab, itemKey } = this.props;
        event.stopPropagation();
        callbackHendlerTab(event, itemKey, "open");
    };

    eventCloseHandler = event => {
        const { hendlerTab: callbackHendlerTab, itemKey } = this.props;
        event.stopPropagation();
        if (itemKey === "mainModule") return;
        // cbCallbackResize(resize);
        callbackHendlerTab(event, itemKey, "close");
    };

    tab = null;
    tabRef = node => (this.tab = node);

    render() {
        const { flag, value, active, hendlerTab: callbackHendlerTab, itemKey, sizeTab = 10 } = this.props;
        return (
            <li
                style={{ width: `${sizeTab}px`, maxWidth: `${sizeTab}px`, minWidth: flag ? `${sizeTab}px` : null }}
                onClick={callbackHendlerTab ? this.eventHandler : null}
                className={[active ? "active" : null].join(" ")}
                key={itemKey}
                ref={this.tabRef}
            >
                <span className={[active ? "selected" : null].join(" ")}>{value}</span>
                <Icon
                    style={{ left: sizeTab < 60 ? `85%` : sizeTab < 90 ? `90%` : sizeTab < 102 ? `93%` : null }}
                    className={["closeTab"].join(" ")}
                    onClick={callbackHendlerTab ? this.eventCloseHandler : null}
                    type="close"
                />
            </li>
        );
    }
}

const mapStateToProps = state => {
    return {
        tabData: state.tabReducer,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onSetChildrenSizeAction: size => dispatch(setChildrenSizeAction(size)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Tab);