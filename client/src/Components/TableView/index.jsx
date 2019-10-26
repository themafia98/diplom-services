import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import $ from "jquery";
import { Icon, Empty, Table, Input, Button } from "antd";
import Loader from "../Loader";
import Scrollbars from "react-custom-scrollbars";
import uuid from "uuid/v4";
import moment from "moment";
import Highlighter from "react-highlight-words";
import Output from "../Output";

import { openPageWithDataAction } from "../../Redux/actions/routerActions";

class TableView extends React.Component {
    state = {
        searchText: null,
        sortedInfo: null,
        users: [],
        load: false,
        isScroll: null,
    };

    componentDidMount = () => {
        const { firebase: { db = null } = {}, path } = this.props;
        if (path === "mainModule__table") {
            db.collection("users")
                .get()
                .then(function(querySnapshot) {
                    const users = [];
                    querySnapshot.forEach(function(doc) {
                        users.push(doc.data());
                    });
                    return users;
                })
                .then(users => {
                    this.setState({ users: users, load: true });
                });
        }

        $(window).on("resize", this.setSizeWindow);
    };

    componentWillUnmount = () => {
        $(window).off("resize", this.setSizeWindow);
    };

    setSizeWindow = event => {
        if (window.innerWidth <= 1200 && _.isNull(this.state.isScroll)) this.setState({ isScroll: true });
        else if (this.state.isScroll && window.innerWidth > 1200) this.setState({ isScroll: null });
    };

    handleFilter = (pagination, filters, sorter) => {
        this.setState({
            filteredInfo: filters,
            sortedInfo: sorter,
        });
    };

    getComponentByPath = path => {
        const { users, load } = this.state;
        const { user, flag } = this.props;

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
                            {users.length && load ? (
                                this.getRowsTable(users)
                            ) : load ? (
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
                    title: "Автор задачи",
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
                    sorter: (a, b) => a.editor.length - b.editor.length,
                    sortDirections: ["descend", "ascend"],
                    render: (text, row, index) => {
                        return <Output key={uuid()}>{text}</Output>;
                    },
                    ...this.getColumnSearchProps("editor"),
                },
                {
                    title: "Дата создания",
                    className: "date",
                    dataIndex: "date",
                    key: "date",
                    sorter: (a, b) => a.date.length - b.date.length,
                    sortDirections: ["descend", "ascend"],
                    render: (text, row, index) => {
                        return <Output key={uuid()}> {text}</Output>;
                    },
                    ...this.getColumnSearchProps("date"),
                },
            ];

            let data = [];

            for (let i = 1; i <= 50; i++) {
                data.push({
                    key: uuid(),
                    status: i % 3 === 0 ? "В работе" : i % 2 === 0 ? "Закрыт" : i > 20 ? "Выполнен" : "Открыт",
                    name: "Исправление багов " + i,
                    priority: "Средний",
                    author: "Павел Петрович",
                    editor: "Гена Букин",
                    date: moment().format("L"),
                });
            }

            data.push({
                key: uuid(),
                status: "Закрыт",
                name: "Исправление багов " + 52,
                priority: "Средний",
                author: "Вася Василевский",
                editor: "Павел Петрович",
                date: moment().format("L"),
            });

            data =
                flag && data.length
                    ? data
                          .map(it => {
                              if (it.editor === user) return it;
                              else return null;
                          })
                          .filter(Boolean)
                    : data;

            return (
                <Table
                    scroll={{ x: this.state.isScroll }}
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
                            textToHighlight={text.toString()}
                        />
                    </Output>
                );
            else
                return (
                    <Output className={className} key={uuid()}>
                        {text.toString()}
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
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onOpenPageWithData: data => dispatch(openPageWithDataAction(data)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(TableView);
