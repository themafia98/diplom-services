import React from "react";
import PropTypes from "prop-types";

import { Icon } from "antd";

class Tab extends React.PureComponent {
    static propTypes = {
        hendlerTab: PropTypes.func.isRequired,
        active: PropTypes.bool.isRequired,
        itemKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number, () => null]),
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, () => null]),
        sizeTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
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
        const recalcSize =
            sizeTab > 55 ? sizeTab - sizeTab * 0.15 : sizeTab > 43 ? sizeTab - sizeTab * 0.2 : sizeTab - sizeTab * 0.3;
        return (
            <li
                style={{
                    width: `${recalcSize}px`,
                    maxWidth: `${recalcSize}px`,
                    minWidth: `${recalcSize}px`
                }}
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

export default Tab;
