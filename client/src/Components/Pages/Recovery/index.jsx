import React, { useState } from "react";
import axios from "axios";
import { Button, Input } from "antd";


const Recovory = props => {

    const [status, setStatus] = useState(null);
    const [mode, setMode] = useState("emailMode");

    const onSubmit = async event => {
        const recovoryData = [];

        axios.post("/rest/recovory", recovoryData).then(res => {
            if (res.status !== 200) throw new Error("Bad data for recovory");

            setStatus("Новый пороль будет выслан вам на почту.");

        }).catch(error => {
            console.error(error);
            setStatus(error);
        });
    };

    const onChangeMode = event => {
        if (mode === "emailMode") setMode("loginMode");
        else setMode("emailMode");
    }

    const OnLocation = event => {
        window.location.assign("/");
    }

    return (
        <div className="recovory">
            <form className="recovory_form" name="recovoryForm">
                <p>Восстоновление доступа в систему</p>
                {status ? <span className="status">{status}</span> : null}
                <Input
                    type="text"
                    placeholder={mode === "emailMode"
                        ? "введите ваш email"
                        : "введите ваш логин"
                    }
                />

                <Button onClick={onChangeMode} type="link">Я не помню почту</Button>
                <Button type="primary" onClick={onSubmit}>Восстановить</Button>
                <Button type="primary" onClick={OnLocation}>На главную</Button>
            </form>
        </div>
    )
};
export default Recovory;
