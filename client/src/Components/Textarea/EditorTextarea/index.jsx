import React from "react";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { getEditorJSON } from "../../../Utils/schema";
import "../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Button } from "antd";

class EditorTextarea extends React.Component {
    state = {
        contentState: null
    };

    componentDidMount = () => {
        const { mode = "", contentEditor: contentProps = null } = this.props;
        const { contentState } = this.state;
        if (mode === "createNewsEdit" && contentState) {
            this.setState({
                contentState: convertFromRaw(contentProps ? contentProps : getEditorJSON())
            });
        }
    };

    onContentStateChange = contentState => {
        this.setState({
            contentState: contentState
        });
    };

    render() {
        const { readOnly = false } = this.state;
        const { mode = "" } = this.props;

        return (
            <React.Fragment>
                <Editor
                    readOnly={readOnly}
                    localization={{ locale: "ru" }}
                    wrapperClassName="editor-wrapper"
                    editorClassName="editor"
                    onContentStateChange={this.onContentStateChange}
                />
                {mode === "createNewsEdit" ? (
                    <Button className="createNews-button" type="primary">
                        Опубликовать
                    </Button>
                ) : null}
            </React.Fragment>
        );
    }
}

export default EditorTextarea;
