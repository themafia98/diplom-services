import React from "react";
import Scrollbars from "react-custom-scrollbars";
import _ from "lodash";
import uuid from "uuid/v4";
import moment from "moment";
import { Input, Button, Empty, message, notification } from "antd";

import Comment from "./Comment";

const { TextArea } = Input;

class Comments extends React.PureComponent {
    state = {
        onUpdateDisabled: false,
        value: null,
    };

    addCommentsDelay = _.debounce(event => {
        const { value = "" } = this.state;
        const { onUpdate, data: { key = "", comments = [] } = {}, data = {} } = this.props;
        if (!value) return message.error("Вы ничего не ввели.");
        else if (key && Array.isArray(comments) && !_.isEmpty(data)) {
            const comment = {
                id: uuid(),
                time: moment().format("DD.MM.YYYY HH:mm"),
                username: "Павел Петрович",
                message: value,
            };
            this.setState({ ...this.state, onUpdateDisabled: true, value: null });
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

    onDelete = (event, keyItem) => {
        const { onUpdate, data: { key = "", comments = [] } = {}, data = {} } = this.props;
        onUpdate(key, "DELETE", comments, "comments", { id: keyItem, data: { ...data } }, "tasks")
            .then(() => message.success("Коментарий удален."))
            .catch(error => {
                message.error("Не удалось удалить коментарий.");
            });
    };

    onChange = event => {
        const { target: { value = "" } = {} } = event;
        this.setState({
            ...this.state,
            value: value,
        });
    };

    renderComments(commentsArray) {
        const { rules } = this.props;
        if (commentsArray.length && Array.isArray(commentsArray))
            return commentsArray.map(it => <Comment key={it.id} rules={rules} it={it} onDelete={this.onDelete} />);
        else return <Empty />;
    }
    render() {
        const { data: { comments = [] } = {} } = this.props;
        const { onUpdateDisabled, value } = this.state;

        return (
            <div className="comments">
                <div className="commnetsListBox">
                    <Scrollbars>{this.renderComments(comments)}</Scrollbars>
                </div>
                <div className="comments__controllers">
                    <TextArea value={value} onChange={this.onChange} rows={4} />
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
