import React from 'react';
import _ from "lodash";
import { connect } from "react-redux";
import { saveComponentStateAction } from "../../../Redux/actions/routerActions";
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

    componentDidMount = () => {
        const { router, path } = this.props;
        if (router && router.routeData[path] && router.routeData[path].haveChanges) {
            this.setState({ ...this.state, ...router.routeData[path] });
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
                                    <Switch defaultChecked={this.state.mail} onChange={this.hideMail} />
                                    <span className="configTitle">Скрывать почту</span>
                                </div>
                                <div className="configWrapper">
                                    <Switch defaultChecked={this.state.phone} onChange={this.hidePhone} />
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
const mapStateToProps = state => {
    return {
        router: { ...state.router },
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onSaveComponentState: data => dispatch(saveComponentStateAction(data)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(SettingsModule);
