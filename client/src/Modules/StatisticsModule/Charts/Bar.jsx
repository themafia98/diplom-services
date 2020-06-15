import React, { useEffect, useState, useMemo } from 'react';
import { barType } from '../types';
import { Spin } from 'antd';
import { ResponsiveBar } from '@nivo/bar';

const Bar = ({
  data,
  subDataList,
  textContent,
  schemeBarProps,
  legendName,
  anchor,
  customLegendEffects,
  loading,
}) => {
  const [source, setSource] = useState([]);

  useEffect(() => {
    const keysSub = Object.values(subDataList);
    const sourceDraft = [];

    keysSub.forEach((keySub, index) => {
      const item = data[keySub];

      sourceDraft.push({
        counter: keySub,
        [keySub]: item,
        'hot dogColor': 'hsl(45, 70%, 50%)',
        burgerColor: 'hsl(126, 70%, 50%)',
      });
    });

    setSource(sourceDraft);
  }, [data, subDataList]);

  const getDefs = () => {
    return [
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
    ];
  };

  const getFill = () => {
    return [
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
    ];
  };

  const border = useMemo(() => {
    return { from: 'color', modifiers: [['darker', 1.6]] };
  }, []);

  const marginBar = useMemo(() => {
    return { top: 50, right: 130, bottom: 50, left: 60 };
  }, []);

  const axisBottom = useMemo(() => {
    return {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend:
        legendName && textContent
          ? `${legendName} ( ${textContent} )`
          : legendName
          ? legendName
          : textContent
          ? `Статистика выполненных задач ( ${textContent} )`
          : 'Статистика выполненных задач',
      legendPosition: 'middle',
      legendOffset: 32,
    };
  }, [legendName, textContent]);

  const axisLeft = useMemo(() => {
    return {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legendPosition: 'middle',
      legendOffset: -40,
    };
  }, []);

  const labelText = useMemo(() => {
    return { from: 'color', modifiers: [['darker', 1.6]] };
  }, []);

  const colorScheme = useMemo(() => {
    if (!schemeBarProps) return { scheme: 'nivo' };
    else return schemeBarProps;
  }, [schemeBarProps]);

  const legendsList = useMemo(() => {
    return [
      {
        dataFrom: 'keys',
        anchor: anchor ? anchor : 'bottom-right',
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
        effects: customLegendEffects
          ? customLegendEffects
          : [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
      },
    ];
  }, [anchor, customLegendEffects]);

  if (loading && (!data || !subDataList?.length)) return <Spin size="large" />;

  if (!loading && !source?.length)
    return <div className="empty-bar">Нету данных для построения графика выполненных задач</div>;

  return (
    <div className="barWrapper">
      <ResponsiveBar
        data={source}
        keys={subDataList}
        indexBy="counter"
        margin={marginBar}
        padding={0.3}
        colors={colorScheme}
        defs={getDefs()}
        fill={getFill()}
        borderColor={border}
        axisTop={null}
        axisRight={null}
        axisBottom={axisBottom}
        axisLeft={axisLeft}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={labelText}
        legends={legendsList}
        animate={false}
        motionStiffness={90}
        motionDamping={15}
      />
    </div>
  );
};

Bar.propTypes = barType;
Bar.defaultProps = {
  data: [],
  subDataList: [],
  schemeBarProps: null,
  legendName: '',
  anchor: '',
  customLegendEffects: null,
  textContent: '',
  loading: false,
};
export default Bar;
