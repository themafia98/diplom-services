import React from "react";

class TabContainer extends React.PureComponent {
    render() {
        const { isBackground, visible, children, className = "" } = this.props;

        if (isBackground || visible) {
            return (
                <div
                    key={children.key + "tab"}
                    className={["tabContainer", visible ? "visible" : "hidden", className ? className : null].join(" ")}
                >
                    {children}
                </div>
            );
        } else return null;
    }
}

export default TabContainer;
