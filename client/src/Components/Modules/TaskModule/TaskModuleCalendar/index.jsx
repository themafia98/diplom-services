import React from "react";
import Scrollbars from 'react-custom-scrollbars';
import moment from "moment";
import TitleModule from "../../../TitleModule";
import { Calendar, Popover, Button } from "antd";

class TaskModuleCalendar extends React.PureComponent {
    getListData = value => {
        let listData = [];
        let today = moment().date();
        let valueDate = value.date();

        switch (valueDate) {
            case today: {
                listData = [{ type: "error", content: "Исправить баги. " }];
                break;
            }
            case today - 7: {
                listData = [
                    {
                        type: "success",
                        content: "Исправить баг. Исправить баги.Исправить баги. Исправить баги. Исправить баги.",
                    },
                ];
                break;
            }
            default:
        }
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
                        <Calendar dateCellRender={this.dateCellRender} monthCellRender={this.monthCellRender} />
                    </div>
                </div>
            </Scrollbars>
        );
    }
}

export default TaskModuleCalendar;
