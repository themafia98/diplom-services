import React from "react";
import Updater from "../../Updater";
import UserPopup from "../../UserPopup";
import { Icon } from "antd";
const RightPanel = ({ onUpdate, onLogout, goCabinet }) => {
    return (
        <div className="headerControllers rightPanel">
            <UserPopup goCabinet={goCabinet} />
            <div className="groupControllers">
                <Icon className="alertBell" type="bell" theme="twoTone" />
                <Updater onClick={onUpdate} additionalClassName="updaterDefault" />
                <div onClick={onLogout} className="logout">
                    Выйти
                </div>
            </div>
        </div>
    );
};
export default RightPanel;
