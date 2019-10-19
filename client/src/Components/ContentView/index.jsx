import React from 'react';
import $ from "jquery";
import { Layout } from 'antd';

import MainModule from '../Modules/MainModule';
import CabinetModule from '../Modules/CabinetModule';


const { Content } = Layout;

class ContentView extends React.Component {

    state = {
        key: Math.random(),
    }

    getComponentByMode = mode => {
        const { firebase } = this.props;
        if (mode === 'mainModule') return <MainModule firebase = {firebase}  />;
        if (mode === 'cabinetModule') return <CabinetModule firebase ={firebase} />;
        else return <div>Not found module: ${mode}</div>
    }

    disableF5 = event => {
       if ((event.which || event.keyCode) === 116){
            event.preventDefault();
            return  this.setState({ key: Math.random() });
       }
    }

    componentDidMount = () => {
        $(document).on("keydown", this.disableF5);
    }

    componentWillUnmount = () => {
        $(document).off("keydown");
    }

    render(){
        const { mode } = this.props;
        const { key } = this.state;
        return (
            <Content  key = {key}>
                {this.getComponentByMode(mode)}
            </Content>
        );
    }
};

export default ContentView;