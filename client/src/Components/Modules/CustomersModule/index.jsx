import React from "react";

import Contacts from "./Contacts";
import Reception from "./Reception";

class CustomersModule extends React.PureComponent {
    getComponentByPath = path => {
        if (path) {
            if (path === "customersModule_contacts") return <Contacts />;
            if (path === "customersModule_reception") return <Reception />;
            return <div>Not found taskModule</div>;
        }
    };
    render() {
        const { path } = this.props;
        const component = this.getComponentByPath(path);
        return <div className="contactModule">{component ? component : null}</div>;
    }
}
export default CustomersModule;
