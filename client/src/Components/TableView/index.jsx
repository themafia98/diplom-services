import React from "react";
import _ from "lodash";
import $ from "jquery";
import { Icon, Empty, Table, Input, Button } from "antd";
import Loader from "../Loader";
import Scrollbars from "react-custom-scrollbars";
import uuid from "uuid/v4";
import moment from "moment";
import Highlighter from "react-highlight-words";
import Output from "../Output";

// const { Search } = Input;

class TableView extends React.Component {
    state = {
        searchText: null,
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
                                        <Empty className="emptyTable" />
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
                    ...this.getColumnSearchProps("priority"),
                },
                ,
                {
                    title: "Автор задачи",
                    className: "author",
                    dataIndex: "author",
                    key: "author",
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
                    render: (text, row, index) => {
                        return <Output key={uuid()}>{text}</Output>;
                    },
                    ...this.getColumnSearchProps("editor"),
                },
                ,
                {
                    title: "Дата создания",
                    className: "date",
                    dataIndex: "date",
                    key: "date",
                    render: (text, row, index) => {
                        return <Output key={uuid()}> {text}</Output>;
                    },
                    ...this.getColumnSearchProps("date"),
                },
            ];

            let data = [];

            for (let i = 1; i <= 30; i++) {
                data.push({
                    key: i,
                    status: i % 3 === 0 ? "В работе" : i % 2 === 0 ? "Закрыт" : i > 20 ? "Выполнен" : "Открыт",
                    name: "Исправление багов " + i,
                    priority: "Средний",
                    author: "Павел Петрович",
                    editor: "Гена Букин",
                    date: moment().format("L"),
                });
            }

            data.push({
                key: 32,
                status: "Закрыт",
                name: "Исправление багов " + 32,
                priority: "Средний",
                author: "Вася Василевский",
                editor: "Павел Петрович",
                date: moment().format("L"),
            });

            data = flag
                ? data
                      .map(it => {
                          if (it.editor === user) return it;
                          else return null;
                      })
                      .filter(Boolean)
                : data;
            return <Table scroll={{ x: this.state.isScroll }} columns={columns} dataSource={data} />;
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
export default TableView;