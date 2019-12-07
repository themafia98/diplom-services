import React from "react";
import TitleModule from "../../../../TitleModule";
import EditorTextarea from "../../../../Textarea/EditorTextarea";
import { message, notification } from "antd";
class CreateNews extends React.PureComponent {
    state = {
        clear: false
    };
    setEditorValue = event => {
        this.setState({
            editorValue: event
        });
    };

    clearStatus = event => {
        const { clear } = this.state;
        if (clear)
            this.setState({
                clear: false
            });
    };
    onPublish = contentState => {
        const { firebase = null, statusApp = "" } = this.props;
        if (!contentState) {
            return message.error("Ничего не найдено");
        }

        if (statusApp === "online") {
            firebase.db
                .collection("news")
                .doc()
                .get()
                .then(res => {
                    firebase.db
                        .collection("news")
                        .doc()
                        .set({ _id: "test", ...contentState })
                        .then(() =>
                            this.setState({ ...this.state, clear: true }, () => message.success(`Новость создана.`))
                        );
                })
                .catch(error => console.error(error));
        } else return notification.error({ message: "Ошибка сети", description: "Интернет соединение отсутствует" });
    };
    render() {
        const { clear = false } = this.state;
        return (
            <div className="createNews">
                <TitleModule classNameTitle="createNewsTitle" title="Создание новой новости" />
                <div className="createNews__main">
                    <EditorTextarea
                        clearStatus={this.clearStatus}
                        clear={clear}
                        onPublish={this.onPublish}
                        mode="createNewsEdit"
                        defaultValue="Новая новость"
                    />
                </div>
            </div>
        );
    }
}

export default CreateNews;
