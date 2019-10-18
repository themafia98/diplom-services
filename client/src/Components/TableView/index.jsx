import React from 'react';
import { Icon, Empty } from 'antd';
import Loader from '../Loader';
import Scrollbars from 'react-custom-scrollbars';
import uuid from 'uuid/v4';
class TableView extends React.Component {

    state = {
        users: [],
        load: false,
    }

    getRowsTable = arrayData => {
        return arrayData.map(it => {
            return (
                <tr key = {uuid()}>
                <td>
                    <span className = 'status online'>{it.ofline}</span>
                </td>
                <td>
                    {it.name}
                </td>
                <td>
                   {it.departament}
                </td>
                <td>
                  {it.main ? <Icon type="mail" /> : null}
                </td>
            </tr>
            )
        });
    };

    componentDidMount = () => {
        const { firebase: { db } } = this.props;
        db.collection("users").get().then(function(querySnapshot) {
            const users = [];
            querySnapshot.forEach(function(doc) {
                users.push(doc.data());
            });
            return users;
        })
        .then((users) => {
            this.setState({users: users, load: true});
        })
    }

    render(){

        const { users, load } = this.state;

        if (load)
        return (
            <Scrollbars>
                <table key = {uuid()}>
                    <thead>
                        <tr>
                            <td>Статус</td>
                            <td>Сотрудник</td>
                            <td>Отдел</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        {users ? this.getRowsTable(users) : null}
                    </tbody>
                    <tfoot></tfoot>
                </table>
                {users.length === 0 ? <Empty /> : null }
            </Scrollbars>
        )
        else return (
                <Loader classNameSpiner = 'tableLoader' className = 'wrapperLoaderTable' />
        );
    }
};
export default TableView;