import React from "react";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { markdownToDraft } from "markdown-draft-js";
import draftToMarkdown from "draftjs-to-markdown";

import "../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

class EditorTextarea extends React.Component {
    state = {
        editorState: EditorState.createWithContent(ContentState.createFromText(this.props.defaultValue))
    };

    componentDidUpdate = () => {
        const { contentState, editorState } = this.state;
        if (editorState) {
            const rawContentState = convertToRaw(editorState.getCurrentContent());
            const markup = draftToMarkdown(rawContentState);
            console.log(markup);
        }
    };

    onEditorStateChange = editorState => {
        const { onChange } = this.props;

        const rawContentState = convertToRaw(editorState.getCurrentContent());
        const markup = draftToMarkdown(rawContentState);
        onChange({ currentTarget: { value: markup } });
        this.setState({
            editorState: editorState
        });
    };

    render() {
        const { editorState } = this.state;
        return (
            <Editor
                wrapperClassName="editor-wrapper"
                editorClassName="editor"
                onEditorStateChange={this.onEditorStateChange}
            />
        );
    }
}

export default EditorTextarea;
