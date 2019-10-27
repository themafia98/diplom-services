import React from "react";
import { Modal } from "antd";
import { Button, Input, Select } from "antd";
import uuid from "uuid/v4";
const { Option } = Select;
class ModalWindow extends React.Component {
    state = {
        login: null,
        visible: false,
        name: null,
        password: null,
        departament: null,
        email: null,
        loading: false,
    };

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = e => {
        const { login, name, password, departament, email, loading, surname } = this.state;
        const { firebase } = this.props;

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
                .catch(error => console.error(error));
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

    render() {
        const { mode } = this.props;
        if (mode !== "reg") return null;
        else if (mode === "reg")
            return (
                <div>
                    <Button type="primary" onClick={this.showModal}>
                        Registration
                    </Button>
                    <Modal
                        className="modalWindow"
                        visible={this.state.visible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        title="Registration"
                    >
                        <Input
                            onChange={this.onChange}
                            className="email"
                            type="text"
                            size="default"
                            placeholder="email"
                        />
                        <Input
                            onChange={this.onChange}
                            className="password"
                            type="password"
                            size="default"
                            placeholder="password"
                        />
                        <Input
                            onChange={this.onChange}
                            className="login"
                            type="email"
                            size="default"
                            placeholder="login"
                        />
                        <Input
                            onChange={this.onChange}
                            className="name"
                            type="text"
                            size="default"
                            placeholder="name"
                        />
                        <Input
                            onChange={this.onChange}
                            className="surname"
                            type="text"
                            size="default"
                            placeholder="surname"
                        />
                        <Select
                            onChange={this.onChangeSelect}
                            className="selectDepartament"
                            placeholder="Select a departament"
                            optionFilterProp="depart"
                        >
                            <Option value="Admin">Admin</Option>
                            <Option value="Doctor">Doctor</Option>
                        </Select>
                    </Modal>
                </div>
            );
    }
}
export default ModalWindow;
