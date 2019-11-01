import React from "react";
import Clock from "react-clock";

class ClockWidjet extends React.Component {
    state = {
        date: new Date(),
    };

    componentDidMount() {
        setInterval(() => this.setState({ date: new Date() }), 1000);
    }
    render() {
        return (
            <div className="clockWrapper">
                <Clock value={this.state.date} />
            </div>
        );
    }
}
export default ClockWidjet;
