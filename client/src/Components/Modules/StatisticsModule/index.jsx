import React from "react";
import TitleModule from "../../TitleModule";
import { XYPlot, HorizontalGridLines, VerticalGridLines, YAxis, XAxis, MarkSeries } from "react-vis";
class StatisticsModule extends React.PureComponent {
    render() {
        const data = [
            { x: 0, y: 8 },
            { x: 1, y: 5 },
            { x: 2, y: 4 },
            { x: 3, y: 9 },
            { x: 4, y: 1 },
            { x: 5, y: 7 },
            { x: 6, y: 6 },
            { x: 7, y: 3 },
            { x: 8, y: 2 },
            { x: 9, y: 0 },
        ];

        return (
            <div className="statisticsModule">
                <TitleModule classNameTitle="statisticsModuleTitle" title="Статистика" />
                <div className="statisticsModule__main">
                    <XYPlot width={300} height={300}>
                        <VerticalGridLines />
                        <HorizontalGridLines />
                        <XAxis />
                        <YAxis />

                        <MarkSeries
                            className="mark-series-example"
                            strokeWidth={2}
                            opacity="0.8"
                            sizeRange={[5, 100]}
                            colorType="literal"
                            getColor={d => "#12939A"}
                            data={data}
                        />
                    </XYPlot>
                </div>
            </div>
        );
    }
}

export default StatisticsModule;
