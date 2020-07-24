import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { headerViewType } from './types';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import { dragEndTabAction } from 'Redux/actions/tabActions';
import { saveComponentStateAction } from 'Redux/actions/routerActions';
import Tab from './Tab';
import RightPanel from './RightPanel';

const { Header } = Layout;

class HeaderView extends React.PureComponent {
  state = {
    length: 1,
    size: 160,
    sizeParent: null,
  };

  static propTypes = headerViewType;
  static defaultProps = {
    tabArray: [],
    dashboardStrem: null,
  };

  componentDidUpdate = () => {
    const { sizeParent, size, length } = this.state;
    const { tabArray = [] } = this.props;
    const MARGIN_TAB = 5;

    const sizes = sizeParent / tabArray.length - MARGIN_TAB;
    const counter = ~~(sizeParent / size);

    if (sizeParent === null && this.wrapper) {
      this.setState({
        length: tabArray.length,
        sizeParent: this.wrapper.getBoundingClientRect().width,
      });
    }

    if ((tabArray.length >= counter && sizeParent !== null) || (tabArray.length < length && size < 160)) {
      this.setState({
        length: tabArray.length,
        size: sizes,
      });
    }
  };

  reorder = (list, dragIndex, dropIndex) => {
    const [removed] = list.splice(dragIndex, 1);
    list.splice(dropIndex, 0, removed);
    return list;
  };

  onDragEnd = (event, tabsList) => {
    const { onDragEndTabAction } = this.props;
    if (!event.destination) {
      return;
    }
    onDragEndTabAction(this.reorder([...tabsList], event.source.index, event.destination.index));
  };

  wrapper = null;
  refWrapper = (node) => (this.wrapper = node);

  renderTabs = (items) => {
    const { size = 160 } = this.state;
    const { activeTabEUID = 'mainModule', cbMenuTabHandler } = this.props;

    return (
      <DragDropContext onDragEnd={(event) => this.onDragEnd(event, items)}>
        <Droppable direction="horizontal" droppableId="droppable">
          {(provided, snapshot) => (
            <div className="droppable-wrapper" ref={provided.innerRef}>
              <ul ref={this.refWrapper} {...provided.droppableProps} className="tabsMenu">
                {items.map((item, index) => {
                  return (
                    <Tab
                      hendlerTab={cbMenuTabHandler}
                      active={activeTabEUID === item.EUID}
                      key={item.EUID}
                      itemKey={item.EUID}
                      value={item.VALUE}
                      sizeTab={size}
                      index={index}
                    />
                  );
                })}
              </ul>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  update = () => {
    const { dashboardStrem } = this.props;
    if (dashboardStrem) dashboardStrem.emit('EventUpdate', true);
  };

  render() {
    const {
      activeTabs = ['mainModule'],
      goCabinet,
      status,
      shouldUpdate,
      logout,
      udata,
      onSaveComponentState,
      appConfig,
    } = this.props;

    const notificationDep = {
      streamStore: 'streamList',
      streamModule: 'system',
      store: 'redux',
      filterStream: 'uidCreater',
      onSaveComponentState,
    };

    return (
      <Header>
        {activeTabs ? this.renderTabs(activeTabs) : null}
        <RightPanel
          appConfig={appConfig}
          udata={udata}
          shouldUpdate={shouldUpdate}
          status={status}
          goCabinet={goCabinet}
          onLogout={logout}
          onUpdate={this.update}
          notificationDep={notificationDep}
        />
      </Header>
    );
  }
}

const mapStateTopProps = (state) => {
  const { status = 'online', udata = {}, appConfig } = state.publicReducer;
  const { shouldUpdate = false, routeData = {} } = state.router;
  return {
    tabArray: state.router.activeTabs,
    shouldUpdate,
    status,
    udata,
    routeData,
    appConfig,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSaveComponentState: (data) => dispatch(saveComponentStateAction(data)),
    onDragEndTabAction: (payload) => dispatch(dragEndTabAction(payload)),
  };
};

export default connect(mapStateTopProps, mapDispatchToProps)(HeaderView);
export { HeaderView };
