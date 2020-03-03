import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash";
import { Layout } from "antd";
import Tab from "./Tab";
import RightPanel from "./RightPanel";

const { Header } = Layout;

class HeaderView extends React.PureComponent {
    state = {
        length: 1,
        size: 160,
        sizeParent: null
    };

    static propTypes = {
        dashboardStrem: PropTypes.object.isRequired,
        cbMenuTabHandler: PropTypes.func.isRequired,
        activeTabEUID: PropTypes.string.isRequired,
        actionTabs: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]).isRequired,
        logout: PropTypes.func.isRequired
    };

    componentDidUpdate = () => {
        const { sizeParent, size, length } = this.state;
        const { tabArray = [] } = this.props;

        const sizes = sizeParent / tabArray.length;
        const counter = ~~(sizeParent / size);

        if (_.isNull(sizeParent) && this.wrapper) {
            this.setState({
                length: tabArray.length,
                sizeParent: this.wrapper.getBoundingClientRect().width
            });
        }

        if ((tabArray.length >= counter && !_.isNull(sizeParent)) || (tabArray.length < length && size < 160)) {
            this.setState({
                length: tabArray.length,
                size: sizes
            });
        }
    };

    wrapper = null;
    refWrapper = node => (this.wrapper = node);

    renderTabs = items => {
        const { size = 160 } = this.state;
        const { activeTabEUID = "mainModule", cbMenuTabHandler } = this.props;

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
                            sizeTab={size}
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
        const { actionTabs = ["mainModule"], goCabinet, status, shouldUpdate, logout, udata } = this.props;

        return (
            <Header>
                {actionTabs ? this.renderTabs(actionTabs) : null}
                <RightPanel
                    udata={udata}
                    shouldUpdate={shouldUpdate}
                    status={status}
                    goCabinet={goCabinet}
                    onLogout={logout}
                    onUpdate={this.update}
                />
            </Header>
        );
    }
}

const mapStateTopProps = state => {
    const { status = "online", udata = {} } = state.publicReducer;
    const { shouldUpdate = false } = state.router;
    return {
        tabArray: state.router.actionTabs,
        shouldUpdate,
        status,
        udata
    };
};

export default connect(mapStateTopProps)(HeaderView);
export { HeaderView };
