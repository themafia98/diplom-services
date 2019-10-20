import React from "react";
import { Avatar, Tooltip } from "antd";
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
        Hello world!!! 
        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
        My name Pavel Petrovich and I'm Frontend developer. I looking for job.`;
        return (
            <Scrollbars autoHeight autoHeightMin={0} autoHeightMax={"70vh"}>
                <div className={["streamBox", boxClassName ? boxClassName : null].join(" ")}>
                    <div className={["cardStream", mode ? mode : null].join(" ")}>
                        <p className="name">Pavel Petrovich</p>
                        <Avatar shape="square" size="large" icon="user" />
                        <Tooltip placement="topLeft" title={value}>
                            <p className="card_message">{value}</p>
                        </Tooltip>
                    </div>
                    <div className={["cardStream", mode ? mode : null].join(" ")}>
                        <p className="name">Pavel Petrovich</p>
                        <Avatar shape="square" size="large" icon="user" />
                        <Tooltip placement="topLeft" title={value}>
                            <p className="card_message">{value}</p>
                        </Tooltip>
                    </div>
                    <div className={["cardStream", mode ? mode : null].join(" ")}>
                        <p className="name">Pavel Petrovich</p>
                        <Avatar shape="square" size="large" icon="user" />
                        <Tooltip placement="topLeft" title={value}>
                            <p className="card_message">{value}</p>
                        </Tooltip>
                    </div>
                    <div className={["cardStream", mode ? mode : null].join(" ")}>
                        <p className="name">Pavel Petrovich</p>
                        <Avatar shape="square" size="large" icon="user" />
                        <Tooltip placement="topLeft" title={value}>
                            <p className="card_message">{value}</p>
                        </Tooltip>
                    </div>
                </div>
            </Scrollbars>
        );
    }
}

export default StreamBox;
