import React from "react";
import PropTypes from "prop-types";
import { Modal, Upload, message, Icon, Button } from "antd";
import UserCard from "../../UserCard";
import TitleModule from "../../TitleModule";
import StreamBox from "../../StreamBox";
import modelContext from "../../../Models/context";
const { Dragger } = Upload;

class CabinetModule extends React.PureComponent {
    state = {
        imageUrl: null,
        loading: false,
        filesArray: [],
        disabled: false
    };

    static contextType = modelContext;

    static propTypes = {
        onErrorRequstAction: PropTypes.func.isRequired
    };

    showModal = event => {
        this.setState({ ...this.state, visible: true });
    };

    hideModal = event => {
        this.setState({ ...this.state, visible: false, imageUrl: null, loading: false, disabled: false });
    };

    beforeUpload = file => {
        const isJpgOrPng = file.type.startsWith("image/");
        if (!isJpgOrPng) {
            this.setState(state => ({ ...state, loading: !state.loading, disabled: false, error: true }));
            message.error("Вы можете загрузить только изображение.");
        }
        const isLt2M = file.size / 1024 / 1024 < 5;
        if (!isLt2M) {
            this.setState(state => ({ ...state, loading: !state.loading, disabled: false, error: true }));
            message.error("Изображение должно быть меньше 5 мб.");
        }
        return isJpgOrPng && isLt2M;
    };

    getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    setFile = imageUrl => {
        this.setState({
            imageUrl,
            loading: false
        });
    };

    reset = event => {
        this.setState({ ...this.state, imageUrl: null, loading: false, disabled: false });
    };

    onChangeFile = (info) => {
        const { status } = info.file;
        if (status !== "uploading") {
            debugger;
            this.setState({ disabled: false });
        }
        if (status === "done") {
            message.success(`${info.file.name} file uploaded successfully.`);
            debugger;
            this.getBase64(info.file.originFileObj, this.setFile.bind(this));
            this.setState({ disabled: true });
        } else if (status === "error") {
            this.setState({ disabled: false });
            message.error(`${info.file.name} file upload failed.`);
        }
    }

    render() {
        const { visible, imageUrl } = this.state;
        const { rest } = this.context;
        const { udata = {} } = this.props;
        const props = {
            name: "avatar",
            multiple: false,
            withCredentials: true,
            headers: rest ? rest.getHeaders() : null,
            action: rest ? `${rest.getApi()}/cabinet/validationAvatar` : null
        };

        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Upload</div>
            </div>
        );

        return (
            <div className="cabinetModule">
                <TitleModule additional="Профиль" classNameTitle="cabinetModuleTitle" title="Личный кабинет" />
                <div className="cabinetModule_main">
                    <div className="col-6">
                        <UserCard imageUrl={imageUrl} cdShowModal={this.showModal} />
                    </div>
                    <div className="col-6">
                        <p className="lastActivity">Последняя активность</p>
                        <StreamBox boxClassName="streamActivityCabinet" mode="activity" />
                    </div>
                </div>
                <Modal title="Сменить фото" visible={visible} onCancel={this.hideModal}>
                    <Dragger
                        beforeUpload={this.beforeUpload}
                        showUploadList={false}
                        listType="picture-card"
                        disabled={this.state.disabled}
                        onChange={this.onChangeFile}
                        accept="image/*"
                        {...props}
                    >
                        {imageUrl && !this.state.loading ? (
                            <img src={imageUrl} alt="avatar" style={{ width: "50%" }} />
                        ) : (
                                uploadButton
                            )}
                        {imageUrl ? (
                            <Button className="deleteButton" onClick={this.reset} type="primary">
                                Удалить загруженное изображение
                            </Button>
                        ) : null}
                    </Dragger>
                </Modal>
            </div>
        );
    }
}

export default CabinetModule;
