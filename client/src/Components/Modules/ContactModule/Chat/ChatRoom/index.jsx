import React, { useState, useRef, useEffect } from "react";
import { Element, scroller } from "react-scroll";
import _ from "lodash";
import { Button, Avatar } from "antd";

import Textarea from "../../../../Textarea";
import Message from "./Message";
import moment from "moment";

const ChatRoom = ({ onSend = null, messages: msgProps = [], tokenRoom = "", onKeyDown = null, pushMessage = null }) => {
    const [token] = useState(tokenRoom);
    const [showTooltip, setStateTooltip] = useState(false);
    const [showTooltipID, setIdTooltip] = useState(null);
    const [msg, setMsg] = useState("");
    const [messages, setMessages] = useState(msgProps);

    const refWrapper = useRef(null);

    const redirectUserProfile = (event, link) => {
        console.log(link);
    };

    const onMouseEnter = (event, id) => {
        if (!showTooltip) {
            setStateTooltip(true);
            setIdTooltip(id);
        }
    };

    const resetScrollEffect = () => {
        if (refWrapper.current) {
            scroller.scrollTo("lastElement", {
                containerId: "containerChat",
                smooth: true
            });
        }
    };

    useEffect(() => {
        if (messages.length !== msgProps.length) {
            setMessages([...msgProps]);
            resetScrollEffect();
        }
    });

    const onChange = event => {
        const { currentTarget: { value = "" } = {} } = event;
        if (value !== msg) setMsg(value);
    };

    const onMouseLeave = (event, id) => {
        if (showTooltip) {
            setStateTooltip(false);
            setIdTooltip(null);
        }
    };

    const _onSubmit = (event, msgValue = null) => {
        if (_.isNull(msgValue)) {
            if ((event.which || event.keyCode) && (event.which || event.keyCode) !== 13) return;
            if ((event.which || event.keyCode) && (event.which || event.keyCode) === 13) {
                event.preventDefault();
            }
            onKeyDown(event, msgValue ? msgValue : msg);
            resetScrollEffect();
            setMsg("");
        } else if (event && !_.isNull(msgValue)) {
            pushMessage(event, msgValue);
            resetScrollEffect();
            setMsg("");
        }
    };

    const renderChat = messages => {
        return messages.map((it, i) => {
            const item = (
                <div ref={refWrapper} key={`${i}${it.tokenRoom}${it.msg}`} className={[i, "message"].join(" ")}>
                    <Message it={it.msg} key={`${it.msg}_message${it.tokenRoom}`}>
                        <React.Fragment>
                            {
                                it.displayName !== "System" ? (

                                    <span
                                        onClick={event => redirectUserProfile(event, null)}
                                        className="msg_author">
                                        {it.displayName}
                                        <Avatar size="small" />
                                    </span>
                                ) : (
                                        <p className="admin_wrapper">{it.displayName}</p>
                                    )}

                            {it.displayName !== "System" ?
                                <span className="msg_date">{moment().format("DD.MM.YYYY HH:mm")}.</span>
                                : null
                            }
                            <p className="wrapper_msg">{it.msg}</p>
                        </React.Fragment>
                    </Message>
                </div >
            );

            if (i === msgProps.length - 1) {
                return (
                    <Element key={Math.random()} name="lastElement">
                        {item}
                    </Element>
                );
            } else return item;
        });
    };

    return (
        <div key={token} className="chatRoom">
            <div className="chatWindow">
                <div id="containerChat">{renderChat(messages)}</div>
            </div>
            <Textarea value={msg} onChange={onChange} onKeyDown={e => _onSubmit(e)} className="chat-area" />
            <Button onClick={e => _onSubmit(e, msg)} type="primary">
                Отправить
            </Button>
        </div>
    );
};

export default ChatRoom;
