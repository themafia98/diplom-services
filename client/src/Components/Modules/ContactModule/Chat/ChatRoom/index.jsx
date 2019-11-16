import React, { useState, useRef, useEffect } from "react";
import { animateScroll as scroll, Element, scroller } from "react-scroll";
import _ from "lodash";
import { Button, Avatar } from "antd";

import Textarea from "../../../../Textarea";
import Message from "./Message";

const ChatRoom = ({ onSend = null, listdata = [], roomToken = "", onKeyDown = null, pushMessage = null }) => {
    const [token] = useState(roomToken);
    const [showTooltip, setStateTooltip] = useState(false);
    const [showTooltipID, setIdTooltip] = useState(null);
    const [msg, setMsg] = useState("");

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

    const renderChat = listdata => {
        return listdata.map((it, i) => {
            const item = (
                <div ref={refWrapper} key={it.id + i} className={[i, "message"].join(" ")}>
                    <Message showTooltip={showTooltip && showTooltipID === it.id} it={it} key={`${it.id}_message`}>
                        <span
                            onMouseLeave={e => onMouseLeave(e, it.id)}
                            onMouseEnter={e => onMouseEnter(e, it.id)}
                            onClick={event => redirectUserProfile(event, it.link)}
                            className="msg_author"
                        >
                            <Avatar size="small" /> {it.name}.
                        </span>
                        <span className="msg_date">{it.date.format("DD.MM.YYYY HH:mm:ss")}.</span>
                        <p className="wrapper_msg">{it.msg}</p>
                    </Message>
                </div>
            );

            if (i === listdata.length - 1) {
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
                <div id="containerChat">{renderChat(listdata)}</div>
            </div>
            <Textarea value={msg} onChange={onChange} onKeyDown={e => _onSubmit(e)} className="chat-area" />
            <Button onClick={e => _onSubmit(e, msg)} type="primary">
                Отправить
            </Button>
        </div>
    );
};

export default ChatRoom;
