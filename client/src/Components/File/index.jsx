import React from "react";
import { Upload, Button, Icon } from "antd";

class File extends React.PureComponent {
    render() {
        const props = {
            action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
            onChange({ file, fileList }) {
                if (file.status !== "uploading") {
                }
            },
            defaultFileList: [
                {
                    uid: "1",
                    name: "xxx.png",
                    status: "done",
                    response: "Server Error 500", // custom error message to show
                    url: "http://www.baidu.com/xxx.png",
                },
                {
                    uid: "2",
                    name: "yyy.png",
                    status: "done",
                    url: "http://www.baidu.com/yyy.png",
                },
                // {
                //     uid: "3",
                //     name: "zzz.png",
                //     status: "error",
                //     response: "Server Error 500", // custom error message to show
                //     url: "http://www.baidu.com/zzz.png",
                // },
            ],
        };

        return (
            <div className="file">
                <Upload {...props}>
                    <Button>
                        <Icon type="upload" /> Upload
                    </Button>
                </Upload>
            </div>
        );
    }
}
export default File;
