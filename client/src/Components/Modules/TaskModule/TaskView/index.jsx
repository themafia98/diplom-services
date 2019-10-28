import React from "react";
import { Descriptions, Empty } from "antd";
import { connect } from "react-redux";
import { Menu, Dropdown, Icon } from "antd";
import Scrollbars from "react-custom-scrollbars";

import Output from "../../../Output";
import TitleModule from "../../../TitleModule";
import Comments from "../../../Comments";
import File from "../../../File";

class TaskView extends React.Component {
    state = {
        uuid: this.props.uuid ? this.props.uuid : null,
    };

    static getDerivedStateFromProps = (props, state) => {
        if (props.uuid !== state.uuid) return { ...state, uuid: props.uuid };
        else return state;
    };

    render() {
        const {
            router: { routeDataActive = null },
        } = this.props;
        if (routeDataActive) {
            const menu = (
                <Menu>
                    <Menu.Item>
                        <p>Занести в журнал работы</p>
                    </Menu.Item>
                    <Menu.Item>
                        <p>Сменить статус задачи</p>
                    </Menu.Item>
                </Menu>
            );

            return (
                <React.Fragment>
                    <TitleModule classNameTitle="taskModuleTittle" title="Карточка задачи" />
                    <div className="dropDownWrapper">
                        <Dropdown overlay={menu}>
                            <p>
                                Управление задачей
                                <Icon type="down" />
                            </p>
                        </Dropdown>
                    </div>
                    <div className="taskView">
                        <div className="col-6 col-taskDescription">
                            <Scrollbars>
                                <Descriptions bordered column={{ xxl: 1, xl: 1, lg: 1, d: 1, sm: 1, xs: 1 }}>
                                    <Descriptions.Item label="Артикул">
                                        <Output>{routeDataActive.key}</Output>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Название">
                                        <Output>{routeDataActive.name}</Output>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Статус">
                                        <Output>{routeDataActive.status}</Output>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Приоритет">
                                        <Output>{routeDataActive.priority}</Output>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Автор задачи">
                                        <Output>{routeDataActive.author}</Output>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Исполнитель">
                                        <Output>{routeDataActive.editor}</Output>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Дата назначения">
                                        <Output> {routeDataActive.date[0]}</Output>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Дата завершения">
                                        <Output> {routeDataActive.date[1]}</Output>
                                    </Descriptions.Item>
                                </Descriptions>
                                <div className="descriptionTask">
                                    <p className="descriptionTask__title">Задача</p>
                                    <p className="descriptionTask__content">{routeDataActive.description}</p>
                                    <p className="task_file">Дополнительные файлы для задачи</p>
                                    <File />
                                    <p className="descriptionTask__comment">Коментарии</p>
                                    <Comments />
                                </div>
                            </Scrollbars>
                        </div>
                        <div className="col-6">
                            <TitleModule classNameTitle="historyTaskTitle" title="Журнал работы" />
                            <Empty description={<span>Нету данных в журнале</span>} />
                        </div>
                    </div>
                </React.Fragment>
            );
        } else return <div>This task not found</div>;
    }
}

const mapStateTopProps = state => {
    return {
        router: state.router,
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(
    mapStateTopProps,
    mapDispatchToProps,
)(TaskView);
