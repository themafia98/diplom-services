import React from "react";

import Chat from "./Chat";
import Feedback from "./Feedback";

class ContactModule extends React.PureComponent {
    getContactContentByPath = path => {
        if (path) {
            if (path === "contactModule_chat") return <Chat />;
            if (path === "contactModule_feedback") return <Feedback />;
            else return <div>Not found taskModule</div>;
        }
    };
    render() {
        const { path } = this.props;
        const component = this.getContactContentByPath(path);
        return <div className="contactModule">{component ? component : null}</div>;
    }
}
export default ContactModule;
