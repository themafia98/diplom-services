import React from "react";
import { Descriptions, Empty } from "antd";
import { connect } from "react-redux";
import Scrollbars from "react-custom-scrollbars";

import { сachingAction } from "../../../../Redux/actions/publicActions";

import ModalWindow from "../../../ModalWindow";
import Output from "../../../Output";
import TitleModule from "../../../TitleModule";
import Comments from "../../../Comments";
import File from "../../../File";

class TaskView extends React.Component {
    state = {
        uuid: this.props.uuid ? this.props.uuid : null,
        mode: "jur",
        primaryKey: "___taskViewSetJurnal",
        showModalJur: false,
    };

    static getDerivedStateFromProps = (props, state) => {
        if (props.uuid !== state.uuid) return { ...state, uuid: props.uuid };
        else return state;
    };

    showModalWorkJur = event => {
        this.setState({
            mode: "jur",
            showModalJur: true,
        });
    };

    renderWorkJurnal = (jurnalDataKeys = []) => {
        const { publicReducer: { caches = null } = {} } = this.props;
        return jurnalDataKeys
            .map(key => {
                const item = caches[key];
                return (
                    <div key={Math.random()} className="jurnalItem">
                        <p>
                            <span className="title">Затрачено времени:</span>{" "}
                            {item.timeLost ? item.timeLost : "не установлено"}
                        </p>
                        <p>
                            <span className="title">Дата:</span> {item.date ? item.date : "не установлено"}
                        </p>
                        <p>
                            <span className="title">Коментарии:</span>
                        </p>
                        <p>{item.description ? item.description : "не установлено"}</p>
                    </div>
                );
            })
            .filter(Boolean);
    };

    render() {
        const {
            router: { routeDataActive = null },
            onCaching,
            publicReducer: { caches = null } = {},
        } = this.props;
        const { mode, primaryKey } = this.state;
        let jurnalDataKeys = null;
        if (caches && primaryKey && routeDataActive && routeDataActive.key) {
            const keys = Object.keys(caches);
            jurnalDataKeys = keys.filter(key => key.includes(primaryKey));
        }

        if (routeDataActive) {
            return (
                <React.Fragment>
                    <TitleModule classNameTitle="taskModuleTittle" title="Карточка задачи" />
                    <ModalWindow
                        onCaching={onCaching}
                        primaryKey={primaryKey}
                        routeDataActive={routeDataActive}
                        mode={mode}
                    />
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
                        <div className="col-6 col-taskDescription">
                            <TitleModule classNameTitle="historyTaskTitle" title="Журнал работы" />
                            <Scrollbars>
                                {!jurnalDataKeys ? (
                                    <Empty description={<span>Нету данных в журнале</span>} />
                                ) : (
                                    this.renderWorkJurnal(jurnalDataKeys)
                                )}
                            </Scrollbars>
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
        publicReducer: state.publicReducer,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onCaching: async (data, primaryKey) => await dispatch(сachingAction({ data, primaryKey })),
    };
};

export default connect(
    mapStateTopProps,
    mapDispatchToProps,
)(TaskView);
