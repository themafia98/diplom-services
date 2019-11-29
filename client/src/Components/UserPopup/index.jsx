import React from "react";
import { Avatar } from "antd";

class UserPopup extends React.PureComponent {
    render() {
        const { goCabinet } = this.props;
        return (
            <div className="userPopup">
                <div onClick={goCabinet} className="userPopupMain">
                    <Avatar shape="square" type="small" icon="user" />
                    <p className="userName_link">Павел П.</p>
                </div>
            </div>
        );
    }
}

export default UserPopup;
