import React from 'react';
import { connect } from 'react-redux';

class UserPanel extends React.Component {
    render(){
        return (
            <div className = 'userPanel'>
                <h1>User panel</h1>
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

export default connect(mapStateToProps, mapDispatchToProps)(UserPanel);