import React from 'react';
import _ from 'lodash';
import { Table, message } from 'antd';

class DynamicTable extends React.PureComponent {
  onClickRow = record => {
    return {
      onClick: () => {
        const {
          onOpenPageWithData,
          router: { currentActionTab: path, actionTabs = [] },
          setCurrentTab,
          routeParser,
          routePathNormalise,
        } = this.props;
        const { config = {} } = this.context;
        debugger;
        const { key = '' } = record || {};
        if (!key) return;

        if (config.tabsLimit <= actionTabs.length)
          return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

        const { moduleId = '', page = '' } = routeParser({ path });
        if (!moduleId || !page) return;

        const index = actionTabs.findIndex(tab => tab.includes(page) && tab.includes(key));
        const isFind = index !== -1;

        if (!isFind) {
          onOpenPageWithData({
            activePage: routePathNormalise({
              pathType: 'moduleItem',
              pathData: { page, moduleId, key },
            }),
            routeDataActive: record,
          });
        } else {
          setCurrentTab(actionTabs[index]);
        }
      },
    };
  };

  render() {
    const { handleFilter } = this.props;
    const { tasks, flag, udata, height, columns = [] } = this.props;

    let tasksCopy = null;
    if (tasks) tasksCopy = [...tasks];
    let data = tasksCopy;

    if (data)
      data =
        flag && data?.length
          ? data
              .map(it => {
                if (
                  !_.isNull(it.editor) &&
                  it.editor.some(editor => {
                    return editor === udata.displayName;
                  })
                )
                  return it;
                else return null;
              })
              .filter(Boolean)
          : data;
    return (
      <Table
        pagination={{ pageSize: 14 }}
        size="medium"
        scroll={{ y: height }}
        onChange={handleFilter}
        columns={columns}
        dataSource={data}
        onRow={this.onClickRow}
      />
    );
  }
}

export default DynamicTable;
