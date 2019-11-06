import React from "react";
import { Upload, Button, Icon, message } from "antd";
const { Dragger } = Upload;
class File extends React.PureComponent {
    render() {
        // const props = {
        //     action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
        //     onChange({ file, fileList }) {
        //         if (file.status !== "uploading") {
        //         }
        //     },
        //     defaultFileList: [
        //         {
        //             uid: "1",
        //             name: "xxx.png",
        //             status: "done",
        //             response: "Server Error 500", // custom error message to show
        //             url: "http://www.baidu.com/xxx.png",
        //         },
        //         {
        //             uid: "2",
        //             name: "yyy.png",
        //             status: "done",
        //             url: "http://www.baidu.com/yyy.png",
        //         },
        //         // {
        //         //     uid: "3",
        //         //     name: "zzz.png",
        //         //     status: "error",
        //         //     response: "Server Error 500", // custom error message to show
        //         //     url: "http://www.baidu.com/zzz.png",
        //         // },
        //     ],
        // };

        // return (
        //     <div className="file">
        //         <Upload {...props}>
        //             <Button>
        //                 <Icon type="upload" /> Upload
        //             </Button>
        //         </Upload>
        //     </div>
        // );

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
    }
}
export default File;
