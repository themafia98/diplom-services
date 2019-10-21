import React from "react";
import { Avatar } from "antd";
import { Scrollbars } from "react-custom-scrollbars";
class StreamBox extends React.Component {
    render() {
        const { mode, boxClassName } = this.props;
        let value = `
        Hello world!!! 
        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
        Hello world!!! 
        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
        Hello world!!! 
        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
        Hello world!!!`;
        return (
            <Scrollbars style={mode ? { height: "500px" } : null}>
                <div className={["streamBox", boxClassName ? boxClassName : null].join(" ")}>
                    <div className={["cardStream", mode ? mode : null].join(" ")}>
                        <div className="about">
                            <Avatar size="64" icon="user" />
                            <p className="name">Pavel Petrovich</p>
                        </div>
                        <p className="card_message">{value}</p>
                    </div>
                    <div className={["cardStream", mode ? mode : null].join(" ")}>
                        <div className="about">
                            <Avatar size="64" icon="user" />
                            <p className="name">Pavel Petrovich</p>
                        </div>
                        <p className="card_message">{value}</p>
                    </div>
                    <div className={["cardStream", mode ? mode : null].join(" ")}>
                        <div className="about">
                            <Avatar size="64" icon="user" />
                            <p className="name">Pavel Petrovich</p>
                        </div>
                        <p className="card_message">{value}</p>
                    </div>
                    <div className={["cardStream", mode ? mode : null].join(" ")}>
                        <div className="about">
                            <Avatar size="64" icon="user" />
                            <p className="name">Pavel Petrovich</p>
                        </div>
                        <p className="card_message">{value}</p>
                    </div>
                </div>
            </Scrollbars>
        );
    }
}

export default StreamBox;
