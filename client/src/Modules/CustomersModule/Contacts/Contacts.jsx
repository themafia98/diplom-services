import React, { memo, useEffect, useState, useCallback, useMemo } from 'react';
import { contactsType } from '../CustomersModule.types';
import TitleModule from 'Components/TitleModule';

import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import VList from 'react-virtualized/dist/commonjs/List';
import InfiniteLoader from 'react-virtualized/dist/commonjs/InfiniteLoader';
import { List, message, Avatar, Spin } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { setStatus } from 'Redux/actions/publicActions';

const Contacts = memo(({ modelsContext }) => {
  const [data, setData] = useState([]);
  const [isLoadingModule, setLoadingModule] = useState(false);

  const loadedRowsMap = useMemo(() => {}, []);

  const fetchData = useCallback(
    async (callback) => {
      const { Request } = modelsContext;
      try {
        const rest = new Request();
        const res = await rest.sendRequest('/system/userList', 'GET', null, true);

        if (res.status !== 200) {
          throw new Error('Bad load list');
        }
        const { data: { response = {} } = {} } = res || {};
        callback(response);
      } catch (error) {
        if (error?.response?.status !== 404) console.error(error);
        message.error('Не удалось загрузить список');

        setLoadingModule(false);
      }
    },
    [modelsContext],
  );

  useEffect(() => {
    setLoadingModule(true);

    fetchData((res) => {
      setData(res?.metadata);
      setLoadingModule(false);
    });
  }, [fetchData]);

  const handleInfiniteOnLoad = useCallback(
    ({ startIndex, stopIndex }) => {
      for (let i = startIndex; i <= stopIndex; i++) {
        // 1 means loading
        loadedRowsMap[i] = 1;
      }

      message.success('Список контактов успешно загружен');

      setLoadingModule(false);
    },
    [loadedRowsMap],
  );

  const isRowLoaded = ({ index }) => !!loadedRowsMap[index];

  const renderItem = useCallback(
    ({ index, key, style }) => {
      const { email = '', phone = '', avatar = '', displayName = '' } = data[index] || {};
      return (
        <List.Item key={key} style={style}>
          <List.Item.Meta
            avatar={<Avatar src={`data:image/png;base64,${avatar}`} />}
            title={<p>{displayName}</p>}
            description={
              <div className="item-desccription">
                {email ? <p>{email}</p> : null}
                {phone ? <p>{phone}</p> : null}
              </div>
            }
          />
        </List.Item>
      );
    },
    [data],
  );

  const getAdditionalComponents = () => {
    const vlist = ({ isScrolling, onChildScroll, scrollTop, onRowsRendered, width }) => (
      <VList
        autoHeight
        height={73 * data.length}
        isScrolling={isScrolling}
        onScroll={onChildScroll}
        overscanRowCount={2}
        rowCount={data.length}
        rowHeight={73}
        rowRenderer={renderItem}
        onRowsRendered={onRowsRendered}
        scrollTop={scrollTop}
        width={width}
      />
    );
    const autoSize = ({ height, isScrolling, onChildScroll, scrollTop, onRowsRendered }) => (
      <AutoSizer disableHeight>
        {({ width }) =>
          vlist({
            height,
            isScrolling,
            onChildScroll,
            scrollTop,
            onRowsRendered,
            width,
          })
        }
      </AutoSizer>
    );
    const infiniteLoader = ({ height, isScrolling, onChildScroll, scrollTop }) => (
      <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={handleInfiniteOnLoad} rowCount={data.length}>
        {({ onRowsRendered }) =>
          autoSize({
            height,
            isScrolling,
            onChildScroll,
            scrollTop,
            onRowsRendered,
          })
        }
      </InfiniteLoader>
    );

    return infiniteLoader;
  };

  const infiniteLoader = getAdditionalComponents();

  return (
    <div className="contactsModule">
      <TitleModule classNameTitle="contactsModuleTitle" title="Контакты" />
      <div className="contactsModule__main">
        <Scrollbars autoHide hideTracksWhenNotNeeded>
          <List>
            {data?.length > 0 && <WindowScroller>{infiniteLoader}</WindowScroller>}
            {isLoadingModule && <Spin size="large" className="demo-loading" />}
          </List>
        </Scrollbars>
      </div>
    </div>
  );
});

Contacts.defaultProps = {
  modelsContext: null,
};

Contacts.propTypes = contactsType;

const mapDispatchToProps = (dispatch) => {
  return {
    onSetStatus: (status) => dispatch(setStatus({ statusRequst: status })),
  };
};

export default compose(connect(null, mapDispatchToProps), moduleContextToProps)(Contacts);
