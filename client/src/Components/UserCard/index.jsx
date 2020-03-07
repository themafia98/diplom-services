import React from "react";
import PropTypes from "prop-types";
import { Avatar, Button, Icon, Dropdown, Menu, Tooltip, message } from "antd";
import ModalWindow from "../ModalWindow";

import modelContext from "../../Models/context";
import imageCard from "./wallpaper_user.jpg";

class UserCard extends React.Component {
    static propTypes = {
        cbShowModal: PropTypes.func
    };

    static contextType = modelContext;

    state = {
        visibilityModal: false,
    }

    showEditSummary = () => {
        const { visibilityModal = false } = this.state;
        this.setState({ visibilityModal: !visibilityModal });
    };

    onSubmitSummary = async (event, value) => {
        const { udata: { _id: uid = "" } = {} } = this.props;
        const { Request } = this.context;

        try {

            const rest = new Request();
            const res = await rest.sendRequest("/cabinet/update/single", "POST", {
                queryParams: { uid },
                value
            }, true);

            if (res.status !== 200) {
                throw new Error("Bad summury update");
            }

            this.setState({ visibilityModal: false });

        } catch (error) {
            console.error(error.message);
            message.error("Ошибка обновления описания.");
        }
    }

    onRejectEditSummary = event => {
        this.setState({
            visibilityModal: false
        });
    }

    render() {
        const { visibilityModal = false } = this.state;
        const { udata = {}, cdShowModal } = this.props;

        const isMine = true;

        const menu = (
            <Menu>
                <Menu.Item
                    onClick={cdShowModal ? cdShowModal : null}
                    key="photoChange"
                >
                    Сменить аватар
                </Menu.Item>
            </Menu>
        );

        const imageUrl = {
            backgroundImage: `url("${imageCard}")`
        };

        return (
            <React.Fragment>
                <div className="userCard">
                    <div style={imageUrl} className="wallpaper"></div>
                    <div className="mainContentCard">
                        <div className="col-6">
                            {isMine ? (
                                <Tooltip trigger="hover" title="ПКМ - смена фотографии" >
                                    <Dropdown overlay={menu} trigger={["contextMenu"]}>
                                        <Avatar className="userLogo" size={84} icon="user" />
                                    </Dropdown>
                                </Tooltip>
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
                            <div className="canEditSummary">
                                <Tooltip title="Редактировать описание">
                                    <Icon onClick={this.showEditSummary} type="edit" />
                                </Tooltip>
                            </div>
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
                <ModalWindow
                    title="Редактирование описания"
                    defaultView={true}
                    visibility={visibilityModal}
                    onReject={this.onRejectEditSummary}
                    onOkey={this.onSubmitSummary}
                />
            </React.Fragment>
        );
    }
}

export default UserCard;
