import React from "react";
import moment from "moment";
import { Input, Button } from "antd";

const { TextArea } = Input;

class Comments extends React.Component {
    render() {
        return (
            <div className="comments">
                <div className="commnetsListBox">
                    <p>
                        <span className="aboutCommentSender">
                            <span className="timeComment">&nbsp;{moment().format("L")}.</span>
                            &nbsp;<span className="sender_name">Павел Петрович</span> написал:
                        </span>
                        <span className="commentContet">
                            Super Task Super Task Super Task Super Task Super Task Super Task Super Task Super Task
                            Super Task Super Task
                        </span>
                    </p>
                </div>
                <div className="comments__controllers">
                    <TextArea rows={4} />
                    <Button className="sendCommentsButton" type="primary">
                        Опубликовать
                    </Button>
                </div>
            </div>
        );
    }
}
export default Comments;
