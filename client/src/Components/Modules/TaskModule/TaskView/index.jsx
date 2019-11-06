import React from "react";
import _ from "lodash";
import moment from "moment";
import { Descriptions, Empty, Input, Select, DatePicker } from "antd";
import { connect } from "react-redux";
import Scrollbars from "react-custom-scrollbars";

import { middlewareCaching, middlewareUpdate } from "../../../../Redux/actions/publicActions/middleware";

import ModalWindow from "../../../ModalWindow";
import Output from "../../../Output";
import TitleModule from "../../../TitleModule";
import Comments from "../../../Comments";
import File from "../../../File";
import { isArray } from "util";

const { Option } = Select;
const { TextArea } = Input;

class TaskView extends React.PureComponent {
    state = {
        uuid: this.props.uuid ? this.props.uuid : null,
        mode: "jur",
        modeControll: "default",
        primaryKey: "___taskViewSetJurnal",
        showModalJur: false,
        modeEditContent: false,
    };

    static getDerivedStateFromProps = (props, state) => {
        if (props.uuid !== state.uuid) return { ...state, uuid: props.uuid };
        else return state;
    };

    onEdit = event => {
        this.setState({
            ...this.state,
            modeControll: "edit",
        });
    };

    onRejectEdit = event => {
        this.setState({
            ...this.state,
            modeControll: "default",
        });
    };

    onCancelEditModeContent = event => {
        this.setState({
            ...this.state,
            modeEditContent: false,
        });
    };

    onEditContentMode = event => {
        this.setState({
            ...this.state,
            modeEditContent: true,
        });
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
                            {item && item.timeLost ? item.timeLost : item[0] ? item[0].timeLost : "не установлено"}
                        </p>
                        <p>
                            <span className="title">Дата:</span>{" "}
                            {item && item.date ? item.date : item[0] ? item[0].date : "не установлено"}
                        </p>
                        <p>
                            <span className="title">Коментарии:</span>
                        </p>
                        <p>
                            {item && item.description
                                ? item.description
                                : Array.isArray(item)
                                ? item[0] && item[0].description
                                    ? item[0].description
                                    : "не установлено"
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
        const { mode, primaryKey, modeControll, modeEditContent } = this.state;
        let jurnalDataKeys = null;
        if (caches && primaryKey && routeDataActive && routeDataActive.key) {
            const keys = Object.keys(caches);

            jurnalDataKeys = keys.filter(key => key.includes(primaryKey) && key.includes(routeDataActive.key));
        }

        const accessStatus = _.uniq([routeDataActive.status, "Открыт", "Выполнен", "Закрыт", "В работе"]);
        const accessPriority = _.uniq([routeDataActive.priority, "Высокий", "Средний", "Низкий"]);
        const rulesEdit = true;

        const statusClassName = routeDataActive
            ? routeDataActive.status === "Выполнен"
                ? "done"
                : routeDataActive.status === "Закрыт"
                ? "close"
                : routeDataActive.status === "В работе"
                ? "active"
                : null
            : null;

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
                        typeRequst={"POST"}
                        key={routeDataActive.key}
                        keyTask={routeDataActive.key}
                        accessStatus={accessStatus}
                        onUpdate={onUpdate}
                        onEdit={this.onEdit}
                        onRejectEdit={this.onRejectEdit}
                        modeControll={modeControll}
                        editableContent={routeDataActive.description}
                        modeEditContent={modeEditContent}
                        onCancelEditModeContent={this.onCancelEditModeContent}
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
                                        {modeControll === "default" ? (
                                            <Output>{routeDataActive.name}</Output>
                                        ) : modeControll === "edit" ? (
                                            <Input value={routeDataActive.name} />
                                        ) : null}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Статус">
                                        {modeControll === "default" ? (
                                            <Output className={statusClassName}>{routeDataActive.status}</Output>
                                        ) : modeControll === "edit" ? (
                                            <Select
                                                // onChange={this.onChangeHandlerSelectPriority}
                                                defaultValue={routeDataActive.status}
                                                name="priority"
                                                type="text"
                                            >
                                                {accessStatus.map(it => (
                                                    <Option value={it}>{it}</Option>
                                                ))}
                                            </Select>
                                        ) : null}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Приоритет">
                                        {modeControll === "default" ? (
                                            <Output>{routeDataActive.priority}</Output>
                                        ) : modeControll === "edit" ? (
                                            <Select
                                                // onChange={this.onChangeHandlerSelectPriority}
                                                defaultValue={routeDataActive.priority}
                                                name="priority"
                                                type="text"
                                            >
                                                {accessPriority.map(it => (
                                                    <Option value={it}>{it}</Option>
                                                ))}
                                            </Select>
                                        ) : null}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Автор задачи">
                                        <Output>{routeDataActive.author}</Output>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Исполнитель">
                                        {modeControll === "default" ? (
                                            <Output>{routeDataActive.editor}</Output>
                                        ) : modeControll === "edit" ? (
                                            <Select
                                                //onChange={this.onChangeHandlerSelectEditor}
                                                name="editor"
                                                mode="multiple"
                                                defaultValue={routeDataActive.editor}
                                                placeholder="выберете исполнителя"
                                                optionLabelProp="label"
                                            >
                                                <Option value="Павел Петрович" label="Павел Петрович">
                                                    <span>Павел Петрович</span>
                                                </Option>
                                                <Option value="Гена Букин" label="Гена Букин">
                                                    <span>Гена Букин</span>
                                                </Option>
                                            </Select>
                                        ) : null}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Дата назначения">
                                        {modeControll === "default" ? (
                                            <Output> {routeDataActive.date[0] ? routeDataActive.date[0] : null}</Output>
                                        ) : modeControll === "edit" ? (
                                            <DatePicker
                                                defaultValue={
                                                    routeDataActive.date[0]
                                                        ? moment(routeDataActive.date[0], "DD.MM.YYYY")
                                                        : null
                                                }
                                                format="DD.MM.YYYY"
                                            />
                                        ) : null}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Дата завершения">
                                        {modeControll === "default" ? (
                                            <Output> {routeDataActive.date[1] ? routeDataActive.date[1] : null}</Output>
                                        ) : modeControll === "edit" ? (
                                            <DatePicker
                                                defaultValue={
                                                    routeDataActive.date[1]
                                                        ? moment(routeDataActive.date[1], "DD.MM.YYYY")
                                                        : null
                                                }
                                                format="DD.MM.YYYY"
                                            />
                                        ) : null}
                                    </Descriptions.Item>
                                </Descriptions>
                                <div className="descriptionTask">
                                    <p className="descriptionTask__title">Задача</p>
                                    <p
                                        onClick={rulesEdit ? this.onEditContentMode : null}
                                        className={["descriptionTask__content", rulesEdit ? "editable" : null].join(
                                            " ",
                                        )}
                                    >
                                        {routeDataActive.description
                                            ? routeDataActive.description
                                            : "Описания задачи нету."}
                                        <span className="icon-wrapper">
                                            <i className="icon-pencil-neg"></i>
                                        </span>
                                    </p>
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
