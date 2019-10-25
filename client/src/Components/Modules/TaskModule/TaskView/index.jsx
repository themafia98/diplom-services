import React from "react";
import { Descriptions, Empty } from "antd";
import _ from "lodash";
import { connect } from "react-redux";
import Scrollbars from "react-custom-scrollbars";

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

    componentDidUpdate = () => {};

    render() {
        const {
            router: { routeDataActive = {} },
        } = this.props;

        const isValid = !_.isNull(routeDataActive) && !_.isNull(routeDataActive.key);
        if (isValid && routeDataActive.key === this.state.uuid) {
            return (
                <React.Fragment>
                    <TitleModule classNameTitle="taskModuleTittle" title="Карточка задачи" />
                    <div className="taskView">
                        <div className="col-6 col-taskDescription">
                            <Scrollbars>
                                <Descriptions bordered column={{ xxl: 1, xl: 1, lg: 1, d: 1, sm: 1, xs: 1 }}>
                                    <Descriptions.Item label="Артикул">{routeDataActive.key}</Descriptions.Item>
                                    <Descriptions.Item label="Название">{routeDataActive.name}</Descriptions.Item>
                                    <Descriptions.Item label="Статус">{routeDataActive.status}</Descriptions.Item>
                                    <Descriptions.Item label="Приоритет">{routeDataActive.priority}</Descriptions.Item>
                                    <Descriptions.Item label="Автор задачи">{routeDataActive.author}</Descriptions.Item>
                                    <Descriptions.Item label="Исполнитель">{routeDataActive.editor}</Descriptions.Item>
                                    <Descriptions.Item label="Дата назначения">
                                        {routeDataActive.date}
                                    </Descriptions.Item>
                                </Descriptions>
                                <div className="descriptionTask">
                                    <p className="descriptionTask__title">Задача</p>
                                    <p className="descriptionTask__content">Исправить баги в компоненте задача</p>
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
