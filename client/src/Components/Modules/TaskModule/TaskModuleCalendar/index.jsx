import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import Scrollbars from "react-custom-scrollbars";
import moment from "moment";
import TitleModule from "../../../TitleModule";
import { Calendar, Popover, Button } from "antd";

import { routePathNormalise } from "../../../../Utils";

class TaskModuleCalendar extends React.PureComponent {
    static propTypes = {
        setCurrentTab: PropTypes.func.isRequired,
        onOpenPageWithData: PropTypes.func.isRequired,
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number, () => null]),
        router: PropTypes.object.isRequired
    };

    onClick = event => {
        const {
            onOpenPageWithData,
            router: { routeData = {}, currentActionTab = "", actionTabs = [] } = {},
            setCurrentTab
        } = this.props;
        const { tasks = [] } = routeData[currentActionTab] || routeData["taskModule"] || {};
        const { currentTarget } = event;
        const record = currentTarget.className;

        const routeNormalize =
            routePathNormalise({
                pathType: "moduleItem",
                pathData: { page: "taskModule", moduleId: "all", key: record }
            }) || {};

        if (_.isEmpty(routeNormalize)) return;

        const index = actionTabs.findIndex(tab => tab === routeNormalize.page);
        const isFind = index !== -1;

        if (!isFind) {
            const item = tasks.find(it => it.key === record);
            if (!item) return;
            onOpenPageWithData({
                activePage: routePathNormalise({
                    pathType: "moduleItem",
                    pathData: { page: "taskModule", moduleId: "all", key: record }
                }),
                routeDataActive: { ...item }
            });
        } else {
            setCurrentTab(actionTabs[index]);
        }
    };
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
                          if (valueDate === it.date[1] && it.date[0] === it.date[1])
                              return { ...it, name: `Конец и начало срока: ${it.name}`, key: it.key };
                          if (valueDate === it.date[1]) return { ...it, name: `Конец срока: ${it.name}`, key: it.key };
                          if (valueDate === it.date[0]) return { ...it, name: `Начало срока: ${it.name}`, key: it.key };
                          else return null;
                      })
                      .filter(Boolean)
                : null;

        const listData = Array.isArray(dateArrayTask)
            ? dateArrayTask.map(it => {
                  return { type: "success", content: it.name, key: it.key };
              })
            : [];

        return listData || [];
    };

    dateCellRender = value => {
        const listData = this.getListData(value);
        const content = listData.map(item => {
            return (
                <li className={item.key} onClick={this.onClick} key={item.key}>
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
                prev.content ? prev.content + "," + current.content : current.content
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

    render() {
        // const { height } = this.props;
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
