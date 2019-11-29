import React from "react";
import PropTypes from "prop-types";

import { routeParser } from "../../../Utils";
import TabContainer from "../../TabContainer";
import Chat from "./Chat";
import News from "./News";
import NewsViewPage from "./News/NewsViewPage";

class ContactModule extends React.PureComponent {
    static propTypes = {
        onErrorRequstAction: PropTypes.func.isRequired,
        path: PropTypes.string.isRequired,
        firebase: PropTypes.object.isRequired
    };

    renderNewsView = () => {
        const { router: { currentActionTab } = {}, actionTabs = [] } = this.props;

        const filterActionTab = actionTabs.filter(tab => tab.includes("_informationPage__"));
        const itemsKeys = filterActionTab
            .map(it => {
                const route = routeParser({ pageType: "moduleItem", path: it });
                if (typeof route !== "string" && route.itemId) {
                    return route.itemId;
                } else return null;
            })
            .filter(Boolean);

        return itemsKeys.map(key => {
            const route = routeParser({ pageType: "moduleItem", path: currentActionTab });

            return (
                <TabContainer visible={route.itemId === key && currentActionTab.includes(key)}>
                    <NewsViewPage key={key} id={key} />
                </TabContainer>
            );
        });
    };

    checkBackground = path => {
        const { actionTabs = [] } = this.props;
        return actionTabs.some(actionTab => actionTab.startsWith(path) || actionTab === path);
    };

    getContactContentByPath = path => {
        const isBackgroundChat = this.checkBackground("contactModule_chat");
        const isBackgrounNews = this.checkBackground("contactModule_feedback");
        const isBackgroundInfoPage = this.checkBackground("contactModule_informationPage");

        return (
            <React.Fragment>
                <TabContainer isBackground={isBackgroundChat} visible={path === "contactModule_chat"}>
                    <Chat key="chatModule" isBackground={isBackgroundChat} visible={path === "contactModule_chat"} />
                </TabContainer>
                <TabContainer isBackground={isBackgrounNews} visible={path === "contactModule_feedback"}>
                    <News key="newsModule" isBackground={isBackgrounNews} visible={path === "contactModule_feedback"} />
                </TabContainer>
                <TabContainer isBackground={isBackgroundInfoPage} visible={path === "contactModule_informationPage"}>
                    <NewsViewPage
                        key="newViewPageModule"
                        isBackground={isBackgroundInfoPage}
                        visible={path === "contactModule_informationPage"}
                    />
                </TabContainer>
                {this.renderNewsView()}
            </React.Fragment>
        );
    };
    render() {
        const { path } = this.props;
        const component = this.getContactContentByPath(path);
        return (
            <div key="contactModule" className="contactModule">
                {component ? component : null}
            </div>
        );
    }
}
export default ContactModule;
