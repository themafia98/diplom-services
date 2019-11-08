import React from "react";
import Scrollbars from "react-custom-scrollbars";
import _ from "lodash";
import uuid from "uuid/v4";
import moment from "moment";
import { Input, Button, Empty, message, notification } from "antd";

const { TextArea } = Input;

class Comments extends React.PureComponent {
    state = {
        onUpdateDisabled: false,
    };

    addCommentsDelay = _.debounce(event => {
        const { clearableInput: { props: { value = "" } = {} } = {} } = this.refContent || {};
        const { onUpdate, data: { key = "", comments = [] } = {}, data = {} } = this.props;
        if (!value) return message.error("Вы ничего не ввели.");
        else if (key && Array.isArray(comments) && !_.isEmpty(data)) {
            const comment = {
                id: uuid(),
                time: moment().format("DD.MM.YYYY HH:mm"),
                username: "Павел Петрович",
                message: value,
            };
            this.setState({ ...this.state, onUpdateDisabled: true });
            onUpdate(key, "UPDATE", [...comments, comment], "comments", { ...data }, "tasks").then(() => {
                message.success("Коментарий добавлен.");
                return this.setState({
                    ...this.state,
                    onUpdateDisabled: false,
                });
            });
        } else return notification.error({ message: "Ошибка", description: "Некоректные данные." });
    }, 500);

    addComments = event => {
        this.addCommentsDelay(event);
    };

    refContent = null;
    refContentFunc = node => (this.refContent = node);

    renderComments(commentsArray) {
        if (commentsArray.length && Array.isArray(commentsArray))
            return commentsArray.map(it => (
                <p key={it.id ? it.id : Math.random()}>
                    <span className="aboutCommentSender">
                        <span className="timeComment">&nbsp;{moment(it.time).format("DD.MM.YYYY HH:mm")}.</span>
                        &nbsp;<span className="sender_name">{`${it.username}`}</span> написал:
                    </span>
                    <span className="commentContet">{it.message}</span>
                </p>
            ));
        else return <Empty />;
    }
    render() {
        const { data: { comments = [] } = {} } = this.props;
        const { onUpdateDisabled } = this.state;

        return (
            <div className="comments">
                <div className="commnetsListBox">
                    <Scrollbars>{this.renderComments(comments)}</Scrollbars>
                </div>
                <div className="comments__controllers">
                    <TextArea ref={this.refContentFunc} rows={4} />
                    <Button
                        onClick={this.addComments}
                        disabled={onUpdateDisabled}
                        loading={onUpdateDisabled}
                        className="sendCommentsButton"
                        type="primary"
                    >
                        Опубликовать
                    </Button>
                </div>
            </div>
        );
    }
}
export default Comments;
