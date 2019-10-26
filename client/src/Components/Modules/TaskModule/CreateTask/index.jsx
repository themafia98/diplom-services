import React from "react";
import TitleModule from "../../../TitleModule";
import moment from "moment";
import { Button, Input, Select, DatePicker } from "antd";

import File from "../../../File";

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
class CreateTask extends React.Component {
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
                            <Input name="name" type="text" />
                            <label>Приоритет: </label>
                            <Select defaultValue="medium" name="priority" type="text">
                                <Option value="low">Низкий</Option>
                                <Option value="medium">Средний</Option>
                                <Option value="hot">Высокий</Option>
                            </Select>
                            <label>Назначить исполнителя/исполнителей:</label>
                            <Select
                                name="editor"
                                mode="multiple"
                                placeholder="выберете исполнителя"
                                optionLabelProp="label"
                            >
                                <Option value="user1" label="Павел Петрович">
                                    <span>Павел Петрович</span>
                                </Option>
                                <Option value="user2" label="Гена Букин">
                                    <span>Гена Букин</span>
                                </Option>
                            </Select>
                            <label>Описание задачи: </label>
                            <TextArea rows={8} />
                            <label>Прикрепить файлы: </label>
                            <File />
                            <label>Срок сдачи: </label>
                            <RangePicker
                                defaultValue={[
                                    moment(moment().format("l"), dateFormat),
                                    moment(moment().format("l"), dateFormat),
                                ]}
                                name="date"
                                type="date"
                            />
                            <Button loading={false} type="primary">
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
