import React from "react";
import Scrollbars from "react-custom-scrollbars";
import moment from "moment";
import TitleModule from "../../../TitleModule";
import { Calendar, Popover, Button } from "antd";

class TaskModuleCalendar extends React.PureComponent {
    getListData = value => {
        const { router: { routeData = {}, currentActionTab = "" } = {} } = this.props;
        const { tasks = [] } = routeData[currentActionTab] || routeData["taskModule"] || {};
        let valueDate = moment(value.toString())
            .format("DD.MM.YYYY")
            .trim();
        let dateArrayTask =
            tasks && tasks
                ? tasks
                      .map(it => {
                          if (valueDate === it.date[0]) return it;
                          else return null;
                      })
                      .filter(Boolean)
                : null;

        const listData = Array.isArray(dateArrayTask)
            ? dateArrayTask.map(it => {
                  return { type: "success", content: it.name };
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
            outValues = outValues.reduce((prev, current) =>
                prev.content ? prev.content + current.content : current.content,
            );
        }

        if (content.length)
            return (
                <Popover content={list}>
                    <Button>
                        <span className="calendarDate-content">
                            {outValues ? (outValues.content ? outValues.content : outValues) : null}
                        </span>
                    </Button>
                </Popover>
            );
    };

    test = event => {};

    render() {
        // const { height } = this.props;
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
