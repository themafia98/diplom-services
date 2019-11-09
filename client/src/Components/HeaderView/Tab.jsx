import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash";
import { Icon } from "antd";

import { setChildrenSizeAction } from "../../Redux/actions/tabActions";

class Tab extends React.PureComponent {
    static propTypes = {
        tabData: PropTypes.object.isRequired,
        hendlerTab: PropTypes.func.isRequired,
        active: PropTypes.bool.isRequired,
        itemKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number, () => null]),
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, () => null]),
        sizeTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        flag: PropTypes.bool,
    };

    componentDidMount = () => {
        const { tabData, onSetChildrenSizeAction } = this.props;

        if (!_.isNull(this.tab) && !_.isNull(tabData) && _.isNull(tabData.childrenSize)) {
            const tabSize = this.tab.getBoundingClientRect().width;
            if (tabSize !== tabData.childrenSize) onSetChildrenSizeAction(tabSize);
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
                <span className={[active ? "tabWrapper-content selected" : "tabWrapper-content"].join(" ")}>
                    <span className="tab-content">{value}</span>
                </span>
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
