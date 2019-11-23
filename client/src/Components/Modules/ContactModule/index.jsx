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
        if (path) {
            if (path === "contactModule_chat") return <Chat />;
            if (path === "contactModule_feedback") return <News />;
            if (path.startsWith("contactModule_informationPage")) return <NewsViewPage />;
            else return <div>Not found ContactModule</div>;
        }
    };
    render() {
        const { path } = this.props;
        const component = this.getContactContentByPath(path);
        return <div className="contactModule">{component ? component : null}</div>;
    }
}
export default ContactModule;
