import React from "react";
import { Collapse, Switch, Input, Button } from "antd";
import ObserverTime from "../../ObserverTime";
import TitleModule from "../../TitleModule";
const { Panel } = Collapse;
class SettingsModule extends React.PureComponent {
    state = {
        haveChanges: false,
        emailValue: "",
        telValue: "",
        mail: false,
        phone: false,
    };

    hideMail = event => {
        if (event !== this.state.mail) {
            this.setState({
                ...this.state,
                haveChanges: true,
                mail: event,
            });
        }
    };

    hidePhone = event => {
        if (event !== this.state.phone) {
            this.setState({
                ...this.state,
                haveChanges: true,
                phone: event,
            });
        }
    };

    onChangeInput = event => {
        const { target } = event;

        if (target.dataset.id === "email") {
            this.setState({
                ...this.state,
                haveChanges: true,
                emailValue: target.value,
            });
        } else if (target.dataset.id === "tel") {
            this.setState({
                ...this.state,
                haveChanges: true,
                telValue: target.value,
            });
        }
    };

    render() {
        const { emailValue, telValue, haveChanges } = this.state;
        const text = ` A dog is a type of domesticated animal.`;
        return (
            <div className="settingsModule">
                <TitleModule classNameTitle="settingsModuleTitle" title="Настройки" />
                <div className="settingsModule__main">
                    <div className="col-6">
                        <Collapse defaultActiveKey={["common"]}>
                            <Panel header="Общие настройки" key="common">
                                <div className="settingsPanel--center-flex">
                                    <div className="configWrapper flexWrapper">
                                        <span>Сменить почту:</span>
                                        <Input
                                            data-id="email"
                                            allowClear
                                            value={emailValue}
                                            onChange={this.onChangeInput}
                                        />
                                    </div>
                                    <div className="configWrapper flexWrapper">
                                        <span>Сменить телефон:</span>
                                        <Input
                                            data-id="tel"
                                            type="tel"
                                            allowClear
                                            value={telValue}
                                            onChange={this.onChangeInput}
                                        />
                                    </div>
                                </div>
                            </Panel>
                            <Panel header="Настройки профиля" key="profile">
                                <div className="configWrapper">
                                    <Switch defaultChecked={false} onChange={this.hideMail} />
                                    <span className="configTitle">Скрывать почту</span>
                                </div>
                                <div className="configWrapper">
                                    <Switch defaultChecked={false} onChange={this.hidePhone} />
                                    <span className="configTitle">Скрывать телефон</span>
                                </div>
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
                            </Panel>
                        </Collapse>
                        <Button className="submit" type="primary" disabled={!haveChanges}>
                            Принять изменения
                        </Button>
                    </div>
                    <div className="col-6">
                        <ObserverTime />
                    </div>
                </div>
            </div>
        );
    }
}
export default SettingsModule;
