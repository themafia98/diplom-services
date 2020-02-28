import React, { useState } from "react";
import { Button, Input } from "antd";


const Recovory = props => {

    const [mode, setMode] = useState("emailMode");

    const onSubmit = event => {

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
                <Input
                    type="text"
                    placeholder={mode === "emailMode"
                        ? "введите вашу электронную почту"
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
