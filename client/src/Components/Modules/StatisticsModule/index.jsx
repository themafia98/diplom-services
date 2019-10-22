import React from "react";
import data from "./data.json";

import Bar from "./Charts/Bar";
import TitleModule from "../../TitleModule";
class StatisticsModule extends React.PureComponent {
    render() {
        return (
            <div className="statisticsModule">
                <TitleModule classNameTitle="statisticsModuleTitle" title="Статистика" />
                <div className="statisticsModule__main">
                    <div className="col-6">
                        <Bar data={data.data} />
                    </div>
                </div>
            </div>
        );
    }
}

export default StatisticsModule;
