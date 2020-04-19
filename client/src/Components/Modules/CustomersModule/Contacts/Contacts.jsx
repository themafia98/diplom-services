import React from 'react';
import { contactsType } from '../types';
import TitleModule from '../../../TitleModule';
import modelContext from '../../../../Models/context';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import VList from 'react-virtualized/dist/commonjs/List';
import InfiniteLoader from 'react-virtualized/dist/commonjs/InfiniteLoader';
import { List, message, Avatar, Spin } from 'antd';
import Scrollbars from 'react-custom-scrollbars';

class Contacts extends React.PureComponent {
  state = {
    data: [],
    loading: false,
    isLoadingModule: false,
  };

  static contextType = modelContext;
  static propTypes = contactsType;

  loadedRowsMap = {};

  componentDidMount = async () => {
    this.setState(
      {
        isLoadingModule: true,
      },
      () => {
        this.fetchData(res => {
          this.setState({
            data: res?.metadata,
            isLoadingModule: false,
          });
        });
      },
    );
  };

  componentDidUpdate = () => {
    // const {
    //   onSetStatus,
    //   visible,
    //   path = '',
    //   router: { currentActionTab = '', shouldUpdate = false } = {},
    // } = this.props;
    // if (visible && false) {
    //   this.fetchData(res => {
    //     this.setState({
    //       data: res?.metadata,
    //       isLoadingModule: false,
    //     });
    //   });
    // }
  };

  fetchData = async callback => {
    const { Request } = this.context;
    try {
      const rest = new Request();
      const res = await rest.sendRequest('/system/userList', 'GET', null, true);

      if (res.status !== 200) {
        throw new Error('Bad load list');
      }
      const { data: { response = {} } = {} } = res || {};
      callback(response);
    } catch (error) {
      console.error(error);
      message.error('Не удалось загрузить список');

      this.setState({ isLoadingModule: false });
    }
  };

  handleInfiniteOnLoad = ({ startIndex, stopIndex }) => {
    this.setState({
      loading: true,
    });
    for (let i = startIndex; i <= stopIndex; i++) {
      // 1 means loading
      this.loadedRowsMap[i] = 1;
    }

    message.success('Список контактов успешно загружен');
    this.setState({
      loading: false,
      isLoadingModule: false,
    });
  };

  isRowLoaded = ({ index }) => !!this.loadedRowsMap[index];

  renderItem = ({ index, key, style }) => {
    const { data } = this.state;
    const item = data[index];
    return (
      <List.Item key={key} style={style}>
        <List.Item.Meta
          avatar={<Avatar src={`data:image/png;base64,${item?.avatar}`} />}
          title={<p>{item?.displayName}</p>}
          description={
            <div className="item-desccription">
              {item?.email ? <p>{item.email}</p> : null}
              {item?.phone ? <p>{item.phone}</p> : null}
            </div>
          }
        />
      </List.Item>
    );
  };

  getAdditionalComponents = () => {
    const { data } = this.state;
    const vlist = ({ isScrolling, onChildScroll, scrollTop, onRowsRendered, width }) => (
      <VList
        autoHeight
        height={73 * data.length}
        isScrolling={isScrolling}
        onScroll={onChildScroll}
        overscanRowCount={2}
        rowCount={data.length}
        rowHeight={73}
        rowRenderer={this.renderItem}
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
      <InfiniteLoader
        isRowLoaded={this.isRowLoaded}
        loadMoreRows={this.handleInfiniteOnLoad}
        rowCount={data.length}
      >
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

  render() {
    const { data, isLoadingModule = false } = this.state;

    const infiniteLoader = this.getAdditionalComponents();

    return (
      <div className="contactsModule">
        <TitleModule classNameTitle="contactsModuleTitle" title="Контакты" />
        <div className="contactsModule__main">
          <Scrollbars>
            <List>
              {data?.length > 0 && <WindowScroller>{infiniteLoader}</WindowScroller>}
              {isLoadingModule && <Spin size="large" className="demo-loading" />}
            </List>
          </Scrollbars>
        </div>
      </div>
    );
  }
}
export default Contacts;
