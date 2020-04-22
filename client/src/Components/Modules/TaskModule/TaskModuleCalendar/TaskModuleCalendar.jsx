// @ts-nocheck
import React from 'react';
import { taskModuleCalendarType } from '../types';
import _ from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import moment from 'moment';
import TitleModule from '../../../TitleModule';
import { Calendar, Popover, Button, message } from 'antd';

import modelContext from '../../../../Models/context';
import { routePathNormalise } from '../../../../Utils';
import Output from '../../../Output';

class TaskModuleCalendar extends React.PureComponent {
  static propTypes = taskModuleCalendarType;
  static contextType = modelContext;
  static defaultProps = {
    data: {},
    loaderMethods: {},
  };

  onClick = (event) => {
    const {
      onOpenPageWithData,
      router: { routeData = {}, currentActionTab = '', actionTabs = [] } = {},
      setCurrentTab,
    } = this.props;
    const { config = {} } = this.context;
    const { tasks = [] } = routeData[currentActionTab] || routeData['taskModule'] || {};
    const { currentTarget } = event;
    const record = currentTarget.className;

    const routeNormalize =
      routePathNormalise({
        pathType: 'moduleItem',
        pathData: { page: 'taskModule', moduleId: 'all', key: record },
      }) || {};

    if (_.isEmpty(routeNormalize)) return;

    const index = actionTabs.findIndex((tab) => tab === routeNormalize.page || tab === routeNormalize.path);
    const isFind = index !== -1;

    if (!isFind) {
      const item = tasks.find((it) => it.key === record);
      if (!item) return;

      if (config.tabsLimit <= actionTabs.length)
        return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

      onOpenPageWithData({
        activePage: routePathNormalise({
          pathType: 'moduleItem',
          pathData: { page: 'taskModule', moduleId: 'all', key: record },
        }),
        routeDataActive: { ...item },
      });
    } else {
      setCurrentTab(actionTabs[index]);
    }
  };
  getListData = (value) => {
    const { router: { routeData = {}, currentActionTab = '' } = {} } = this.props;
    const { tasks = [] } = routeData[currentActionTab] || routeData['taskModule'] || {};
    let valueDate = moment(value.toString()).format('DD.MM.YYYY').trim();
    let dateArrayTask =
      tasks && tasks
        ? tasks
            .map((it) => {
              if (valueDate === it.date[1] && it.date[0] === it.date[1])
                return { ...it, name: `Конец и начало срока: ${it.name}`, key: it.key };
              if (valueDate === it.date[1]) return { ...it, name: `Конец срока: ${it.name}`, key: it.key };
              if (valueDate === it.date[0]) return { ...it, name: `Начало срока: ${it.name}`, key: it.key };
              else return null;
            })
            .filter(Boolean)
        : null;

    const listData = Array.isArray(dateArrayTask)
      ? dateArrayTask.map((it) => {
          return { type: 'success', content: it.name, key: it.key };
        })
      : [];

    return listData || [];
  };

  dateCellRender = (value) => {
    const listData = this.getListData(value);
    const content = listData.map((item) => {
      return (
        <li className={item.key} onClick={this.onClick} key={item.key}>
          <Output>{item.content}</Output>
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
        prev.content ? prev.content + ',' + current.content : current.content,
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
    return (
      <Scrollbars>
        <div className="taskModuleCalendar">
          <TitleModule classNameTitle="taskModuleTittle" title="Календарь задач" />
          <div className="taskModuleCalendar__main">
            <Calendar
              fullscreen={true}
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
