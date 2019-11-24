import React from "react";
import { Avatar } from "antd";

class UserPopup extends React.PureComponent {
    render() {
        const { goCabinet } = this.props;
        return (
            <div className="userPopup">
                <div onClick={goCabinet} className="userPopupMain">
                    <Avatar shape="square" type="small" icon="user" />
                    <a className="ant-dropdown-link" href="#">
                        Павел П.
                    </a>
                </div>
            </div>
        );
    }
}

export default UserPopup;
