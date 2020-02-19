import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import moment from "moment";
import { Descriptions, Empty, Input, Select, DatePicker, message } from "antd";
import { connect } from "react-redux";
import Scrollbars from "react-custom-scrollbars";

import { TASK_SCHEMA } from "../../../../Models/Schema/const";

import { middlewareCaching, middlewareUpdate } from "../../../../Redux/actions/publicActions/middleware";

import uuid from "uuid/v4";

import ModalWindow from "../../../ModalWindow";
import Output from "../../../Output";
import TitleModule from "../../../TitleModule";
import Comments from "../../../Comments";
import File from "../../../File";

import modelContext from "../../../../Models/context";

const { Option } = Select;

class TaskView extends React.PureComponent {
    state = {
        key: this.props.uuid ? this.props.uuid : null,
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
            date: null
        },
        actionType: "__setJurnal",
        isLoadingFiles: false,
        filesArray: [],
        filteredUsers: [],
        showModalJur: false,
        modeEditContent: false
    };

    static contextType = modelContext;

    static propTypes = {
        onCaching: PropTypes.func.isRequired,
        onUpdate: PropTypes.func.isRequired,
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        onLoadCurrentData: PropTypes.func,
        data: PropTypes.oneOfType([PropTypes.object, () => null])
    };

    static getDerivedStateFromProps = (props, state) => {
        if (props.uuid !== state.key) return { ...state, key: props.key };
        else return state;
    };

    componentDidMount = async () => {
        const {
            publicReducer: { caches = {} } = {},
            router: { routeDataActive: { key = "" } = {}, routeDataActive = {} },
            onLoadCacheData,
            data: { key: keyProps = "" } = {}
        } = this.props;
        const { Request = {} } = this.context;
        const { actionType } = this.state;
        const idTask = !_.isEmpty(routeDataActive) && key ? key : keyProps ? keyProps : "";
        if (_.isEmpty(caches) || (key && !caches[key]) || (!key && onLoadCacheData)) {
            onLoadCacheData({ actionType, depKey: idTask, depStore: "tasks", store: "jurnalworks" });
            try {
                const rest = new Request();
                const response = await rest.sendRequest("/system/userList", "GET", null, true);

                if (response && response.status === 200) {
                    const { data: { response: { metadata = [] } = {} } = {} } = response || {};

                    const filteredUsers = metadata
                        .map(user => {
                            const { _id = "", displayName = "" } = user;

                            if (!user || !_id || !displayName) return null;

                            return {
                                _id,
                                displayName
                            };
                        })
                        .filter(Boolean);

                    this.setState({
                        filteredUsers
                    });
                } else throw new Error("fail load user list");
            } catch (err) {
                message.error("Ошибка загрузки сотрудников.");
                console.error(err);
            }
        }
    };

    componentDidUpdate = async (props, state) => {
        const { isLoadingFiles = false, shouldRefresh = false } = this.state;
        const {
            router: { routeDataActive: { key = "" } = {}, routeDataActive = {} }
        } = this.props;
        const { Request = {} } = this.context;

        if ((!isLoadingFiles && routeDataActive["_id"]) || shouldRefresh) {
            try {
                this.setState(
                    {
                        shouldRefresh: false,
                        isLoadingFiles: true
                    },
                    async () => {
                        const rest = new Request();
                        const { data: { response = null } = {} } = await rest.sendRequest(
                            "/system/tasks/load/file",
                            "POST",
                            {
                                queryParams: {
                                    taskId: routeDataActive["_id"]
                                }
                            }
                        );

                        if (response && response.done) {
                            const { metadata: filesArray } = response;

                            this.setState({
                                filesArray: filesArray.map(it => {
                                    const { name, path_display: url, id: uid } = it;
                                    const [module, taskId, filename] = url.slice(1).split(/\//gi);

                                    return {
                                        name,
                                        url: `${rest.getApi()}/system/${module}/download/${taskId}/${filename}`,
                                        status: "done",
                                        uid
                                    };
                                })
                            });
                        }
                    }
                );
            } catch (err) {
                console.error(err);
            }
        }
    };

    onAddFileList = (fileList, status) => {
        console.log(status);
        const shouldRefresh = fileList.every(it => it.status === "done");
        this.setState({
            filesArray: [...fileList],
            shouldRefresh
        });
    };

    onRemoveFile = async file => {
        try {
            const { filesArray } = this.state;
            const { Request = {} } = this.context;
            if (!file) return;

            const rest = new Request();
            const { data: { response = null } = {} } = await rest.sendRequest(`/system/tasks/delete/file`, "DELETE", {
                queryParams: {
                    file
                }
            });

            if (response && response.done) {
                const { metadata = {} } = response;
                const { uid: idClient } = file;
                const { id: idResponse } = metadata;

                if (idClient !== idResponse) {
                    throw new Error("id files not equal");
                }

                this.setState(
                    {
                        filesArray: filesArray.filter(it => it.uid !== idResponse)
                    },
                    () => {
                        message.success("Файл успешно удален");
                    }
                );
            } else throw new Error("Invalid delete file");
        } catch (err) {
            console.error(err);
            message.error("Ошибка удаления файла.");
        }
    };

    onEdit = event => {
        const {
            router: { routeDataActive = {} }
        } = this.props;
        this.setState({
            ...this.state,
            modeEditContent: false,
            modeControll: "edit",
            modeControllEdit: { ...routeDataActive }
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
                date: null
            }
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
                date: newDate
            }
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
                date: newDate
            }
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
                    name: value
                }
            });
        } else if (_.isObject(event)) {
            if (_.isArray(event)) {
                return this.setState({
                    ...this.state,
                    modeEditContent: false,
                    modeControllEdit: {
                        ...this.state.modeControllEdit,
                        editor: [...event]
                    }
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
                        status: event
                    }
                });
            } else {
                return this.setState({
                    ...this.state,
                    modeEditContent: false,
                    modeControllEdit: {
                        ...this.state.modeControllEdit,
                        priority: event
                    }
                });
            }
        }
    };

    onUpdateEditable = event => {
        const { onUpdate, router: { routeDataActive = {} } = {}, path = "" } = this.props;
        const { modeControllEdit = {} } = this.state;
        const validHashCopy = [{ ...modeControllEdit }];
        const { schema = {} } = this.context;

        const validHash = validHashCopy.map(it => schema.getSchema(TASK_SCHEMA, it)).filter(Boolean)[0];

        if (validHash)
            onUpdate({
                path,
                type: "UPDATE",
                actionType: "update_many",
                id: modeControllEdit["_id"],
                key: modeControllEdit["key"] || "",
                updateItem: { ...validHash },
                item: { ...routeDataActive },
                store: "tasks"
            })
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
            modeEditContent: false
        });
    };

    onEditContentMode = event => {
        this.setState({
            ...this.state,
            modeEditContent: true
        });
    };

    showModalWorkJur = event => {
        this.setState({
            ...this.state,
            mode: "jur",
            showModalJur: true,
            modeEditContent: false
        });
    };

    renderWorkJurnal = (jurnalDataKeys = []) => {
        const { publicReducer: { caches = null } = {} } = this.props;

        return _.uniq(jurnalDataKeys)
            .map(key => {
                const item = caches[key];
                const date = item && Array.isArray(item.date) ? item.date[0] : "Invalid date";

                return (
                    <div key={key} className="jurnalItem">
                        <p>
                            <span className="title">Затрачено времени:</span>{" "}
                            {item && item.timeLost ? item.timeLost : item[0] ? item[0].timeLost : "не установлено"}
                        </p>
                        <p>
                            <span className="title">Дата:</span>{" "}
                            {item && item.date && date !== "Invalid date"
                                ? date
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
            .filter(Boolean)
            .sort((a, b) => (a.date && b.date ? moment(a.date).valueOf() - moment(b.date).valueOf() : a - b));
    };

    render() {
        const {
            router: { routeDataActive = {} },
            onCaching,
            onUpdate,
            publicReducer: { caches = null } = {},
            path,
            udata = {}
        } = this.props;

        const {
            mode,
            actionType,
            modeControll,
            modeEditContent,
            modeControllEdit,
            filesArray = [],
            filteredUsers = []
        } = this.state;

        const {
            key = "",
            status = "",
            priority = "",
            name = "",
            author = "",
            editor = [],
            date = [],
            description = ""
        } = routeDataActive || {};

        const { rest = {} } = this.context;

        let jurnalDataKeys = null;
        if (caches && actionType && routeDataActive && key) {
            const keys = Object.keys(caches);

            jurnalDataKeys = keys.filter(keyData => keyData.includes(actionType) && keyData.includes(key));
        }

        const accessStatus = _.uniq([
            modeControllEdit.status ? status : status ? status : null,
            "Открыт",
            "Выполнен",
            "Закрыт",
            "В работе"
        ]).filter(Boolean);

        const accessPriority = _.uniq([
            modeControllEdit.priority ? modeControllEdit.priority : priority ? priority : null,
            "Высокий",
            "Средний",
            "Низкий"
        ]).filter(Boolean);
        const rulesEdit = true;

        const statusClassName = routeDataActive
            ? status === "Выполнен"
                ? "done"
                : status === "Закрыт"
                ? "close"
                : status === "В работе"
                ? "active"
                : null
            : null;

        if (key) {
            return (
                <Scrollbars>
                    <TitleModule classNameTitle="taskModuleTittle" title="Карточка задачи" />
                    <ModalWindow
                        onCaching={onCaching}
                        actionType={actionType}
                        routeDataActive={routeDataActive}
                        mode={mode}
                        path={path}
                        typeRequst={"POST"}
                        key={key ? key : uuid()}
                        keyTask={key ? key : null}
                        accessStatus={accessStatus}
                        onUpdate={onUpdate}
                        onEdit={this.onEdit}
                        description={description}
                        onRejectEdit={this.onRejectEdit}
                        modeControll={modeControll}
                        editableContent={description}
                        modeEditContent={modeEditContent}
                        onCancelEditModeContent={this.onCancelEditModeContent}
                        onUpdateEditable={this.onUpdateEditable}
                        statusTaskValue={status ? status : null}
                    />
                    <div className="taskView">
                        <div className="col-6 col-taskDescription">
                            <Scrollbars>
                                <Descriptions bordered column={{ xxl: 1, xl: 1, lg: 1, d: 1, sm: 1, xs: 1 }}>
                                    <Descriptions.Item label="Артикул">
                                        <Output className="key">{key}</Output>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Название">
                                        {modeControll === "default" ? (
                                            <Output className="name">{name}</Output>
                                        ) : modeControll === "edit" && modeControllEdit ? (
                                            <Input
                                                className="nameEdit"
                                                onChange={this.onChangeEditable}
                                                value={modeControllEdit.name}
                                            />
                                        ) : null}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Статус">
                                        {modeControll === "default" ? (
                                            <Output className={["status", statusClassName].join(" ")}>{status}</Output>
                                        ) : modeControll === "edit" && modeControllEdit ? (
                                            <Select
                                                className="statusEdit"
                                                value={modeControllEdit.status}
                                                onChange={this.onChangeEditable}
                                                defaultValue={status}
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
                                            <Output className="priority">{priority}</Output>
                                        ) : modeControll === "edit" && modeControllEdit ? (
                                            <Select
                                                className="priorityEdit"
                                                value={modeControllEdit.priority}
                                                onChange={this.onChangeEditable}
                                                defaultValue={priority}
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
                                        <Output className="author">{author}</Output>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Исполнитель">
                                        {modeControll === "default" ? (
                                            <Output className="editor">
                                                {Array.isArray(editor) && editor.length === 1
                                                    ? editor
                                                    : Array.isArray(editor) && editor.length > 1
                                                    ? editor.join(",")
                                                    : null}
                                            </Output>
                                        ) : modeControll === "edit" && modeControllEdit ? (
                                            <Select
                                                className="editorEdit"
                                                value={modeControllEdit.editor}
                                                onChange={this.onChangeEditable}
                                                name="editor"
                                                mode="multiple"
                                                defaultValue={editor}
                                                placeholder="выберете исполнителя"
                                                optionLabelProp="label"
                                            >
                                                {filteredUsers.map(it => (
                                                    <Option key={it._id} value={it.displayName} label={it.displayName}>
                                                        <span>{it.displayName}</span>
                                                    </Option>
                                                ))}
                                            </Select>
                                        ) : null}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Дата назначения">
                                        {modeControll === "default" ? (
                                            <Output className="startDate"> {date[0] ? date[0] : null}</Output>
                                        ) : modeControll === "edit" && modeControllEdit ? (
                                            <DatePicker
                                                value={moment(
                                                    modeControllEdit.date && modeControllEdit.date[0]
                                                        ? modeControllEdit.date[0]
                                                        : date[0]
                                                        ? date[0]
                                                        : moment(),
                                                    "DD.MM.YYYY"
                                                )}
                                                className="dateStartEdit"
                                                onChange={this.onChangeEditableStart}
                                                defaultValue={date[0] ? moment(date[0], "DD.MM.YYYY") : null}
                                                format="DD.MM.YYYY"
                                            />
                                        ) : null}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Дата завершения">
                                        {modeControll === "default" ? (
                                            <Output className="endDate"> {date[1] ? date[1] : null}</Output>
                                        ) : modeControll === "edit" && modeControllEdit ? (
                                            <DatePicker
                                                value={moment(
                                                    modeControllEdit.date && modeControllEdit.date[1]
                                                        ? modeControllEdit.date[1]
                                                        : date[1]
                                                        ? date[1]
                                                        : moment(),
                                                    "DD.MM.YYYY"
                                                )}
                                                className="dateEndEdit"
                                                onChange={this.onChangeEditableEnd}
                                                defaultValue={date[1] ? moment(date[1], "DD.MM.YYYY") : null}
                                                format="DD.MM.YYYY"
                                            />
                                        ) : null}
                                    </Descriptions.Item>
                                </Descriptions>
                                <div className="descriptionTask">
                                    <p className="descriptionTask__title">Задача</p>
                                    <div
                                        onClick={rulesEdit ? this.onEditContentMode : null}
                                        className={[
                                            "description",
                                            "descriptionTask__content",
                                            rulesEdit ? "editable" : null
                                        ].join(" ")}
                                    >
                                        <span className="icon-wrapper">
                                            <i className="icon-pencil"></i>
                                        </span>
                                        <Scrollbars style={{ height: "150px" }}>
                                            <span className="descriptionContent">
                                                {description ? description : "Описания задачи нету."}
                                            </span>
                                        </Scrollbars>
                                    </div>

                                    <p className="task_file">Дополнительные файлы для задачи</p>
                                    <File
                                        filesArray={filesArray}
                                        rest={rest}
                                        onAddFileList={this.onAddFileList}
                                        onRemoveFile={this.onRemoveFile}
                                        moduleData={routeDataActive}
                                        module="tasks"
                                    />
                                    <p className="descriptionTask__comment">Коментарии</p>
                                    <Comments udata={udata} rules={true} onUpdate={onUpdate} data={routeDataActive} />
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
                </Scrollbars>
            );
        } else return <div>This task not found</div>;
    }
}

const mapStateTopProps = state => {
    const { router = {}, publicReducer = {}, publicReducer: { udata = {} } = {} } = state || {};

    return {
        router,
        publicReducer,
        udata
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onCaching: async props => await dispatch(middlewareCaching(props)),
        onUpdate: props => dispatch(middlewareUpdate({ ...props }))
    };
};

export { TaskView };
export default connect(mapStateTopProps, mapDispatchToProps)(TaskView);
