import React, { useState } from "react";
import uuid from 'uuid/v4';
import { Upload, Icon, message } from "antd";
import Request from "../../Models/Rest";
const { Dragger } = Upload;


class File extends React.Component {

    state = {
        filesArray: null,
    }

    static getDerivedStateFromProps = (props, state) => {
        const isArray = Array.isArray(props.filesArray) && Array.isArray(state.filesArray);

        if (props.filesArray !== state.filesArray ||
            (isArray && state.filesArray.length !== props.filesArray.length)) {

            return {
                ...state,
                filesArray: [...props.filesArray]
            }
        }

        return state;
    };

    onChange = (info) => {
        const { status } = info.file;
        const { onAddFileList } = this.props;

        if (status === "uploading") {
            onAddFileList(info.fileList, status);
        }
        if (status === "done") {

            onAddFileList(info.fileList, status);
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === "error") {
            message.error(`${info.file.name} file upload failed.`);
        }
    }

    render() {
        const { moduleData: { _id = "" } = {}, rest, module = "" } = this.props;
        const props = {
            name: `${uuid()}__${_id}`,
            multiple: true,
            withCredentials: true,
            headers: rest.getHeaders(),
            fileList: this.state.filesArray,
            action: `${rest.getApi()}/${module}/file`,
        }

        console.log(this.state.filesArray);

        return (
            <div className="file">
                <Dragger beforeUpload={this.beforeUpload} onChange={this.onChange} {...props}>
                    <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">Нажмите или перетащите файл в эту область, чтобы загрузить</p>
                    <p className="ant-upload-hint">Поддержка разовой или массовой загрузки.</p>
                </Dragger>
            </div>
        );
    }
}

export default File;
