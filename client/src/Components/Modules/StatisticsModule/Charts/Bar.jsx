import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';
import { ResponsiveBar } from '@nivo/bar';

const Bar = ({ data, dateList }) => {
  const buildingBar = () => {
    const keysData = Object.keys(data);
    const result = [];
    if (!data.length) return [];

    for (let i = 0; i < dateList.length; i++) {
      let metadataCounterDone = 0;
      let metadataCounterFail = 0;
      for (let j = 0; j < keysData.length; j++) {
        const key = keysData[j];
        const it = data[key];

        const dateStart = it.date[0].split(/\./gi)[1] - 1;
        const dateEnd = it.date[1].split(/\./gi)[1] - 1;

        const titleMonthStart = moment()
          .month(dateStart)
          .locale('ru')
          .format('MMM');
        const titleMonthEnd = moment()
          .month(dateEnd)
          .locale('ru')
          .format('MMM');

        if (titleMonthStart !== dateList[i] && titleMonthEnd !== dateList[i]) {
          continue;
        }

        const isDone = it.status === 'Закрыт';
        if (isDone) metadataCounterDone += 1;
        else metadataCounterFail += 1;
      }

      result.push({
        counter: dateList[i],
        Выполнено: metadataCounterDone,
        'hot dogColor': 'hsl(45, 70%, 50%)',
        'Не выполнено': metadataCounterFail,
        burgerColor: 'hsl(126, 70%, 50%)',
      });
    }

    return result;
  };

  return (
    <div className="barWrapper">
      <ResponsiveBar
        data={buildingBar()}
        keys={['Выполнено', 'Не выполнено']}
        indexBy="counter"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        colors={{ scheme: 'nivo' }}
        defs={[
          {
            id: 'dots',
            type: 'patternDots',
            background: 'inherit',
            color: '#38bcb2',
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: 'lines',
            type: 'patternLines',
            background: 'inherit',
            color: '#eed312',
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        fill={[
          {
            match: {
              id: 'fries',
            },
            id: 'dots',
          },
          {
            match: {
              id: 'sandwich',
            },
            id: 'lines',
          },
        ]}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Статистика количества выполненных задач',
          legendPosition: 'middle',
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legendPosition: 'middle',
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        animate={false}
        motionStiffness={90}
        motionDamping={15}
      />
    </div>
  );
};

Bar.propTypes = {
  data: PropTypes.array.isRequired,
};
export default Bar;
