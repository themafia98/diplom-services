import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { connect } from "react-redux";
import { saveComponentStateAction } from "../../../Redux/actions/routerActions";
import { updateUdata } from "../../../Redux/actions/publicActions";
import { Collapse, Switch, Input, Button, message } from "antd";
import Scrollbars from "react-custom-scrollbars";
import {
    middlewareCaching
} from "../../../Redux/actions/publicActions/middleware";
import modelContext from "../../../Models/context";
import ObserverTime from "../../ObserverTime";
import TitleModule from "../../TitleModule";

const { Panel } = Collapse;

class SettingsModule extends React.PureComponent {
    state = {
        haveChanges: [],
        showScrollbar: false,
        emailValue: null,
        telValue: null,
        newPassword: "",
        oldPassword: "",
        mail: false,
        phone: false
    };

    static propTypes = {
        onErrorRequstAction: PropTypes.func.isRequired,
        path: PropTypes.string.isRequired,
        onSaveComponentState: PropTypes.func.isRequired,
        router: PropTypes.object.isRequired
    };

    static contextType = modelContext;

    static getDerivedStateFromProps = (props, state) => {
        const { udata: { email = "", phone = "" } = {} } = props;

        if (_.isNull(state.emailValue) && _.isNull(state.telValue)) {
            return {
                ...state,
                emailValue: email,
                telValue: phone
            }
        }
        return state;
    }

    componentDidMount = () => {
        const { router, path } = this.props;

        if (router && router.routeData[path] && router.routeData[path].haveChanges) {
            this.setState({ ...this.state, ...router.routeData[path] });
        }
    };

    componentDidUpdate = () => {
        const { showScrollbar, emailValue = "", telValue = "" } = this.state;
        console.log(Date.now());
        if (this.refWrapper && this.refColumn) {
            const heightWrapper = this.refWrapper.getBoundingClientRect().height;
            const heightColumn = this.refColumn.getBoundingClientRect().height;

            const isShow = heightWrapper > heightColumn;

            if (isShow !== showScrollbar) {
                return this.setState({
                    showScrollbar: isShow
                });
            }
        } else if (!_.isNull(emailValue) || !_.isNull(telValue)) {
            this.setState({
                emailValue: null,
                telValue: null
            })
        }
    };

    componentWillUnmount = () => {
        const { haveChanges } = this.state;
        const { onSaveComponentState, path, router } = this.props;
        if (haveChanges && !_.isEqual(router.routeData[path], this.state))
            return onSaveComponentState({ ...this.state, path: path });
    };

    hideMail = event => {
        if (event !== this.state.mail) {
            this.setState({
                ...this.state,
                haveChanges: true,
                mail: event
            });
        }
    };

    hidePhone = event => {
        if (event !== this.state.phone) {
            this.setState({
                ...this.state,
                haveChanges: true,
                phone: event
            });
        }
    };

    onChangeInput = ({ target = {} }, key) => {
        const { haveChanges = [] } = this.state;
        const filterChanges = [...haveChanges];
        if (!filterChanges.includes(key)) {
            filterChanges.push(key);
        }

        if (target?.dataset?.id === "email") {
            this.setState({
                ...this.state,
                haveChanges: !filterChanges.length ? [key] : filterChanges,
                emailValue: target.value
            });
        } else if (target?.dataset?.id === "tel") {

            this.setState({
                ...this.state,
                haveChanges: !filterChanges.length ? [key] : filterChanges,
                telValue: target.value
            });
        } else if (target?.dataset?.id === "newPassword") {

            this.setState({
                ...this.state,
                haveChanges: "password",
                haveChanges: !filterChanges.length ? [key] : filterChanges,
                newPassword: target.value
            })

        } else if (target?.dataset?.id === "oldPassword") {
            this.setState({
                ...this.state,
                haveChanges: "password",
                haveChanges: !filterChanges.length ? [key] : filterChanges,
                oldPassword: target.value
            })
        }
    };

    onSaveSettings = async (event, settingsKey) => {
        if (settingsKey.includes("password")) {
            this.onChangePassword(settingsKey);
        } else if (settingsKey === "common") {
            this.onChangeCommon(settingsKey);
        }
    };

    onChangeCommon = async keyChange => {
        try {
            const { Request = {} } = this.context;
            const { udata: { _id: uid = "" } = {}, onUpdateUdata = null, onCaching = null } = this.props;
            const { emailValue: newEmail = "", telValue: newPhone = "" } = this.state;

            if (!newEmail || !/\w+\@\w+\.\D+/i.test(newEmail)) {
                message.error("Формат почты не соблюден");
                return;
            }

            if (!uid) {
                message.error("Пользователь не найден");
                return;
            }

            const queryParams = {
                newEmail,
                newPhone,
                uid
            }
            const rest = new Request();
            const res = await rest.sendRequest("/settings/common", "POST", { queryParams }, true);

            if (!res || res.status !== 200) {
                throw new Error("Bad request change password");
            }

            if (onUpdateUdata) {
                onUpdateUdata({ email: newEmail, phone: newPhone })
            }


            this.setState({
                haveChanges: this.state.haveChanges.filter(it => {
                    if (it !== keyChange) return true;
                    else return false;
                })
            });

            const msg = newPhone && !newEmail ?
                "Телефон успешно обновлен."
                : !newPhone && newEmail ?
                    "Почта успешно обновлена."
                    : "Почта и телефон успшено обновлены.";

            onCaching({
                uid,
                item: {
                    uid,
                    date: new Date(),
                    message: msg,
                    depKey: "settings",
                },
                actionType: "save_user_settings_log",
                depStore: "settings",
                type: "logger"
            });

            message.success("Настройки успешно обновлены.");

        } catch (error) {
            console.error(error);
            message.error("Ошибка смены пароля");
        }
    }

    onChangePassword = async keyChange => {
        try {
            const { Request = {} } = this.context;
            const { udata: { _id: uid = "" } = {} } = this.props;
            const { oldPassword = "", newPassword = "" } = this.state;
            if (!oldPassword || !newPassword) {
                message.warning("Формат пароля не верен");
                return;
            }

            if (!uid) {
                message.error("Пользователь не найден");
                return;
            }

            const queryParams = {
                oldPassword,
                newPassword,
                uid
            }
            const rest = new Request();
            const res = await rest.sendRequest("/settings/password", "POST", { queryParams }, true);

            if (!res || res.status !== 200) {
                throw new Error("Bad request change password");
            }

            this.setState({
                haveChanges: this.state.haveChanges.filter(it => {
                    if (it !== keyChange) return true;
                    else return false;
                })
            });

            message.success("Пароль изменен.");

        } catch (error) {
            console.error(error);
            message.error("Ошибка смены пароля");
        }
    }


    refWrapper = null;
    refColumn = null;
    refFunc = node => (this.refWrapper = node);
    refColumnFunc = node => (this.refColumn = node);

    render() {
        const { emailValue, telValue, haveChanges, oldPassword, newPassword } = this.state;
        const { settingsLogs = {} } = this.props;
        const text = ` A dog is a type of domesticated animal.`;

        const settingsBlock = (
            <React.Fragment>
                <div ref={this.refFunc}>
                    <Collapse defaultActiveKey={["common"]}>
                        <Panel onChange={this.onUpdate} header="Смена пароля" key="password">
                            <div className="configWrapper flexWrapper">
                                <span>Старый пароль:</span>
                                <Input
                                    data-id="oldPassword"
                                    type="password"
                                    allowClear
                                    value={oldPassword}
                                    onChange={(e) => this.onChangeInput(e, "password")}
                                />
                            </div>
                            <div className="configWrapper flexWrapper">
                                <span>Новый пароль:</span>
                                <Input
                                    data-id="newPassword"
                                    type="password"
                                    allowClear
                                    value={newPassword}
                                    onChange={(e) => this.onChangeInput(e, "password")}
                                />
                            </div>
                            <Button
                                onClick={(e) => this.onSaveSettings(e, "password")}
                                className="submit"
                                type="primary"
                                disabled={!haveChanges.includes("password")}
                            >
                                Принять изменения
                            </Button>
                        </Panel>
                        <Panel onChange={this.onUpdate} header="Общие настройки" key="common">
                            <div className="settingsPanel--center-flex">
                                <div className="configWrapper flexWrapper">
                                    <span>Сменить почту:</span>
                                    <Input
                                        data-id="email"
                                        allowClear
                                        value={emailValue}
                                        onChange={(e) => this.onChangeInput(e, "common")}
                                    />
                                </div>
                                <div className="configWrapper flexWrapper">
                                    <span>Сменить телефон:</span>
                                    <Input
                                        data-id="tel"
                                        type="tel"
                                        allowClear
                                        value={telValue}
                                        onChange={(e) => this.onChangeInput(e, "common")}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={(e) => this.onSaveSettings(e, "common")}
                                className="submit"
                                type="primary"
                                disabled={!haveChanges.includes("common")}
                            >
                                Принять изменения
                            </Button>
                        </Panel>

                        <Panel header="Настройки профиля" key="profile">
                            <div className="configWrapper">
                                <Switch defaultChecked={this.state.mail} onChange={this.hideMail} />
                                <span className="configTitle">Скрывать почту</span>
                            </div>
                            <div className="configWrapper">
                                <Switch defaultChecked={this.state.phone} onChange={this.hidePhone} />
                                <span className="configTitle">Скрывать телефон</span>
                            </div>
                            <Button
                                onClick={(e) => this.onSaveSettings(e, "profile")}
                                className="submit"
                                type="primary"
                                disabled={!haveChanges.includes("profile")}
                            >
                                Принять изменения
                            </Button>
                        </Panel>
                        <Panel header="Настройки уровней доступа" key="access">
                            <Collapse bordered={false}>
                                <Panel header="Администратор" key="admin">
                                    {text}
                                </Panel>
                                <Panel header="Начальник отдела" key="headDepartament">
                                    {text}
                                </Panel>
                                <Panel header="Сотрудник" key="solider">
                                    {text}
                                </Panel>
                            </Collapse>
                            <Button
                                onClick={(e) => this.onSaveSettings(e, "access")}
                                className="submit"
                                type="primary"
                                disabled={!haveChanges.includes("profile")}
                            >
                                Принять изменения
                            </Button>
                        </Panel>
                    </Collapse>
                </div>
            </React.Fragment>
        );

        return (
            <div className="settingsModule">
                <TitleModule classNameTitle="settingsModuleTitle" title="Настройки" />
                <div className="settingsModule__main">
                    <div ref={this.refColumnFunc} className="col-6">
                        <Scrollbars>{settingsBlock}</Scrollbars>
                    </div>
                    <div className="col-6">
                        <ObserverTime settingsLogs={settingsLogs} />
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => {
    const { publicReducer: { udata = {}, caches = {} } = {} } = state;

    const filterLogs = Object.keys(caches).reduce((logs, key) => {
        if (key.includes("user_settings_log")) {
            logs[key] = { ...caches[key] };
        };
        return logs;
    }, {});

    const settingsLogs = Object.keys(filterLogs).map(logKey => {
        return {
            ...filterLogs[logKey],
            date: new Date(filterLogs[logKey].date)
        };
    }).sort((a, b) => a.date - b.date);

    return {
        router: { ...state.router },
        settingsLogs,
        udata
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onSaveComponentState: data => dispatch(saveComponentStateAction(data)),
        onUpdateUdata: payload => dispatch(updateUdata(payload)),
        onCaching: props => dispatch(middlewareCaching(props))
    };
};

export { SettingsModule };
export default connect(mapStateToProps, mapDispatchToProps)(SettingsModule);
