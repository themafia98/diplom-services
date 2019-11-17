import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import moment from "moment";
import { Modal, Button, Dropdown, Icon, Menu, Input, DatePicker, message, Select } from "antd";
import uuid from "uuid/v4";

import { getSchema } from "../../Utils";
import { TASK_CONTROLL_JURNAL_SCHEMA } from "../../Utils/schema/const";

import RegistrationModal from "./RegistrationModal";
import Textarea from "../Textarea";

const { Option } = Select;

class ModalWindow extends React.PureComponent {
    state = {
        login: null,
        visible: false,
        name: null,
        password: null,
        modeSetTime: null,
        departament: null,
        email: null,
        jurnal: {
            timeLost: null,
            date: moment().format("DD.MM.YYYY HH:mm:ss"),
            description: null
        },
        description: {
            value: this.props.editableContent || null
        },
        error: new Set(),
        loading: false,
        taskStatus: null,
        type: null
    };

    static propTypes = {
        firebase: PropTypes.object,
        onCaching: PropTypes.func,
        primaryKey: PropTypes.string,
        routeDataActive: PropTypes.object,
        mode: PropTypes.string,
        path: PropTypes.string,
        typeRequst: PropTypes.string,
        keyTask: PropTypes.string,
        accessStatus: PropTypes.array,
        onUpdate: PropTypes.func,
        onEdit: PropTypes.func,
        onRejectEdit: PropTypes.func,
        modeControll: PropTypes.string,
        editableContent: PropTypes.string,
        modeEditContent: PropTypes.bool,
        onCancelEditModeContent: PropTypes.func,
        onUpdateEditable: PropTypes.func,
        statusTaskValue: PropTypes.string
    };

    onMessage = event => {
        message.warning("Вы в режиме редактирования карточки.");
    };

    onChangeDescription = event => {
        const { currentTarget: { value: valueTarget = "" } = {} } = event;
        const { description = {} } = this.state;

        if (valueTarget || valueTarget === "")
            this.setState({
                ...this.state,
                description: {
                    ...description,
                    value: valueTarget
                }
            });
    };

    showModal = event => {
        const { mode } = this.props;
        const { currentTarget = {} } = event;
        let type = mode;

        if (mode !== currentTarget.className.split(" ")[0]) {
            type = currentTarget.className.split(" ")[0];
        }

        this.setState({
            ...this.state,
            modeSetTime: true,
            visible: true,
            type: type
        });
    };

    handleOk = event => {
        const {
            login,
            name,
            password,
            departament,
            visible,
            email,
            loading,
            surname,
            jurnal,
            type: typeValue,
            taskStatus = null,
            description: { value: valueDescription = "" } = {}
        } = this.state;
        const {
            firebase = null,
            mode = null,
            onCaching,
            onUpdate,
            routeDataActive = {},
            routeDataActive: { key = null } = {},
            primaryKey = null,
            keyTask = null,
            typeRequst: type = "",
            onCancelEditModeContent,
            modeEditContent = null
        } = this.props;

        if (mode === "reg") {
            if (login && name && password && departament && email && !loading) {
                firebase
                    .registration(email, password)
                    .then(res => {
                        if (res.additionalUserInfo.isNewUser)
                            firebase.db.collection("users").add({
                                uuid: uuid(),
                                login: login,
                                name: name,
                                surname: surname,
                                departament: departament,
                                email: email,
                                rules: "false",
                                position: "Не установлено",
                                status: "Новый сотрудник"
                            });
                    })
                    .then(res => {
                        this.setState({
                            ...this.state,
                            uuid: uuid(),
                            type: null,
                            visible: false,
                            loading: false,
                            jurnal: {
                                timeLost: null,
                                date: moment().format("DD.MM.YYYY HH:mm:ss"),
                                description: null
                            },
                            error: new Set()
                        });
                    })
                    .catch(error => console.error(error.message));
            }
        } else if (mode === "jur" && modeEditContent) {
            onUpdate(key, "UPDATE", valueDescription, "description", { ...routeDataActive }, "tasks")
                .then(res => {
                    onCancelEditModeContent(event);
                    this.setState({
                        ...this.state,
                        visible: false,
                        type: null,
                        modeSetTime: false,
                        loading: false
                    });
                    message.success("Описание изменено.");
                })
                .catch(error => {
                    message.error("Ошибка редактирования.");
                });
        } else if ((visible && mode === "jur" && this.validation() && !typeValue) || typeValue === "jur") {
            const data = { ...jurnal, id: uuid(), key: keyTask, editor: "Павел Петрович" };

            if (onCaching) {
                onCaching(data, `${data.id}${primaryKey}`, type, primaryKey, "jurnalWork").then(() =>
                    this.handleCancel()
                );
            }

            return this.setState({
                ...this.state,
                visible: false,
                modeSetTime: false,
                type: null,
                loading: false,
                jurnal: { timeLost: null, date: moment().format("DD.MM.YYYY HH:mm:ss"), description: null },
                error: new Set()
            });
        } else if (!_.isNull(typeValue) && typeValue === "statusTask") {
            if (_.isNull(taskStatus)) {
                return this.setState({
                    ...this.state,
                    visible: false,
                    type: null,
                    modeSetTime: false,
                    loading: false
                });
            }

            onUpdate(key, "UPDATE", taskStatus, "status", { ...routeDataActive }, "tasks");
            return this.setState({
                ...this.state,
                visible: false,
                type: null,
                modeSetTime: false,
                loading: false
            });
        }
    };

    handleCancel = event => {
        this.setState({
            ...this.state,
            visible: false,
            type: null,
            modeSetTime: false,
            loading: false,
            jurnal: { timeLost: null, date: moment().format("DD.MM.YYYY HH:mm:ss"), description: null },
            error: new Set()
        });
    };

    onChangeSelect = event => {
        const { type } = this.state;
        if (type === "statusTask") {
            this.setState({ ...this.state, taskStatus: event });
        } else this.setState({ ...this.state, departament: event });
    };

    onChange = event => {
        const { target } = event;
        if (target.className.split(" ")[1] === "surname") {
            this.setState({
                ...this.state,
                surname: target.value
            });
        } else if (target.className.split(" ")[1] === "name") {
            this.setState({
                ...this.state,
                name: target.value
            });
        } else if (target.className.split(" ")[1] === "password") {
            this.setState({
                ...this.state,
                password: target.value
            });
        } else if (target.className.split(" ")[1] === "login") {
            this.setState({
                ...this.state,
                login: target.value
            });
        } else if (target.className.split(" ")[1] === "email") {
            this.setState({
                ...this.state,
                email: target.value
            });
        }
    };

    validation = () => {
        const {
            jurnal: { timeLost = null, date = moment(), description = null },
            error = [],
            type: typeState
        } = this.state;
        const { keyTask } = this.props;

        let _valid = true;
        let invalidDate = !_.isDate(new Date(date));
        let invalidTimeLost = !_.isString(timeLost);
        let invalidDescription = !_.isString(description);

        if ((invalidDate || invalidTimeLost || invalidDescription) && !typeState) {
            _valid = false;
            const errorBundle = error.size ? new Set([...error]) : new Set();
            message.error("Не все поля заполнены!");

            if (invalidDate) errorBundle.add("date");
            else if (errorBundle.has("date")) errorBundle.delete("date");
            if (invalidTimeLost) errorBundle.add("timeLost");
            else if (errorBundle.has("timeLost")) errorBundle.delete("timeLost");
            if (invalidDescription) errorBundle.add("description");
            else if (errorBundle.has("description")) errorBundle.delete("description");
            this.setState({ ...this.state, error: errorBundle });
        }
        if (!_valid) return _valid;

        const validData = getSchema(
            TASK_CONTROLL_JURNAL_SCHEMA,
            {
                key: keyTask,
                timeLost: timeLost,
                id: null,
                editor: "Павел Петрович",
                date: date,
                description: description
            },
            "no-strict"
        );
        if (validData) return _valid;
        else return false;
    };

    onChangeTask = event => {
        if (!event) return;

        const { target = {}, _isValid = null } = event;

        if (target && target.value && target.className.split(" ")[1] === "timeLost") {
            this.setState({
                jurnal: { ...this.state.jurnal, timeLost: target.value }
            });
        } else if (_isValid && event && _isValid) {
            this.setState({
                jurnal: { ...this.state.jurnal, date: event.toString() }
            });
        } else if (
            target &&
            (target.value || target.value === "") &&
            target.className.split(" ")[1] === "description"
        ) {
            this.setState({
                jurnal: { ...this.state.jurnal, description: target.value }
            });
        }
    };

    render() {
        const {
            mode = "",
            statusTaskValue = "",
            accessStatus = [],
            onEdit = null,
            modeControll = null,
            description: descriptionDefault = "",
            onRejectEdit = null,
            modeEditContent = null,
            onCancelEditModeContent = null,
            onUpdateEditable
        } = this.props;

        const { type: typeState = "", modeSetTime = null, description: { value: valueDesc = "" } = {} } = this.state;
        if (mode === "reg") {
            return (
                <React.Fragment>
                    {mode === "reg" ? (
                        <Button type="primary" onClick={this.showModal}>
                            Регистрация
                        </Button>
                    ) : null}
                    <Modal
                        className="modalWindow"
                        visible={this.state.visible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        title={mode === "reg" ? "Регистрация" : null}
                    >
                        {mode === "reg" ? (
                            <RegistrationModal cbOnChange={this.onChange} cbOnChangeSelect={this.onChangeSelect} />
                        ) : (
                            <div></div>
                        )}
                    </Modal>
                </React.Fragment>
            );
        } else if (mode === "jur") {
            const {
                error,
                jurnal: { description, timeLost }
            } = this.state;
            moment.locale("ru");
            const menu = (
                <React.Fragment>
                    <Menu>
                        <Menu.Item>
                            <p className="jur" onClick={modeControll === "edit" ? this.onMessage : this.showModal}>
                                Занести в журнал работы
                            </p>
                        </Menu.Item>
                        <Menu.Item>
                            <p
                                className="statusTask"
                                onClick={modeControll === "edit" ? this.onMessage : this.showModal}
                            >
                                Сменить статус задачи
                            </p>
                        </Menu.Item>
                        <Menu.Item>
                            <p className="statusTask" onClick={modeControll === "edit" ? this.onMessage : onEdit}>
                                Редактировать задачу
                            </p>
                        </Menu.Item>
                    </Menu>
                </React.Fragment>
            );
            switch (typeState) {
                case "statusTask": {
                    return (
                        <div className="dropDownWrapper">
                            <Dropdown overlay={menu}>
                                <p>
                                    Управление задачей
                                    <Icon type="down" />
                                </p>
                            </Dropdown>
                            {modeControll === "edit" ? (
                                <React.Fragment>
                                    <p onClick={onUpdateEditable} className="modeControllEdit">
                                        Сохранить изменения
                                    </p>
                                    <p onClick={onRejectEdit} className="modeControllEditReject">
                                        Отмена изменений
                                    </p>
                                </React.Fragment>
                            ) : null}
                            <Modal
                                className="modalWindow changeStatus"
                                visible={this.state.visible}
                                onOk={this.handleOk}
                                onCancel={this.handleCancel}
                                title="Смена статуса"
                            >
                                <Select onChange={this.onChangeSelect} defaultValue={statusTaskValue}>
                                    {accessStatus.map((status, i) =>
                                        i === 0 ? (
                                            <Option key={i + status} value={statusTaskValue}>
                                                {statusTaskValue}
                                            </Option>
                                        ) : (
                                            <Option key={i + status} value={status}>
                                                {status}
                                            </Option>
                                        )
                                    )}
                                </Select>
                            </Modal>
                        </div>
                    );
                }

                default: {
                    return (
                        <React.Fragment>
                            <div className="dropDownWrapper">
                                <Dropdown overlay={menu}>
                                    <p>
                                        Управление задачей
                                        <Icon type="down" />
                                    </p>
                                </Dropdown>
                                {modeControll === "edit" ? (
                                    <React.Fragment>
                                        <p onClick={onUpdateEditable} className="modeControllEdit">
                                            Сохранить изменения
                                        </p>
                                        <p onClick={onRejectEdit} className="modeControllEditReject">
                                            Отмена изменений
                                        </p>
                                    </React.Fragment>
                                ) : null}
                            </div>
                            {mode === "jur" && modeEditContent ? (
                                <Modal
                                    className="modalWindow"
                                    visible={modeEditContent}
                                    onOk={this.handleOk}
                                    onCancel={onCancelEditModeContent}
                                    title={"Редактирование"}
                                >
                                    <Textarea
                                        key="textAreaEdit"
                                        className="editContentDescription"
                                        editor={true}
                                        row={10}
                                        onChange={this.onChangeDescription}
                                        value={valueDesc ? valueDesc : ""}
                                        defaultValue={valueDesc ? valueDesc : ""}
                                    />
                                </Modal>
                            ) : modeSetTime ? (
                                <Modal
                                    className="modalWindow"
                                    visible={this.state.visible}
                                    onOk={this.handleOk}
                                    onCancel={this.handleCancel}
                                    title=" Отчет времени"
                                >
                                    <span>Затраченое время:</span>
                                    <Input
                                        onChange={this.onChangeTask}
                                        className={["timeLost", error.has("timeLost") ? "errorFild" : null].join(" ")}
                                        value={timeLost}
                                        type="text"
                                        size="default"
                                        placeholder="20m / 1h / 2.5h "
                                    />
                                    <span>Дата и время:</span>
                                    <DatePicker
                                        onChange={this.onChangeTask}
                                        className={["date", error.has("date") ? "errorFild" : null].join(" ")}
                                        format="DD.MM.YYYY HH:mm:ss"
                                        showTime={{ defaultValue: moment() }}
                                        defaultValue={moment()}
                                    />
                                    <span>Кометарии:</span>
                                    <Textarea
                                        key="commentsTextArea"
                                        onChange={this.onChangeTask}
                                        defaultValue={descriptionDefault}
                                        value={description}
                                        className={["description", error.has("description") ? "errorFild" : null].join(
                                            " "
                                        )}
                                        rows={4}
                                    />
                                </Modal>
                            ) : (
                                <Modal></Modal>
                            )}
                        </React.Fragment>
                    );
                }
            }
        } else return null;
    }
}

export default ModalWindow;
