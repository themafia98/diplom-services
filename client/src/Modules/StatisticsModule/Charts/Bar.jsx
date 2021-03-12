import React, { useEffect, useState, useMemo } from 'react';
import { barType } from '../StatisticsModule.types';
import { Spin } from 'antd';
import { ResponsiveBar } from '@nivo/bar';
import { useDispatch } from 'react-redux';
import { loadFlagAction } from 'Redux/actions/routerActions';
import { useTranslation } from 'react-i18next';

const Bar = ({
  data,
  dataKeys,
  textContent,
  schemeBarProps,
  legendName,
  anchor,
  customLegendEffects,
  dateConfig,
  path,
  isLoading,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [dateParams, setDateParams] = useState(dateConfig);
  const [source, setSource] = useState([]);

  useEffect(() => {
    if (source.length && isLoading) {
      setSource([]);
    }
  }, [isLoading, source.length]);

  useEffect(() => {
    if (dateConfig !== dateParams) {
      setDateParams(dateConfig);

      !isLoading && dispatch(loadFlagAction({ path, loading: true }));
      return;
    }

    if (isLoading && dateConfig && dateParams && dateConfig === dateParams) {
      dispatch(loadFlagAction({ path, loading: false }));
    }
  }, [dateConfig, dateParams, path, dispatch, isLoading]);

  useEffect(() => {
    const keysSub = Object.values(dataKeys);
    const sourceDraft = [];

    keysSub.forEach((keySub) => {
      const item = data[keySub];

      sourceDraft.push({
        counter: keySub,
        [keySub]: item,
        'hot dogColor': 'hsl(45, 70%, 50%)',
        burgerColor: 'hsl(126, 70%, 50%)',
      });
    });

    if (JSON.stringify(source) !== JSON.stringify(sourceDraft)) {
      setSource(sourceDraft);
    }
  }, [data, dataKeys, source]);

  const defs = useMemo(() => {
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
  }, []);

  const fill = useMemo(() => {
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
  }, []);

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
          ? `${t('statisticsModule_barChart_statDoneTasksLegend')} ( ${textContent} )`
          : t('statisticsModule_barChart_statDoneTasksLegend'),
      legendPosition: 'middle',
      legendOffset: 32,
    };
  }, [legendName, t, textContent]);

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

  if (isLoading) return <Spin size="large" />;

  if (!source?.length) {
    return <div className="empty-bar">{t('statisticsModule_barChart_empty')}</div>;
  }

  return (
    <div className="barWrapper">
      <ResponsiveBar
        data={source}
        keys={dataKeys}
        indexBy="counter"
        margin={marginBar}
        padding={0.3}
        colors={colorScheme}
        defs={defs}
        fill={fill}
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
  dataKeys: [],
  schemeBarProps: null,
  legendName: '',
  anchor: '',
  customLegendEffects: null,
  textContent: '',
  loading: false,
  dateConfig: {},
  path: '',
  isLoading: false,
};
export default Bar;
