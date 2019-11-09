import React from "react";
import PropTypes from "prop-types";
import data from "./data.json";

import Bar from "./Charts/Bar";
import TitleModule from "../../TitleModule";

class StatisticsModule extends React.PureComponent {
    static propTypes = {
        onErrorRequstAction: PropTypes.func.isRequired,
        path: PropTypes.string.isRequired,
        firebase: PropTypes.object.isRequired,
    };

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
