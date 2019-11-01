import React from "react";
import Scrollbars from "react-custom-scrollbars";
import moment from "moment";
import TitleModule from "../../../TitleModule";
import { Calendar, Popover, Button } from "antd";

class TaskModuleCalendar extends React.PureComponent {
    getListData = value => {
        const { data = null } = this.props;

        let today = null;
        let valueDate = moment(value.toString())
            .format("DD MM YYYY")
            .split(" ")
            .join(".")
            .trim();

        let dateArrayTask =
            data && data.tasks
                ? data.tasks
                    .map(it => {
                        if (
                            valueDate ===
                            moment(
                                it.date[0]
                                    .split(".")
                                    .reverse()
                                    .join("."),
                            ).format("l")
                        )
                            return it;
                        else return null;
                    })
                    .filter(Boolean)
                : null;
        const listData = Array.isArray(dateArrayTask)
            ? dateArrayTask.map(it => {
                return { type: "success", content: it.description };
            })
            : [];

        return listData || [];
    };

    dateCellRender = value => {
        const listData = this.getListData(value);
        const content = listData.map(item => {
            return (
                <li onClick={this.test} key={item.content}>
                    {item.content}
                </li>
            );
        });

        const list = (
            <ul key="list" className="listTasks">
                {content}
            </ul>
        );
        let outValues = listData.length ? [...listData] : null;
        if (listData.length) {
            outValues = outValues.reduce((prev, current) => prev.content + current.content);
        }

        if (content.length)
            return (
                <Popover content={list}>
                    <Button>
                        <span className="calendarDate-content">{outValues.content}</span>
                    </Button>
                </Popover>
            );
    };

    test = event => { };

    render() {
        return (
            <Scrollbars>
                <div className="taskModuleCalendar">
                    <TitleModule classNameTitle="taskModuleTittle" title="Календарь задач" />
                    <div className="taskModuleCalendar__main">
                        <Calendar
                            locale="default"
                            dateCellRender={this.dateCellRender}
                            monthCellRender={this.monthCellRender}
                        />
                    </div>
                </div>
            </Scrollbars>
        );
    }
}

export default TaskModuleCalendar;
