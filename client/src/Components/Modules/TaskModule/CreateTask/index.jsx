import React from "react";
import _ from "lodash";
import Scrollbars from "react-custom-scrollbars";
import TitleModule from "../../../TitleModule";
import moment from "moment";
import { Button, Input, Select, DatePicker, message } from "antd";

import File from "../../../File";
import uuid from "uuid/v4";

import { getSchema } from "../../../../Utils/index";
import { TASK_SCHEMA } from "../../../../Utils/schema/const"; // delay

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

class CreateTask extends React.Component {
    state = {
        load: false,
        card: {
            key: uuid(),
            status: "Открыт",
            name: null,
            priority: "Средний",
            author: "Петрович Павел",
            editor: null,
            description: null,
            date: [moment().format("l"), moment().format("l")],
        },
        errorBundle: {},
    };

    validation = () => {
        const {
            card: { key, status, name, priority, author, editor, description, date },
            errorBundle: errorBundleState,
        } = this.state;
        let isUpdate = false;
        const copyErrorBundleState = { ...errorBundleState };
        const errorBundle = {};

        if (!key) errorBundle.key = "Ключ не найден.";
        else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.key) {
            isUpdate = true;
            copyErrorBundleState.key = null;
        }
        if (!status) errorBundle.status = "Статус не найден.";
        else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.status) {
            isUpdate = true;
            copyErrorBundleState.status = null;
        }
        if (!name) errorBundle.name = "Имя не найдено.";
        else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.name) {
            isUpdate = true;
            copyErrorBundleState.name = null;
        }
        if (!priority) errorBundle.priority = "Приоритет не найден.";
        else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.priority) {
            isUpdate = true;
            copyErrorBundleState.priority = null;
        }
        if (!author) errorBundle.author = "Автор не найден.";
        else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.author) {
            isUpdate = true;
            copyErrorBundleState.author = null;
        }
        if (!editor) errorBundle.editor = "Исполнитель(и) не найден(ы).";
        else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.editor) {
            isUpdate = true;
            copyErrorBundleState.editor = null;
        }
        if (!description) errorBundle.description = "Описание задачи не найдено.";
        else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.description) {
            isUpdate = true;
            copyErrorBundleState.description = null;
        }
        if (!date.length) errorBundle.date = "Срок сдачи не найден.";
        else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.date) {
            isUpdate = true;
            copyErrorBundleState.date = null;
        }

        if (isUpdate) {
            const keyCopy = Object.keys(copyErrorBundleState);
            let newCopyErrorBundle = {};
            keyCopy.forEach(key => {
                if (copyErrorBundleState[key] !== null) newCopyErrorBundle[key] = copyErrorBundleState[key];
            });
            this.setState({ errorBundle: { ...newCopyErrorBundle } });
        }
        if (_.isEmpty(errorBundle)) return true;
        else {
            message.error("Не все поля заполнены!");
            this.setState({ errorBundle: errorBundle });
            return;
        }
    };

    onChangeHandler = event => {
        const { target = null } = event;
        if (_.isNull(target)) return;
        if (!_.isNull(target) && target.name === "name")
            return this.setState({ card: { ...this.state.card, name: target.value } });
        else if (!_.isNull(target) && target.name === "description")
            return this.setState({ card: { ...this.state.card, description: target.value } });
    };

    onChangeHandlerDate = (date, dateArray) => {
        if (_.isArray(dateArray) && dateArray !== this.state.date) {
            return this.setState({ card: { ...this.state.card, date: dateArray } });
        }
    };

    onChangeHandlerSelectEditor = eventArray => {
        if (!_.isArray(eventArray) || eventArray === this.state.editor) return;
        else return this.setState({ card: { ...this.state.card, editor: eventArray } });
    };

    onChangeHandlerSelectPriority = eventString => {
        if (!_.isString(eventString) || eventString === this.state.priority) return;
        else {
            this.setState({ card: { ...this.state.card, priority: eventString } });
        }
    };

    handlerCreateTask = event => {
        const { firebase } = this.props;
        if (!this.validation()) return;
        let keys = Object.keys(this.state.card);
        if (keys.every(key => _.isNull(this.state.card[key]))) return;
        const validHashCopy = [{ ...this.state.card }];
        const validHash = validHashCopy.map(it => getSchema(TASK_SCHEMA, it, "no-strict")).filter(Boolean)[0];
        if (!validHash) return message.error("Не валидные данные.");

        this.setState({ load: true });
        firebase.db
            .collection("tasks")
            .doc()
            .set(validHash)
            .then(() => this.setState({ load: false }, () => message.success(`Задача создана.`)));
    };

    render() {
        const dateFormat = "YYYY/MM/DD";
        const { errorBundle } = this.state;
        return (
            <div className="createTask">
                <TitleModule additional="Форма создания задачи" classNameTitle="createTaskTitle" title="Новая задача" />
                <div className="createTask__main">
                    <div className="col-6 col-task">
                        <Scrollbars autoHide>
                            <form className="taskForm" name="taskForm">
                                <label>Название: </label>
                                <Input
                                    className={[!_.isEmpty(errorBundle) && errorBundle.name ? "isError" : null].join(
                                        " ",
                                    )}
                                    onChange={this.onChangeHandler}
                                    name="name"
                                    type="text"
                                />
                                <label>Приоритет: </label>
                                <Select
                                    className={[
                                        !_.isEmpty(errorBundle) && errorBundle.priority ? "isError" : null,
                                    ].join(" ")}
                                    onChange={this.onChangeHandlerSelectPriority}
                                    defaultValue="Средний"
                                    name="priority"
                                    type="text"
                                >
                                    <Option value="Низкий">Низкий</Option>
                                    <Option value="Средний">Средний</Option>
                                    <Option value="Высокий">Высокий</Option>
                                </Select>
                                <label>Назначить исполнителя/исполнителей:</label>
                                <Select
                                    className={[!_.isEmpty(errorBundle) && errorBundle.editor ? "isError" : null].join(
                                        " ",
                                    )}
                                    onChange={this.onChangeHandlerSelectEditor}
                                    name="editor"
                                    mode="multiple"
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
                                <label>Описание задачи: </label>
                                <TextArea
                                    className={[
                                        !_.isEmpty(errorBundle) && errorBundle.description ? "isError" : null,
                                    ].join(" ")}
                                    name="description"
                                    onChange={this.onChangeHandler}
                                    rows={8}
                                />
                                <label>Прикрепить файлы: </label>
                                <File />
                                <label>Срок сдачи: </label>
                                <RangePicker
                                    className={[!_.isEmpty(errorBundle) && errorBundle.date ? "isError" : null].join(
                                        " ",
                                    )}
                                    onChange={this.onChangeHandlerDate}
                                    defaultValue={[
                                        moment(moment().format("l"), dateFormat),
                                        moment(moment().format("l"), dateFormat),
                                    ]}
                                    name="date"
                                    type="date"
                                />
                                <Button
                                    disabled={this.state.load}
                                    onClick={this.handlerCreateTask}
                                    loading={this.state.load}
                                    type="primary"
                                >
                                    Создать задачу
                                </Button>
                            </form>
                        </Scrollbars>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateTask;
