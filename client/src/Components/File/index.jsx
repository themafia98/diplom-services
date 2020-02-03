import React from "react";
import uuid from 'uuid/v4';
import { Upload, Icon, message } from "antd";
import Request from "../../Models/Rest";
const { Dragger } = Upload;

const File = ({ moduleData = {}, module = "", rest = {} }) => {

    const props = {
        name: `${uuid()}__${moduleData["_id"]}`,
        multiple: true,
        withCredentials: true,
        headers: rest.getHeaders(),
        action: `${rest.getApi()}/${module}/file`,
        onChange(info) {
            debugger;
            const { status } = info.file;
            if (status !== "uploading") {
                console.log(info.file, info.fileList);
            }
            if (status === "done") {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === "error") {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    return (
        <div className="file">
            <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">Нажмите или перетащите файл в эту область, чтобы загрузить</p>
                <p className="ant-upload-hint">Поддержка разовой или массовой загрузки.</p>
            </Dragger>
        </div>
    );
};
export default File;
