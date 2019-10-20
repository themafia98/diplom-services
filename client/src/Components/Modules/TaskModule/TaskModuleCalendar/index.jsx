import React from "react";
import TitleModule from "../../../TitleModule";
import { Calendar, Badge } from "antd";

class TaskModuleCalendar extends React.PureComponent {
    getListData = value => {
        let listData;
        switch (value.date()) {
            case 8:
                listData = [
                    { type: "warning", content: "This is warning event." },
                    { type: "success", content: "This is usual event." },
                ];
                break;
            case 10:
                listData = [
                    { type: "warning", content: "This is warning event." },
                    { type: "success", content: "This is usual event." },
                    { type: "error", content: "This is error event." },
                ];
                break;
            case 15:
                listData = [{ type: "warning", content: "This is warning event" }];
                break;
            default:
        }
        return listData || [];
    };

    dateCellRender = value => {
        const listData = this.getListData(value);
        return (
            <ul className="events">
                {listData.map(item => (
                    <li key={item.content}>
                        <Badge status={item.type} text={item.content} />
                    </li>
                ))}
            </ul>
        );
    };

    render() {
        return (
            <div className="taskModuleCalendar">
                <TitleModule classNameTitle="taskModuleTittle" title="Календарь задач" />
                <div className="taskModuleCalendar__main">
                    <Calendar dateCellRender={this.dateCellRender} monthCellRender={this.monthCellRender} />
                </div>
            </div>
        );
    }
}

export default TaskModuleCalendar;
