import React from 'react';
import { Icon } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
class TableView extends React.Component {

    getRowsTable = arrayData => {
        return arrayData.map(it => {
            return (
                <tr>
                <td>
                    <span className = 'status online'>{it.status}</span>
                </td>
                <td>
                    {it.name}
                </td>
                <td>
                   {it.onlineCounter}
                </td>
                <td>
                  {it.mail ? <Icon type="mail" /> : null}
                </td>
            </tr>
            )
        });
    };
    render(){
        return (
            <Scrollbars>
                <table>
                    <thead>
                        <tr>
                            <td>Статус</td>
                            <td>Сотрудник</td>
                            <td>На работе онлайн</td>
                            <td></td>
                        </tr>
                    </thead>
                    {this.getRowsTable(
                        [
                        {name: 'Гена', status: 'online', onlineCounter: '3h', mail: true },
                        {name: 'Гена', status: 'online', onlineCounter: '3h', mail: true },
                        {name: 'Гена', status: 'online', onlineCounter: '3h', mail: true },
                        {name: 'Гена', status: 'online', onlineCounter: '3h', mail: true },
                        {name: 'Гена', status: 'online', onlineCounter: '3h', mail: true },
                        {name: 'Гена', status: 'online', onlineCounter: '3h', mail: true },
                        {name: 'Гена', status: 'online', onlineCounter: '3h', mail: true },
                        {name: 'Гена', status: 'online', onlineCounter: '3h', mail: true },
                        {name: 'Гена', status: 'online', onlineCounter: '3h', mail: true },
                        {name: 'Гена', status: 'online', onlineCounter: '3h' },
                        {name: 'Гена', status: 'online', onlineCounter: '3h' },
                        {name: 'Гена', status: 'online', onlineCounter: '3h' },
                        {name: 'Гена', status: 'online', onlineCounter: '3h' },
                    ])}
                </table>
            </Scrollbars>
        )
    }
};
export default TableView;