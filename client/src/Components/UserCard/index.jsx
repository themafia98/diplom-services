import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateUdata } from '../../Redux/actions/publicActions';
import { Avatar, Button, Icon, Dropdown, Menu, Tooltip, message, Popover } from 'antd';
import ModalWindow from '../ModalWindow';

import modelContext from '../../Models/context';
import imageCard from './wallpaper_user.jpg';

const { Item: MenuItem } = Menu;

class UserCard extends React.Component {
  static propTypes = {
    cbShowModal: PropTypes.func,
  };

  static contextType = modelContext;

  state = {
    visibilityModal: false,
  };

  showEditSummary = () => {
    const { visibilityModal = false } = this.state;
    this.setState({ visibilityModal: !visibilityModal });
  };

  onSubmitSummary = async (event, value) => {
    const { udata: { _id: uid = '' } = {}, onUpdateUdata } = this.props;
    const { Request } = this.context;

    try {
      const rest = new Request();
      const res = await rest.sendRequest(
        '/system/users/update/single',
        'POST',
        {
          queryParams: { uid },
          updateItem: {
            summary: value,
          },
        },
        true,
      );

      if (res.status !== 200) {
        throw new Error('Bad summury update');
      }

      const { response: { metadata: { summary = '' } = {} } = {} } = res.data || {};

      onUpdateUdata({ summary });

      this.setState({ visibilityModal: false });
    } catch (error) {
      console.error(error.message);
      message.error('Ошибка обновления описания.');
    }
  };

  onRejectEditSummary = event => {
    this.setState({
      visibilityModal: false,
    });
  };

  render() {
    const { visibilityModal = false } = this.state;
    const { udata = {}, cdShowModal, imageUrl = '' } = this.props;

    const isMine = true;

    const menu = (
      <Menu>
        <MenuItem onClick={cdShowModal ? cdShowModal : null} key="photoChange">
          Сменить аватар
        </MenuItem>
      </Menu>
    );

    const background = {
      backgroundImage: `url("${imageCard}")`,
    };

    return (
      <React.Fragment>
        <div className="userCard">
          <div style={background} className="wallpaper"></div>
          <div className="mainContentCard">
            <div className="col-6">
              {isMine ? (
                <Tooltip trigger="hover" title="ПКМ - смена фотографии">
                  <Dropdown overlay={menu} trigger={['contextMenu']}>
                    <Avatar
                      src={imageUrl ? `data:image/png;base64,${imageUrl}` : null}
                      className="userLogo"
                      size={84}
                      icon="user"
                    />
                  </Dropdown>
                </Tooltip>
              ) : (
                <Avatar className="userLogo" size={84} icon="user" />
              )}
              <div className="mainInformUser">
                <div className="mainInformUser__main">
                  <p className="name">{udata.displayName ? udata.displayName : 'Unknown'}</p>
                  <p className="position">{udata.departament ? udata.departament : ''}</p>
                </div>
                <div className="mainInformUser__controllers">
                  {udata.email ? (
                    <Button title={udata.email} className="controller" type="primary" icon="mail"></Button>
                  ) : null}
                  {udata.isOnline ? (
                    <Button className="controller" type="primary" icon="wechat"></Button>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="col-6 summary_wrapper">
              <div className="canEditSummary">
                <Tooltip title="Редактировать описание">
                  <Icon onClick={this.showEditSummary} type="edit" />
                </Tooltip>
              </div>
              {udata.summary ? (
                <Popover
                  overlayStyle={{
                    maxWidth: '500px',
                  }}
                  placement="top"
                  content={<p className="summary-popover">{udata.summary}</p>}
                  trigger="click"
                >
                  <p className="summary">{udata.summary}</p>
                </Popover>
              ) : (
                <p className="summary">{udata.summary}</p>
              )}
              <div className="contact">
                {udata.email ? (
                  <div className="email">
                    <Icon type="mail" /> <span>{udata.email}</span>
                  </div>
                ) : null}
                {udata.phone ? (
                  <div className="phone">
                    <Icon type="phone" /> <span>{udata.phone}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <ModalWindow
          title="Редактирование описания"
          defaultView={true}
          maxLength={600}
          visibility={visibilityModal}
          onReject={this.onRejectEditSummary}
          onOkey={this.onSubmitSummary}
          defaultValue={udata.summary}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const { udata = {} } = state.publicReducer;
  return { udata };
};

const mapDispatchToProps = dispatch => {
  return {
    onUpdateUdata: udata => dispatch(updateUdata(udata)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserCard);
