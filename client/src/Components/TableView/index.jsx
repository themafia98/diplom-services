import React from 'react';
import { Icon, Empty } from 'antd';
import Loader from '../Loader';
import Scrollbars from 'react-custom-scrollbars';
import uuid from 'uuid/v4';

import Output from '../Output'; 

class TableView extends React.Component {

    state = {
        users: [],
        load: false,
    }

    getRowsTable = arrayData => {
        return arrayData.map(it => {
            return (
            <tr className = 'contentTr' key = {uuid()}>
                    <Output key = {uuid()} type = 'table' className = 'status'>{it.status}</Output>
                    <Output key = {uuid()} type = 'table' className = 'nameSurname'>{`${it.name} ${it.surname}`}</Output>
                    <Output key = {uuid()} type = 'table' className = 'departament'>{it.departament}</Output>
                    <Output key = {uuid()} type = 'table' className = 'departament'>{it.position}</Output>
                  {it.email ? <td><Icon type="mail" /></td> : null}
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

        return (
            <Scrollbars>
                <table key = {uuid()}>
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
                        <tr>
                            {users.length && load ? this.getRowsTable(users) : load ? 
                                <td colSpan = '5'><Empty className = 'emptyTable' /></td> :
                                <td colSpan = '5'><Loader classNameSpiner = 'tableLoader' className = 'wrapperLoaderTable' /></td>
                            }
                        </tr>
                    </tbody>
                    <tfoot></tfoot>
                </table>
            </Scrollbars>
        )
    }
};
export default TableView;