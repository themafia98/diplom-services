import React from "react";
import PropTypes from "prop-types";
import Contacts from "./Contacts";
import Reception from "./Reception";

class CustomersModule extends React.PureComponent {
    static propTypes = {
        onErrorRequstAction: PropTypes.func.isRequired,
        path: PropTypes.string.isRequired,
        firebase: PropTypes.object.isRequired,
    };

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
