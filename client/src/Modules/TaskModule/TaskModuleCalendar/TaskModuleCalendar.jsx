import React from 'react';
import { taskModuleCalendarType } from '../types';
import _ from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import moment from 'moment';
import TitleModule from 'Components/TitleModule';
import { Calendar, Popover, Button, message, Dropdown, Menu } from 'antd';
import DrawerViewer from 'Components/DrawerViewer';
import modelContext from 'Models/context';
import { routePathNormalise } from 'Utils';
import Output from 'Components/Output';

class TaskModuleCalendar extends React.PureComponent {
  state = {
    selectedEntity: null,
    drawerVisible: false,
    visbileDropdownId: null,
    visbileDropdown: false,
  };

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

  createTask = (selectedEntity, event) => {
    event.stopPropagation();
    this.setState(
      {
        ...this.state,
        selectedEntity,
        visbileDropdownId: null,
        visbileDropdown: false,
      },
      () => this.onChangeDrawerVisible(),
    );
  };

  onVisibleChange = (id = null, visible = false) => {
    this.setState({
      ...this.state,
      visbileDropdownId: visible ? id : null,
      visbileDropdown: visible,
    });
  };

  dateCellRender = (value) => {
    const { visbileDropdown = false, visbileDropdownId = '' } = this.state;
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

    const menu = (
      <Menu className="dropdown-action">
        <Menu.Item>
          <Button type="primary" className="item-action" onClick={this.createTask.bind(this, value)}>
            Создать задачу
          </Button>
        </Menu.Item>
      </Menu>
    );
    const stringValue = value.toString();
    const dropdown = (children) => (
      <Dropdown
        visible={visbileDropdownId === stringValue && visbileDropdown}
        onVisibleChange={this.onVisibleChange.bind(this, stringValue)}
        overlay={menu}
        trigger={['contextMenu']}
      >
        {children}
      </Dropdown>
    );

    if (content.length) {
      return (
        <>
          {dropdown(
            <Popover content={list}>
              <Button>
                <span onClick={(e) => e.stopPropagation()} className="calendarDate-content">
                  {outValues ? (outValues.content ? outValues.content : outValues) : null}
                </span>
              </Button>
            </Popover>,
          )}
        </>
      );
    }
    return dropdown(<span onClick={(e) => e.stopPropagation()} />);
  };

  onChangeDrawerVisible = () => {
    this.setState((state) => {
      return {
        ...this.state,
        drawerVisible: !state.drawerVisible,
      };
    });
  };

  render() {
    const { drawerVisible = false, selectedEntity = null } = this.state;
    const { udata = {} } = this.props;
    return (
      <Scrollbars hideTracksWhenNotNeeded={true}>
        <div className="taskModuleCalendar">
          <TitleModule classNameTitle="taskModuleTittle" title="Календарь задач" />
          <div className="taskModuleCalendar__main">
            <Calendar
              fullscreen={true}
              dateCellRender={this.dateCellRender.bind(this)}
              monthCellRender={this.monthCellRender}
            />
          </div>
          <DrawerViewer
            title="Создание задачи"
            visible={drawerVisible}
            selectedEntity={selectedEntity}
            contentKey="createTaskModule"
            onClose={this.onChangeDrawerVisible}
            udata={udata}
            moduleProps={this.props}
          />
        </div>
      </Scrollbars>
    );
  }
}

export default TaskModuleCalendar;
