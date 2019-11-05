import React from "react";
import _ from "lodash";
import moment from "moment";
import { Modal, Button, Dropdown, Icon, Menu, Input, DatePicker, message, Select } from "antd";
import uuid from "uuid/v4";
import { getSchema } from "../../Utils";
import { TASK_CONTROLL_JURNAL_SCHEMA } from "../../Utils/schema/const";
import RegistrationModal from "./RegistrationModal";
const { TextArea } = Input;
const { Option } = Select;
class ModalWindow extends React.PureComponent {
    state = {
        login: null,
        visible: false,
        name: null,
        password: null,
        departament: null,
        email: null,
        jurnal: {
            timeLost: null,
            date: moment().format("YYYY-MM-DD HH:mm:ss"),
            description: null,
        },
        error: new Set(),
        loading: false,
        taskStatus: null,
        type: null,
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
            visible: true,
            type: type,
        });
    };

    handleOk = async e => {
        const {
            login,
            name,
            password,
            departament,
            email,
            loading,
            surname,
            jurnal,
            type: typeValue,
            taskStatus = null,
        } = this.state;
        const {
            firebase = null,
            mode = null,
            onCaching,
            onUpdate,
            routeDataActive,
            routeDataActive: { key },
            primaryKey = null,
            keyTask = null,
            path = "",
            type = "",
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
                                status: "Новый сотрудник",
                            });
                    })
                    .then(res => {
                        this.setState({
                            ...this.state,
                            uuid: uuid(),
                            visible: false,
                            loading: false,
                            jurnal: { timeLost: null, date: moment().format("YYYY-MM-DD HH:mm:ss"), description: null },
                            error: new Set(),
                        });
                    })
                    .catch(error => console.error(error.message));
            }
        } else if (_.isNull(typeValue) && mode === "jur" && this.validation()) {
            const data = { ...jurnal, id: uuid(), key: keyTask, editor: "Павел Петрович" };

            if (onCaching) {
                await onCaching(data, `${data.id}${primaryKey}`, mode, path, type).then(() => this.handleCancel());
            }

            return this.setState({
                ...this.state,
                uuid: uuid(),
                visible: false,
                loading: false,
                jurnal: { timeLost: null, date: moment().format("YYYY-MM-DD HH:mm:ss"), description: null },
                error: new Set(),
            });
        } else if (!_.isNull(typeValue) && typeValue === "statusTask") {
            if (_.isNull(taskStatus)) {
                return this.setState({
                    ...this.state,
                    visible: false,
                    loading: false,
                });
            }
            onUpdate(key, "tasks", taskStatus, "status", { ...routeDataActive }, primaryKey);
            return this.setState({
                ...this.state,
                visible: false,
                loading: false,
            });
        }
    };

    handleCancel = event => {
        this.setState({
            ...this.state,
            visible: false,
            loading: false,
            jurnal: { timeLost: null, date: moment().format("YYYY-MM-DD HH:mm:ss"), description: null },
            error: new Set(),
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
                surname: target.value,
            });
        } else if (target.className.split(" ")[1] === "name") {
            this.setState({
                ...this.state,
                name: target.value,
            });
        } else if (target.className.split(" ")[1] === "password") {
            this.setState({
                ...this.state,
                password: target.value,
            });
        } else if (target.className.split(" ")[1] === "login") {
            this.setState({
                ...this.state,
                login: target.value,
            });
        } else if (target.className.split(" ")[1] === "email") {
            this.setState({
                ...this.state,
                email: target.value,
            });
        }
    };

    validation = () => {
        const {
            jurnal: { timeLost = null, date = moment(), description = null },
            error = [],
        } = this.state;
        const { keyTask } = this.props;

        let _valid = true;
        let invalidDate = !_.isDate(new Date(date));
        let invalidTimeLost = !_.isString(timeLost);
        let invalidDescription = !_.isString(description);

        if (invalidDate || invalidTimeLost || invalidDescription) {
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
                description: description,
            },
            "no-strict",
        );
        if (validData) return _valid;
        else return false;
    };

    onChangeTask = event => {
        if (!event) return;
        const { target = {}, _isValid = null } = event;

        if (target && target.value && target.className.split(" ")[1] === "timeLost") {
            this.setState({
                jurnal: { ...this.state.jurnal, timeLost: target.value },
            });
        } else if (_isValid && event && _isValid) {
            this.setState({
                jurnal: { ...this.state.jurnal, date: event.toString() },
            });
        } else if (target && target.value && target.className.split(" ")[1] === "description") {
            this.setState({
                jurnal: { ...this.state.jurnal, description: target.value },
            });
        }
    };

    render() {
        const { mode, statusTaskValue, accessStatus } = this.props;
        const { type } = this.state;

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
                jurnal: { date, description, timeLost },
            } = this.state;
            moment.locale("ru");
            const menu = (
                <Menu>
                    <Menu.Item>
                        <p className="jur" onClick={this.showModal}>
                            Занести в журнал работы
                        </p>
                    </Menu.Item>
                    <Menu.Item>
                        <p className="statusTask" onClick={this.showModal}>
                            Сменить статус задачи
                        </p>
                    </Menu.Item>
                </Menu>
            );

            switch (type) {
                case "statusTask": {
                    return (
                        <div className="dropDownWrapper">
                            <Dropdown overlay={menu}>
                                <p>
                                    Управление задачей
                                    <Icon type="down" />
                                </p>
                            </Dropdown>
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
                                        ),
                                    )}
                                </Select>
                            </Modal>
                        </div>
                    );
                }

                default:
                    return (
                        <React.Fragment>
                            <div className="dropDownWrapper">
                                <Dropdown overlay={menu}>
                                    <p>
                                        Управление задачей
                                        <Icon type="down" />
                                    </p>
                                </Dropdown>
                            </div>
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
                                    format="YYYY-MM-DD HH:mm:ss"
                                    showTime={{ defaultValue: moment().format("YYYY-MM-DD HH:mm:ss") }}
                                    defaultValue={moment()}
                                />
                                <span>Кометарии:</span>
                                <TextArea
                                    onChange={this.onChangeTask}
                                    value={description}
                                    className={["description", error.has("description") ? "errorFild" : null].join(" ")}
                                    rows={4}
                                />
                            </Modal>
                        </React.Fragment>
                    );
            }
        }
    }
}
export default ModalWindow;
