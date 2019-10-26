import React from "react";
import _ from "lodash";
import TitleModule from "../../../TitleModule";
import moment from "moment";
import { Button, Input, Select, DatePicker } from "antd";

import File from "../../../File";
import uuid from "uuid/v4";

import { getSchema } from "../../../../Utils/index";
import { USER_SCHEMA, TASK_SCHEMA } from "../../../../Utils/schema/const"; // delay

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
        let keys = Object.keys(this.state.card);
        if (keys.every(key => _.isNull(this.state.card[key]))) return;
        const validHashCopy = [{ ...this.state.card }];
        const validHash = validHashCopy.map(it => getSchema(TASK_SCHEMA, it)).filter(Boolean)[0];
        this.setState({ load: true });
        firebase.db
            .collection("tasks")
            .doc()
            .set(validHash)
            .then(() => this.setState({ load: false }));
    };

    render() {
        const startFormat = moment().format("l");
        const dateFormat = "YYYY/MM/DD";
        const monthFormat = "YYYY/MM";

        const dateFormatList = ["DD/MM/YYYY", "DD/MM/YY"];
        return (
            <div className="createTask">
                <TitleModule additional="Форма создания задачи" classNameTitle="createTaskTitle" title="Новая задача" />
                <div className="createTask__main">
                    <div className="col-6">
                        <form className="taskForm" name="taskForm">
                            <label>Название: </label>
                            <Input onChange={this.onChangeHandler} name="name" type="text" />
                            <label>Приоритет: </label>
                            <Select
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
                            <TextArea name="description" onChange={this.onChangeHandler} rows={8} />
                            <label>Прикрепить файлы: </label>
                            <File />
                            <label>Срок сдачи: </label>
                            <RangePicker
                                onChange={this.onChangeHandlerDate}
                                defaultValue={[
                                    moment(moment().format("l"), dateFormat),
                                    moment(moment().format("l"), dateFormat),
                                ]}
                                name="date"
                                type="date"
                            />
                            <Button onClick={this.handlerCreateTask} loading={this.state.load} type="primary">
                                Создать задачу
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateTask;
