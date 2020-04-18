import React from 'react';
import { userCardType } from './types';
import { connect } from 'react-redux';
import { updateUdata } from '../../Redux/actions/publicActions';
import { Avatar, Button, Icon, Dropdown, Menu, Tooltip, message, Popover } from 'antd';
import ModalWindow from '../ModalWindow';

import modelContext from '../../Models/context';
import imageCard from './wallpaper_user.jpg';

const { Item: MenuItem } = Menu;

class UserCard extends React.Component {
  state = {
    visibilityModal: false,
  };
  static propTypes = userCardType;
  static contextType = modelContext;

  static getDerivedStateFromProps = (props, state) => {
    const { modePage: modePageProps = '' } = props || {};
    const { modePage = '' } = state;

    const isPersonalPage = modePageProps && modePageProps.includes('personal');

    if (isPersonalPage && modePage !== modePageProps) {
      return {
        ...state,
        modePage: 'personal',
      };
    }

    return state;
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
    const { visibilityModal = false, modePage = '' } = this.state;
    const { udata = {}, cdShowModal, imageUrl = '', personalData = {} } = this.props;
    const isPersonalPage = modePage === 'personal';
    const {
      displayName = '',
      departament = '',
      email = '',
      isOnline = false,
      summary = '',
      phone = '',
    } = isPersonalPage ? personalData : udata;

    const menu = !isPersonalPage ? (
      <Menu>
        <MenuItem onClick={cdShowModal ? cdShowModal : null} key="photoChange">
          Сменить аватар
        </MenuItem>
      </Menu>
    ) : (
      <div>No action</div>
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
              {!isPersonalPage ? (
                <Tooltip trigger="hover" title="ПКМ - смена фотографии">
                  <Dropdown disabled={isPersonalPage} overlay={menu} trigger={['contextMenu']}>
                    <Avatar
                      src={imageUrl ? `data:image/png;base64,${imageUrl}` : null}
                      className="userLogo"
                      size={84}
                      icon="user"
                    />
                  </Dropdown>
                </Tooltip>
              ) : (
                <Avatar
                  src={imageUrl ? `data:image/png;base64,${imageUrl}` : null}
                  className="userLogo"
                  size={84}
                  icon="user"
                />
              )}
              <div className="mainInformUser">
                <div className="mainInformUser__main">
                  <p className="name">{displayName ? displayName : 'Unknown'}</p>
                  <p className="position">{departament ? departament : ''}</p>
                </div>
                <div className="mainInformUser__controllers">
                  {email ? (
                    <Button title={email} className="controller" type="primary" icon="mail"></Button>
                  ) : null}
                  {isOnline ? <Button className="controller" type="primary" icon="wechat"></Button> : null}
                </div>
              </div>
            </div>
            <div className="col-6 summary_wrapper">
              {!isPersonalPage ? (
                <div className="canEditSummary">
                  <Tooltip title="Редактировать описание">
                    <Icon onClick={this.showEditSummary} type="edit" />
                  </Tooltip>
                </div>
              ) : null}
              {summary ? (
                <Popover
                  overlayStyle={{
                    maxWidth: '500px',
                  }}
                  placement="top"
                  content={<p className="summary-popover">{summary}</p>}
                  trigger="click"
                >
                  <p className="summary">{summary}</p>
                </Popover>
              ) : (
                <p className="summary">{summary}</p>
              )}
              <div className="contact">
                {email ? (
                  <div className="email">
                    <Icon type="mail" /> <span>{email}</span>
                  </div>
                ) : null}
                {phone ? (
                  <div className="phone">
                    <Icon type="phone" /> <span>{phone}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        {!isPersonalPage ? (
          <ModalWindow
            title="Редактирование описания"
            defaultView={true}
            maxLength={600}
            visibility={visibilityModal}
            onReject={this.onRejectEditSummary}
            onOkey={this.onSubmitSummary}
            defaultValue={udata.summary}
          />
        ) : null}
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
