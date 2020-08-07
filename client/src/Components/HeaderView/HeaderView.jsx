import React, { PureComponent } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { headerViewType } from './types';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import { dragEndTabAction } from 'Redux/actions/tabActions';
import { saveComponentStateAction } from 'Redux/actions/routerActions';
import RightPanel from './RightPanel';
import Tab from './Tab/index';
import { MARGIN_TAB } from './HeaderView.constant';

const { Header } = Layout;

class HeaderView extends PureComponent {
  state = {
    length: 1,
    size: 160,
    sizeParent: null,
  };

  tabsMenuRef = React.createRef();

  static propTypes = headerViewType;
  static defaultProps = {
    activeTabs: [],
    dashboardStrem: null,
  };

  componentDidUpdate = () => {
    const { sizeParent, size, length } = this.state;
    const { tabArray = [] } = this.props;

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

  onDragEnd = ({ destination, source }, tabsList) => {
    const { index: indexDest } = destination || {};
    const { index } = source || {};
    const { onDragEndTabAction } = this.props;

    if (!destination) return;

    onDragEndTabAction(this.reorder([...tabsList], index, indexDest));
  };

  renderTabs = (items) => {
    const { size = 160 } = this.state;
    const { activeTabEUID = 'mainModule', cbMenuTabHandler } = this.props;

    return (
      <DragDropContext onDragEnd={(event) => this.onDragEnd(event, items)}>
        <Droppable direction="horizontal" droppableId="droppable">
          {(provided, snapshot) => (
            <div className="droppable-wrapper" ref={provided.innerRef}>
              <ul ref={this.tabsMenuRef} {...provided.droppableProps} className="tabsMenu">
                {items.map(({ EUID = '', VALUE = '' }, index) => {
                  return (
                    <Tab
                      hendlerTab={cbMenuTabHandler}
                      active={activeTabEUID === EUID}
                      key={EUID}
                      itemKey={EUID}
                      value={VALUE}
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
      tabs,
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
        {tabs ? this.renderTabs(tabs) : null}
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
  const { shouldUpdate = false, routeData = {}, activeTabs } = state.router;
  return {
    activeTabs,
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
