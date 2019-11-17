import React from "react";
import { Editor } from "react-draft-wysiwyg";
import "../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

class EditorTextarea extends React.Component {
    render() {
        return <Editor />;
    }
}

export default EditorTextarea;
