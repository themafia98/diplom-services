import React from "react";
import _ from "lodash";
import moment from "moment";
import { Descriptions, Empty, Input, Select, DatePicker, message } from "antd";
import { connect } from "react-redux";
import Scrollbars from "react-custom-scrollbars";

import { getSchema } from "../../../../Utils/index";
import { TASK_SCHEMA } from "../../../../Utils/schema/const";

import { middlewareCaching, middlewareUpdate } from "../../../../Redux/actions/publicActions/middleware";

import ModalWindow from "../../../ModalWindow";
import Output from "../../../Output";
import TitleModule from "../../../TitleModule";
import Comments from "../../../Comments";
import File from "../../../File";

const { Option } = Select;
const { TextArea } = Input;

class TaskView extends React.PureComponent {
    state = {
        uuid: this.props.uuid ? this.props.uuid : null,
        mode: "jur",
        modeControll: "default",
        modeControllEdit: {
            key: null,
            status: null,
            name: null,
            priority: null,
            author: null,
            editor: null,
            description: null,
            date: null,
        },
        primaryKey: "___taskViewSetJurnal",
        showModalJur: false,
        modeEditContent: false,
    };

    static getDerivedStateFromProps = (props, state) => {
        if (props.uuid !== state.uuid) return { ...state, uuid: props.uuid };
        else return state;
    };

    componentDidMount = () => {
        const {
            publicReducer: { caches = {} } = {},
            router: { routeDataActive = null },
            onCaching,
        } = this.props;
        const { primaryKey: primaryKeyState } = this.state;
        const primaryKey = routeDataActive && routeDataActive.key ? routeDataActive.key : "";
        if (_.isEmpty(caches) || !caches[routeDataActive.key]) {
            onCaching(null, primaryKey, "GET", primaryKeyState, "jurnalWork");
        }
    };

    onEdit = event => {
        const {
            publicReducer: { caches = {} } = {},
            router: { routeDataActive = null },
        } = this.props;
        this.setState({
            ...this.state,
            modeEditContent: false,
            modeControll: "edit",
            modeControllEdit: { ...routeDataActive },
        });
    };

    onRejectEdit = event => {
        this.setState({
            ...this.state,
            modeControll: "default",
            modeEditContent: false,
            modeControllEdit: {
                key: null,
                status: null,
                name: null,
                priority: null,
                author: null,
                editor: null,
                description: null,
                date: null,
            },
        });
    };

    onChangeEditableStart = event => {
        const dateString = event && event._d ? moment(event._d, "DD.MM.YYYY").format("DD.MM.YYYY") : null;
        const { modeControllEdit: { date = [] } = {} } = this.state;
        const newDate = [...date];
        newDate[0] = dateString;

        return this.setState({
            ...this.state,
            modeEditContent: false,
            modeControllEdit: {
                ...this.state.modeControllEdit,
                date: newDate,
            },
        });
    };

    onChangeEditableEnd = event => {
        const dateString = event && event._d ? moment(event._d, "DD.MM.YYYY").format("DD.MM.YYYY") : null;
        const { modeControllEdit: { date = [] } = {} } = this.state;
        const newDate = [...date];
        newDate[1] = dateString;
        return this.setState({
            ...this.state,
            modeEditContent: false,
            modeControllEdit: {
                ...this.state.modeControllEdit,
                date: newDate,
            },
        });
    };

    onChangeEditable = event => {
        const { currentTarget = {}, currentTarget: { value = "" } = {} } = event;
        if (_.isObject(event) && currentTarget && !_.isEmpty(currentTarget)) {
            return this.setState({
                ...this.state,
                modeEditContent: false,
                modeControllEdit: {
                    ...this.state.modeControllEdit,
                    name: value,
                },
            });
        } else if (_.isObject(event)) {
            if (_.isArray(event)) {
                return this.setState({
                    ...this.state,
                    modeEditContent: false,
                    modeControllEdit: {
                        ...this.state.modeControllEdit,
                        editor: [...event],
                    },
                });
            }
        } else if (typeof event === "string") {
            const arrayStatus = ["Открыт", "Выполнен", "Закрыт", "В работе"];
            if (arrayStatus.some(it => it === event)) {
                return this.setState({
                    ...this.state,
                    modeEditContent: false,
                    modeControllEdit: {
                        ...this.state.modeControllEdit,
                        status: event,
                    },
                });
            } else {
                return this.setState({
                    ...this.state,
                    modeEditContent: false,
                    modeControllEdit: {
                        ...this.state.modeControllEdit,
                        priority: event,
                    },
                });
            }
        }
    };

    onUpdateEditable = event => {
        const { onUpdate, router: { routeDataActive = null } = {} } = this.props;
        const { modeControllEdit = {} } = this.state;
        const validHashCopy = [{ ...modeControllEdit }];
        const validHash = validHashCopy.map(it => getSchema(TASK_SCHEMA, it, "no-strict")).filter(Boolean)[0];

        if (validHash)
            onUpdate(
                modeControllEdit.key,
                "UPDATE",
                { ...validHash },
                null,
                { ...routeDataActive },
                "tasks",
                "tasks",
                true,
            )
                .then(() => {
                    this.onRejectEdit(event);
                    message.success("Задача обновлена.");
                })
                .catch(error => {
                    message.error("Ошибка обновления задачи.");
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
            modeEditContent: false,
        });
    };

    renderWorkJurnal = (jurnalDataKeys = []) => {
        const { publicReducer: { caches = null } = {} } = this.props;

        return _.uniq(jurnalDataKeys)
            .map(key => {
                const item = caches[key];

                return (
                    <div key={key} className="jurnalItem">
                        <p>
                            <span className="title">Затрачено времени:</span>{" "}
                            {item && item.timeLost ? item.timeLost : item[0] ? item[0].timeLost : "не установлено"}
                        </p>
                        <p>
                            <span className="title">Дата:</span>{" "}
                            {item && item.date
                                ? moment(item.date).format("DD.MM.YYYY HH:mm:ss")
                                : item[0]
                                ? item[0].date
                                : "не установлено"}
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
        const { mode, primaryKey, modeControll, modeEditContent, modeControllEdit } = this.state;
        let jurnalDataKeys = null;
        if (caches && primaryKey && routeDataActive && routeDataActive.key) {
            const keys = Object.keys(caches);

            jurnalDataKeys = keys.filter(key => key.includes(primaryKey) && key.includes(routeDataActive.key));
        }

        const accessStatus = _.uniq([
            modeControllEdit.status
                ? modeControllEdit.status
                : routeDataActive && routeDataActive.status
                ? routeDataActive.status
                : null,
            "Открыт",
            "Выполнен",
            "Закрыт",
            "В работе",
        ]).filter(Boolean);
        const accessPriority = _.uniq([
            modeControllEdit.priority
                ? modeControllEdit.priority
                : routeDataActive && routeDataActive.priority
                ? routeDataActive.priority
                : null,
            "Высокий",
            "Средний",
            "Низкий",
        ]).filter(Boolean);
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
                        onUpdateEditable={this.onUpdateEditable}
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
                                            <Input
                                                className="nameEdit"
                                                onChange={this.onChangeEditable}
                                                value={modeControllEdit.name}
                                            />
                                        ) : null}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Статус">
                                        {modeControll === "default" ? (
                                            <Output className={statusClassName}>{routeDataActive.status}</Output>
                                        ) : modeControll === "edit" ? (
                                            <Select
                                                className="statusEdit"
                                                value={modeControllEdit.status}
                                                onChange={this.onChangeEditable}
                                                defaultValue={routeDataActive.status}
                                                name="priority"
                                                type="text"
                                            >
                                                {accessStatus.map(it => (
                                                    <Option key={it} value={it}>
                                                        {it}
                                                    </Option>
                                                ))}
                                            </Select>
                                        ) : null}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Приоритет">
                                        {modeControll === "default" ? (
                                            <Output>{routeDataActive.priority}</Output>
                                        ) : modeControll === "edit" ? (
                                            <Select
                                                className="priorityEdit"
                                                value={modeControllEdit.priority}
                                                onChange={this.onChangeEditable}
                                                defaultValue={routeDataActive.priority}
                                                name="priority"
                                                type="text"
                                            >
                                                {accessPriority.map(it => (
                                                    <Option key={it} value={it}>
                                                        {it}
                                                    </Option>
                                                ))}
                                            </Select>
                                        ) : null}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Автор задачи">
                                        <Output>{routeDataActive.author}</Output>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Исполнитель">
                                        {modeControll === "default" ? (
                                            <Output>
                                                {Array.isArray(routeDataActive.editor) &&
                                                routeDataActive.editor.length === 1
                                                    ? routeDataActive.editor
                                                    : Array.isArray(routeDataActive.editor) &&
                                                      routeDataActive &&
                                                      routeDataActive.editor.length > 1
                                                    ? routeDataActive.editor.join(",")
                                                    : null}
                                            </Output>
                                        ) : modeControll === "edit" ? (
                                            <Select
                                                className="editorEdit"
                                                value={modeControllEdit.editor}
                                                onChange={this.onChangeEditable}
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
                                                value={moment(modeControllEdit.date[0], "DD.MM.YYYY")}
                                                className="dateStartEdit"
                                                onChange={this.onChangeEditableStart}
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
                                                value={moment(modeControllEdit.date[1], "DD.MM.YYYY")}
                                                className="dateEndEdit"
                                                onChange={this.onChangeEditableEnd}
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
                                            <i className="icon-pencil"></i>
                                        </span>
                                    </p>
                                    <p className="task_file">Дополнительные файлы для задачи</p>
                                    <File />
                                    <p className="descriptionTask__comment">Коментарии</p>
                                    <Comments rules={true} onUpdate={onUpdate} data={routeDataActive} />
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
        onCaching: async (data, primaryKey, type, pk, store) =>
            await dispatch(middlewareCaching({ data, primaryKey, type, pk, store })),
        onUpdate: async (
            id,
            type,
            updateProp,
            updateFild,
            item,
            findStore,
            updateStore,
            multiply = false,
            limitUpdate,
        ) =>
            await dispatch(
                middlewareUpdate({
                    id,
                    type,
                    updateProp,
                    updateFild,
                    item,
                    findStore,
                    updateStore,
                    multiply,
                    limitUpdate,
                }),
            ),
    };
};

export default connect(
    mapStateTopProps,
    mapDispatchToProps,
)(TaskView);
