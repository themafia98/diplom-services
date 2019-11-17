import React from "react";

import TitleModule from "../../../TitleModule";

class News extends React.PureComponent {
    render() {
        return (
            <div className="news">
                <TitleModule classNameTitle="mainModuleTitle" title="Информация по предприятию" />
                <div className="news__main"></div>
            </div>
        );
    }
}
export default News;
