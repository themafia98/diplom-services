import React from "react";
import _ from "lodash";
import moment from "moment";
import { Modal, Button, Dropdown, Icon, Menu, Input, DatePicker, message } from "antd";
import uuid from "uuid/v4";
import { getSchema } from "../../Utils";
import { TASK_CONTROLL_JURNAL_SCHEMA } from "../../Utils/schema/const";
import RegistrationModal from "./RegistrationModal";
const { TextArea } = Input;
class ModalWindow extends React.Component {
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
    };

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = async e => {
        const { login, name, password, departament, email, loading, surname, jurnal } = this.state;
        const { firebase = null, mode = null, routeDataActive = null, onCaching, primaryKey = null } = this.props;
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
                            uuid: uuid(),
                            visible: false,
                            loading: false,
                        });
                    })
                    .catch(error => console.error(error.message));
            }
        } else if (mode === "jur" && this.validation()) {
            const jurCopy = { ...jurnal, key: routeDataActive.key, editor: "Павел Петрович" };
            if (onCaching) await onCaching(jurCopy, `${Math.random()}${primaryKey}`).then(() => this.handleCancel());
        }
    };

    handleCancel = event => {
        this.setState({
            visible: false,
            loading: false,
        });
    };

    onChangeSelect = event => {
        this.setState({ departament: event });
    };

    onChange = event => {
        const { target } = event;
        if (target.className.split(" ")[1] === "surname") {
            this.setState({
                surname: target.value,
            });
        } else if (target.className.split(" ")[1] === "name") {
            this.setState({
                name: target.value,
            });
        } else if (target.className.split(" ")[1] === "password") {
            this.setState({
                password: target.value,
            });
        } else if (target.className.split(" ")[1] === "login") {
            this.setState({
                login: target.value,
            });
        } else if (target.className.split(" ")[1] === "email") {
            this.setState({
                email: target.value,
            });
        }
    };

    validation = () => {
        const {
            jurnal: { timeLost = null, date = moment(), description = null },
            error = [],
        } = this.state;

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
            this.setState({ error: errorBundle });
        }
        if (!_valid) return _valid;

        const validData = getSchema(TASK_CONTROLL_JURNAL_SCHEMA, {
            timeLost: timeLost,
            date: date,
            description: description,
        });
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
        const { mode } = this.props;
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
            const { error } = this.state;
            moment.locale("ru");
            const menu = (
                <Menu>
                    <Menu.Item>
                        <p onClick={this.showModal}>Занести в журнал работы</p>
                    </Menu.Item>
                </Menu>
            );
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
                        title=" Отчет времени."
                    >
                        <span>Затраченое время:</span>
                        <Input
                            onChange={this.onChangeTask}
                            className={["timeLost", error.has("timeLost") ? "errorFild" : null].join(" ")}
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
                            className={["description", error.has("description") ? "errorFild" : null].join(" ")}
                            rows={4}
                        />
                    </Modal>
                </React.Fragment>
            );
        }
    }
}
export default ModalWindow;
