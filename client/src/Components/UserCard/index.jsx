import React from "react";
import PropTypes from "prop-types";
import { Avatar, Button, Icon, Dropdown, Menu } from "antd";

import imageCard from "./wallpaper_user.jpg";

class UserCard extends React.Component {
    static propTypes = {
        cbShowModal: PropTypes.func
    };

    render() {
        const { udata = {} } = this.props;
        const isMine = true;
        const { cdShowModal } = this.props;
        const menu = (
            <Menu>
                <Menu.Item onClick={cdShowModal ? cdShowModal : null} key="photoChange">
                    Сменить аватар
                </Menu.Item>
            </Menu>
        );

        const imageUrl = {
            backgroundImage: `url("${imageCard}")`
        };

        return (
            <div className="userCard">
                <div style={imageUrl} className="wallpaper"></div>
                <div className="mainContentCard">
                    <div className="col-6">
                        {isMine ? (
                            <Dropdown overlay={menu} trigger={["contextMenu"]}>
                                <Avatar className="userLogo" size={84} icon="user" />
                            </Dropdown>
                        ) : (
                            <Avatar className="userLogo" size={84} icon="user" />
                        )}
                        <div className="mainInformUser">
                            <div className="mainInformUser__main">
                                <p className="name">{udata.displayName ? udata.displayName : "Unknown"}</p>
                                <p className="position">{udata.departament ? udata.departament : ""}</p>
                            </div>
                            <div className="mainInformUser__controllers">
                                {udata.email ? (
                                    <Button
                                        title={udata.email}
                                        className="controller"
                                        type="primary"
                                        icon="mail"
                                    ></Button>
                                ) : null}
                                {udata.isOnline ? (
                                    <Button className="controller" type="primary" icon="wechat"></Button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="col-6 summary_wrapper">
                        <p className="summary">{udata.summary ? udata.summary : ""}</p>
                        <div className="contact">
                            {udata.email ? (
                                <div className="email">
                                    <Icon type="mail" /> <span>{udata.email}</span>
                                </div>
                            ) : null}
                            {udata.phone ? (
                                <div className="phone">
                                    <Icon type="phone" /> <span>{udata.phone}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default UserCard;
