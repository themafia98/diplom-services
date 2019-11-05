import React from "react";
import _ from "lodash";
import { Descriptions, Empty } from "antd";
import { connect } from "react-redux";
import Scrollbars from "react-custom-scrollbars";

import { middlewareCaching, middlewareUpdate } from "../../../../Redux/actions/publicActions/middleware";

import ModalWindow from "../../../ModalWindow";
import Output from "../../../Output";
import TitleModule from "../../../TitleModule";
import Comments from "../../../Comments";
import File from "../../../File";

class TaskView extends React.PureComponent {
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
            ...this.state,
            mode: "jur",
            showModalJur: true,
        });
    };

    componentDidMount = () => {
        const {
            publicReducer: { caches = {} } = {},
            router: { routeDataActive = null },
            onCaching,
            path = "",
        } = this.props;
        const { primaryKey: primaryKeyState } = this.state;
        const primaryKey = routeDataActive.key;
        if (_.isEmpty(caches) || !caches[routeDataActive.key]) {
            onCaching(null, primaryKey, "jur", path, "GET", primaryKeyState);
        }
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
                            {item.timeLost ? item.timeLost : item[0] ? item[0].timeLost : "не установлено"}
                        </p>
                        <p>
                            <span className="title">Дата:</span>{" "}
                            {item.date ? item.date : item[0] ? item[0].date : "не установлено"}
                        </p>
                        <p>
                            <span className="title">Коментарии:</span>
                        </p>
                        <p>
                            {item.description
                                ? item.description
                                : item[0].description
                                ? item[0].description
                                : "не установлено"}
                        </p>
                    </div>
                );
            })
            .filter(Boolean);
    };

    render() {
        const {
            router: { routeDataActive = null },
            onCaching,
            onUpdate,
            publicReducer: { caches = null } = {},
            path,
        } = this.props;
        const { mode, primaryKey, uuid } = this.state;
        let jurnalDataKeys = null;
        if (caches && primaryKey && routeDataActive && routeDataActive.key) {
            const keys = Object.keys(caches);

            jurnalDataKeys = keys.filter(key => key.includes(primaryKey) && key.includes(routeDataActive.key));
        }

        const accessStatus = _.uniq([routeDataActive.status, "Открыт", "Выполнен", "Закрыт", "В работе"]);

        if (routeDataActive) {
            return (
                <React.Fragment>
                    <TitleModule classNameTitle="taskModuleTittle" title="Карточка задачи" />
                    <ModalWindow
                        onCaching={onCaching}
                        primaryKey={primaryKey}
                        routeDataActive={routeDataActive}
                        mode={mode}
                        path={path}
                        type={"POST"}
                        key={routeDataActive.key}
                        keyTask={routeDataActive.key}
                        accessStatus={accessStatus}
                        onUpdate={onUpdate}
                        statusTaskValue={routeDataActive && routeDataActive.status ? routeDataActive.status : null}
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
        onCaching: async (data, primaryKey, mode, path, type, pk) =>
            await dispatch(
                middlewareCaching({ data: data, primaryKey: primaryKey, mode: mode, path: path, type: type, pk: pk }),
            ),
        onUpdate: async (id, type, updateProp, updateFild, item, primaryKey) =>
            await dispatch(middlewareUpdate({ id, type, updateProp, updateFild, item, primaryKey })),
    };
};

export default connect(
    mapStateTopProps,
    mapDispatchToProps,
)(TaskView);
