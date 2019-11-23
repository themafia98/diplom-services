import React from "react";
import PropTypes from "prop-types";
import Chat from "./Chat";
import News from "./News";
import NewsViewPage from "./News/NewsViewPage";

class ContactModule extends React.PureComponent {
    static propTypes = {
        onErrorRequstAction: PropTypes.func.isRequired,
        path: PropTypes.string.isRequired,
        firebase: PropTypes.object.isRequired
    };

    getContactContentByPath = path => {
        return (
            <React.Fragment>
                {path === "contactModule_chat" ? (
                    <Chat key="chatModule" />
                ) : path === "contactModule_feedback" ? (
                    <News key="newsModule" />
                ) : path.startsWith("contactModule_informationPage") ? (
                    <NewsViewPage key="newViewPageModule" />
                ) : (
                    <div>Not found ContactModule</div>
                )}
            </React.Fragment>
        );
    };
    render() {
        const { path } = this.props;
        const component = this.getContactContentByPath(path);
        return <div className="contactModule">{component ? component : null}</div>;
    }
}
export default ContactModule;
