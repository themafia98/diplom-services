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

  onClick = (id = '') => {
    const {
      onOpenPageWithData,
      router: { routeData = {}, currentActionTab = '', activeTabs = [] } = {},
      setCurrentTab,
    } = this.props;
    const { config = {} } = this.context;
    const { tasks = [] } = routeData[currentActionTab] || routeData['taskModule'] || {};

    const routeNormalize =
      routePathNormalise({
        pathType: 'moduleItem',
        pathData: { page: 'taskModule', key: id },
      }) || {};

    if (_.isEmpty(routeNormalize)) return;

    const index = activeTabs.findIndex((tab) => tab === routeNormalize.page || tab === routeNormalize.path);
    const isFind = index !== -1;

    if (!isFind) {
      const item = tasks.find(({ _id: taskId = '' }) => taskId === id);
      if (!item) return;

      if (config.tabsLimit <= activeTabs.length)
        return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

      onOpenPageWithData({
        activePage: routePathNormalise({
          pathType: 'moduleItem',
          pathData: { page: 'taskModule', moduleId: 'all', key: id },
        }),
        routeDataActive: { ...item },
      });
    } else {
      setCurrentTab(activeTabs[index]);
    }
  };
  getListData = (value) => {
    const { router: { routeData = {}, currentActionTab = '' } = {} } = this.props;
    const { tasks = [] } = routeData[currentActionTab] || routeData['taskModule'] || {};
    let valueDate = moment(value.toString()).format('DD.MM.YYYY').trim();
    let dateArrayTask =
      tasks && tasks
        ? tasks.reduce((list, it) => {
            const { date = [], name = '', _id: id = '' } = it || {};

            if (valueDate === date[1] && date[0] === date[1]) {
              return [...list, { ...it, name: `Конец и начало срока: ${name}`, id }];
            }

            if (valueDate === date[1]) {
              return [...list, { ...it, name: `Конец срока: ${it.name}`, id }];
            }

            return list;
          }, [])
        : null;

    const listData = Array.isArray(dateArrayTask)
      ? dateArrayTask.map((it) => {
          const { _id: id = '', name: content = '' } = it || {};
          return { type: 'success', content, id };
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
      const { key = '', id = '', content = '' } = item || {};

      return (
        <li className={key} onClick={this.onClick.bind(this, id)} key={key}>
          <Output>{content}</Output>
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
          <TitleModule classNameTitle="taskModuleTitle" title="Календарь задач" />
          <div className="taskModuleCalendar__main">
            <Calendar
              fullscreen={true}
              dateCellRender={this.dateCellRender}
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
