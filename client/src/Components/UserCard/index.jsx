import React from "react";
import PropTypes from "prop-types";
import { Avatar, Button, Icon, Dropdown, Menu } from "antd";

class UserCard extends React.Component {
    static propTypes = {
        cbShowModal: PropTypes.func.isRequired,
    };

    render() {
        const data = { mail: true, online: true, email: "admin@admin.com", phone: "+37529554433" };
        const isMine = true;
        const { cdShowModal } = this.props;
        const menu = (
            <Menu>
                <Menu.Item onClick={cdShowModal ? cdShowModal : null} key="photoChange">
                    Сменить аватар
                </Menu.Item>
            </Menu>
        );
        return (
            <div className="userCard">
                <div className="wallpaper"></div>
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
                            <p className="name">Павел Петрович</p>
                            <p className="position">Разработчик</p>
                            {data.mail ? <Button className="controller" type="primary" icon="mail"></Button> : null}
                            {data.online ? <Button className="controller" type="primary" icon="wechat"></Button> : null}
                        </div>
                    </div>
                    <div className="col-6">
                        <p className="summary">
                            My name Pavel Petrovich and I'm Frontend developer. I looking for job. I looking for job. I
                            looking for job. I looking for job. I looking for job. I looking for job. I looking for job.
                        </p>
                        <div className="contact">
                            {data.mail ? (
                                <div className="email">
                                    <Icon type="mail" /> <span>{data.email}</span>
                                </div>
                            ) : null}
                            {data.phone ? (
                                <div className="phone">
                                    <Icon type="phone" /> <span>{data.phone}</span>
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
