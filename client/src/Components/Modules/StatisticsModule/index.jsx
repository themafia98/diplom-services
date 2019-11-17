import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import data from "./data.json";

import Bar from "./Charts/Bar";
import TitleModule from "../../TitleModule";

class StatisticsModule extends React.PureComponent {
    static propTypes = {
        onErrorRequstAction: PropTypes.func.isRequired,
        path: PropTypes.string.isRequired,
        firebase: PropTypes.object.isRequired
    };

    render() {
        const { router: { routeData: { taskModule: { tasks = [] } = {} } = {} } = {} } = this.props;
        console.log(tasks);
        return (
            <div className="statisticsModule">
                <TitleModule classNameTitle="statisticsModuleTitle" title="Статистика" />
                <div className="statisticsModule__main">
                    <div className="col-6">
                        <Bar data={tasks} />
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return { router: state.router };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(StatisticsModule);
