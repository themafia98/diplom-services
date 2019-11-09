import React from "react";
import { Upload, Icon, message } from "antd";
const { Dragger } = Upload;

const File = () => {
    const props = {
        name: "file",
        multiple: true,
        action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
        onChange(info) {
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
