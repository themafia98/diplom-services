import React from "react";
import _ from "lodash";
import Tab from "./Tab";
import { Layout } from "antd";

import uuid from "uuid/v4";

const { Header } = Layout;

class HeaderView extends React.Component {
    state = {
        sizeCount: 10,
        parentSize: null,
    };
    wrapper = null;
    refWrapper = node => (this.wrapper = node);

    cdResize = count => {
        if (count === 10 && this.state.sizeCount !== 10) return this.setState({ sizeCount: 10 });
        return this.setState(state => ({
            sizeCount: state.sizeCount - 1 < 5 ? 5 : state.sizeCount - 1,
        }));
    };

    resizeCalck = resize => {
        const addToTabs = resize - this.state.sizeCount;
        this.setState(state => ({
            sizeCount: state.sizeCount + addToTabs,
        }));
    };

    componentDidMount = () => {
        if (!_.isNull(this.wrapper) && _.isNull(this.state.parentSize)) {
            this.setState({
                parentSize: this.wrapper.getBoundingClientRect().right / 1.8,
            });
        }
    };

    renderTabs = items => {
        const { activeTabEUID, cbMenuTabHandler } = this.props;
        return (
            <ul ref={this.refWrapper} className="tabsMenu">
                {items.map(item => {
                    return (
                        <Tab
                            key={uuid()}
                            cbCallbackResize={this.resizeCalck}
                            sizeCount={this.state.sizeCount}
                            hendlerTab={cbMenuTabHandler}
                            active={activeTabEUID === item.EUID}
                            key={item.EUID}
                            itemKey={item.EUID}
                            value={item.VALUE}
                            cdResize={this.cdResize}
                            wrapperRight={this.state.parentSize ? this.state.parentSize : null}
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

export default HeaderView;
