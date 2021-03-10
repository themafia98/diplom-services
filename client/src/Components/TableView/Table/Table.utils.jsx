import { Button, Icon, Input } from 'antd';
import { TASK_STATUS } from 'Modules/TaskModule/TaskModule.constant';
import React from 'react';

export const createTableConfig = (columns, sortedInfo, searchInputRef, handleSearch, handleReset) => {
  return columns.map(
    ({ name, dataValue, sortOrder, render, shouldBeUseCustomFilterDropdown, customSorter }) => ({
      title: name,
      className: dataValue,
      dataIndex: dataValue,
      key: dataValue,
      sorter: customSorter ? customSorter : (a, b) => a[dataValue].length - b[dataValue].length,
      sortDirections: ['descend', 'ascend'],
      sortOrder: sortOrder ? sortOrder : sortedInfo && sortedInfo.columnKey === dataValue && sortedInfo.order,
      render,
      filterDropdown: shouldBeUseCustomFilterDropdown
        ? ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
            return (
              <div className="Table-controllers">
                <Input
                  className="searchInput-popover"
                  ref={searchInputRef}
                  placeholder={`Поиск по ${dataValue}`}
                  value={selectedKeys[0]}
                  onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                  onPressEnter={() => handleSearch(selectedKeys, confirm)}
                />
                <Button
                  className="buttonSearch-popover"
                  type="primary"
                  onClick={() => handleSearch(selectedKeys, confirm, dataValue)}
                  icon="search"
                  size="small"
                >
                  Искать
                </Button>
                <Button
                  className="buttonReset-popover"
                  onClick={() => handleReset(clearFilters)}
                  size="small"
                >
                  Сброс
                </Button>
              </div>
            );
          }
        : undefined,
      filterIcon: (filtered) => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => {
        const filterText = record[dataValue].toString().toLowerCase().includes(value.toLowerCase());
        return filterText;
      },
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInputRef.current && searchInputRef.current.select());
        }
      },
    }),
  );
};

export const getStatusByTitle = (text) => {
  switch (text) {
    case TASK_STATUS.IN_WORK:
      return 'active';
    case TASK_STATUS.CLOSE:
      return 'close';
    case TASK_STATUS.DONE:
      return 'done';
    case TASK_STATUS.OPEN:
      return 'open';
    default:
      return '';
  }
};
