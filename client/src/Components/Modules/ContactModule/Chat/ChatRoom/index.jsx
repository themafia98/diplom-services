import React, { useState } from "react";
import { Button } from "antd";
import Textarea from "../../../../Textarea";

const ChatRoom = ({ onSend = null, listdata = [], roomToken = "" }) => {
    const [token] = useState(roomToken);

    const renderChat = listdata => {
        debugger;
        return listdata.map(it => (
            <div key={it.id} className="message">
                {it.msg}
            </div>
        ));
    };

    return (
        <div key={token} className="chatRoom">
            <div className="chatWindow">{renderChat(listdata)}</div>
            <Textarea className="chat-area" />
            <Button onClick={onSend} type="primary">
                Отправить
            </Button>
        </div>
    );
};

export default ChatRoom;
