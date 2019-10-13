import React from 'react';
import { connect } from 'react-redux';

class LoginPage extends React.Component {
    render(){
        return (
            <div className = 'loginPage'>
                <h1>Login page</h1>
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = (dispatch, props) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);