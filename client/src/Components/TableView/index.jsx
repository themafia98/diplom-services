import React from "react";
import { connect } from "react-redux";
import moment from "moment";
import _ from "lodash";
import { Icon, Empty, Table, Input, Button } from "antd";
import Loader from "../Loader";
import Scrollbars from "react-custom-scrollbars";
import uuid from "uuid/v4";
import Highlighter from "react-highlight-words";

import Output from "../Output";

import { openPageWithDataAction } from "../../Redux/actions/routerActions";
import { loadCurrentData } from "../../Redux/actions/routerActions/middleware";

class TableView extends React.Component {
    state = {
        searchText: null,
        sortedInfo: null,
        isScroll: null,
    };

    componentDidMount = () => {
        const { path, onLoadCurrentData } = this.props;
        if (path === "mainModule__table") onLoadCurrentData({ path, storeLoad: "users" });
        window.addEventListener("resize", this.setSizeWindow);
    };

    componentWillUnmount = () => {
        window.removeEventListener("resize", this.setSizeWindow);
    };

    setSizeWindow = event => {
        if (window.innerWidth <= 1450 && _.isNull(this.state.isScroll)) this.setState({ isScroll: true });
        else if (this.state.isScroll && window.innerWidth > 1200) this.setState({ isScroll: null });
    };

    handleFilter = (pagination, filters, sorter) => {
        this.setState({
            filteredInfo: filters,
            sortedInfo: sorter,
        });
    };

    getComponentByPath = path => {
        const {
            user,
            flag,
            router,
            publicReducer: { requestError },
            height: heightProps,
        } = this.props;
        const { routeData } = router;
        const routePathData = router.currentActionTab.split("_")[0];
        const currentData = routeData[routePathData];
        const tasks = currentData ? currentData.tasks : null;

        const height = heightProps - 250;

        if (path === "mainModule__table") {
            return (
                <Scrollbars>
                    <table key={uuid()}>
                        <thead>
                            <tr>
                                <td>Статус</td>
                                <td>Сотрудник</td>
                                <td>Отдел</td>
                                <td>Должность</td>
                                <td></td>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData &&
                            ((currentData.users.length && currentData.load && !requestError) ||
                                (currentData.users.length && !currentData.load && requestError) ||
                                (currentData.mode && currentData.mode === "offlineLoading")) ? (
                                this.getRowsTable(currentData.users)
                            ) : (currentData && currentData.load) ||
                              (currentData && !currentData.load && requestError) ? (
                                <tr>
                                    <td colSpan="5">
                                        <Empty description={<span>Данных нету</span>} className="emptyTable" />
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan="5">
                                        <Loader classNameSpiner="tableLoader" className="wrapperLoaderTable" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot></tfoot>
                    </table>
                </Scrollbars>
            );
        } else if (path === "searchTable") {
            const columns = [
                {
                    title: "Статус",
                    className: "status",
                    dataIndex: "status",
                    sorter: (a, b) => a.status.length - b.status.length,
                    key: "status",
                    render: (text, row, index) => {
                        let className = "";
                        if (text === "В работе") className = "active";
                        else if (text === "Открыт") className = "";
                        else if (text === "Закрыт") className = "close";
                        else if (text === "Выполнен") className = "done";
                        else className = "";

                        return (
                            <Output className={className} key={uuid()}>
                                {text}
                            </Output>
                        );
                    },
                    ...this.getColumnSearchProps("status"),
                },
                {
                    title: "Наименование",
                    className: "name",
                    dataIndex: "name",
                    key: "name",
                    render: (text, row, index) => {
                        return <Output key={uuid()}>{text}</Output>;
                    },
                    onFilter: (value, record) => record.name.includes(value),
                    sorter: (a, b) => a.name.length - b.name.length,
                    sortDirections: ["descend", "ascend"],
                    ...this.getColumnSearchProps("name"),
                },
                {
                    title: "Приоритет",
                    className: "priority",
                    dataIndex: "priority",
                    key: "priority",
                    render: (text, row, index) => {
                        return <Output key={uuid()}>{text}</Output>;
                    },
                    sorter: (a, b) => a.priority.length - b.priority.length,
                    sortDirections: ["descend", "ascend"],
                    ...this.getColumnSearchProps("priority"),
                },
                {
                    title: "Автор",
                    className: "author",
                    dataIndex: "author",
                    key: "author",
                    sorter: (a, b) => a.author.length - b.author.length,
                    sortDirections: ["descend", "ascend"],
                    render: (text, row, index) => {
                        return <Output key={uuid()}>{text}</Output>;
                    },
                    ...this.getColumnSearchProps("author"),
                },
                {
                    title: "Исполнитель",
                    className: "editor",
                    dataIndex: "editor",
                    key: "editor",
                    sorter: (a, b) => (a.editor && b.editor ? a.editor[0].length - b.editor[0].length : null),
                    sortDirections: ["descend", "ascend"],
                    render: (text, row, index) => {
                        return <Output key={uuid()}>{text}</Output>;
                    },
                    ...this.getColumnSearchProps("editor"),
                },
                {
                    title: "Сроки",
                    className: "date",
                    dataIndex: "date",
                    key: "date",
                    sorter: (a, b) => (a.date && b.date ? a.date[0].length - b.date[0].length : null),
                    sortDirections: ["descend", "ascend"],
                    render: (text, row, index) => {
                        return <Output key={uuid()}> {text}</Output>;
                    },
                    ...this.getColumnSearchProps("date"),
                },
            ];
            let tasksCopy = null;
            if (tasks) tasksCopy = [...tasks];
            let data = tasksCopy;

            if (data)
                data =
                    flag && data.length
                        ? data
                              .map(it => {
                                  if (!_.isNull(it.editor) && it.editor.some(editor => editor === user)) return it;
                                  else return null;
                              })
                              .filter(Boolean)
                        : data;

            return (
                <Table
                    pagination={{ pageSize: 14 }}
                    size="medium"
                    scroll={{ y: height }}
                    onChange={this.handleFilter}
                    columns={columns}
                    dataSource={data}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: event => {
                                const {
                                    onOpenPageWithData,
                                    router: { currentActionTab, actionTabs },
                                } = this.props;
                                const page = `${currentActionTab}__${record.key}`;
                                const isFind = actionTabs.findIndex(tab => tab === page) !== -1;
                                if (!isFind)
                                    onOpenPageWithData({
                                        activePage: page,
                                        routeDataActive: record,
                                    });
                            }, // click row
                        };
                    }}
                />
            );
        } else return null;
    };

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
            return (
                <div style={{ padding: 8 }}>
                    <Input
                        ref={node => {
                            this.searchInput = node;
                        }}
                        placeholder={`Поиск по ${dataIndex}`}
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
                        style={{ width: 188, marginBottom: 8, display: "block" }}
                    />
                    <Button
                        type="primary"
                        onClick={() => this.handleSearch(selectedKeys, confirm)}
                        icon="search"
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        Искать
                    </Button>
                    <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Сброс
                    </Button>
                </div>
            );
        },
        filterIcon: filtered => <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />,
        onFilter: (value, record) => {
            const filterText = record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase());
            return filterText;
        },
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
        render: text => {
            const isDateString = _.isArray(text) && moment(text[0], "DD.MM.YYYY")._isValid;
            const className =
                text === "В работе"
                    ? "active"
                    : text === "Открыт"
                    ? ""
                    : text === "Закрыт"
                    ? "close"
                    : text === "Выполнен"
                    ? "done"
                    : null;

            if (this.state.searchText)
                return (
                    <Output className={className} key={uuid()}>
                        <Highlighter
                            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                            searchWords={[this.state.searchText]}
                            autoEscape
                            textToHighlight={typeof text === "string" && text ? text : text ? text.toString() : null}
                        />
                    </Output>
                );
            else
                return (
                    <Output className={className} key={uuid()}>
                        {_.isArray(text) ? (!isDateString ? text.join(" , ") : text.join(" - ")) : text}
                    </Output>
                );
        },
    });

    handleSearch = (selectedKeys, confirm) => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: "" });
    };

    getRowsTable = arrayData => {
        return arrayData.map(it => {
            return (
                <tr className="contentTr" key={uuid()}>
                    <Output key={uuid()} type="table" className="status">
                        {it.status}
                    </Output>
                    <Output key={uuid()} type="table" className="nameSurname">{`${it.name} ${it.surname}`}</Output>
                    <Output key={uuid()} type="table" className="departament">
                        {it.departament}
                    </Output>
                    <Output key={uuid()} type="table" className="departament">
                        {it.position}
                    </Output>
                    {it.email ? (
                        <td>
                            <Icon type="mail" />
                        </td>
                    ) : null}
                </tr>
            );
        });
    };
    render() {
        const { path } = this.props;
        const component = this.getComponentByPath(path);
        return component;
    }
}

const mapStateToProps = state => {
    return {
        router: state.router,
        publicReducer: state.publicReducer,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onOpenPageWithData: data => dispatch(openPageWithDataAction(data)),
        onLoadCurrentData: ({ path, storeLoad }) => dispatch(loadCurrentData({ path, storeLoad })),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(TableView);
