import React from "react";
import TitleModule from "../../../../TitleModule";
import EditorTextarea from "../../../../Textarea/EditorTextarea";
class CreateNews extends React.PureComponent {
    state = {
        editorValue: null
    };
    setEditorValue = event => {
        this.setState({
            editorValue: event
        });
    };
    save = event => {};
    render() {
        const { editorValue = null } = this.state;
        return (
            <div className="createNews">
                <TitleModule classNameTitle="createNewsTittle" title="Создание новой новости" />
                <div className="createNews__main">
                    <EditorTextarea mode="createNewsEdit" defaultValue="Новая новость" />
                </div>
            </div>
        );
    }
}

export default CreateNews;
