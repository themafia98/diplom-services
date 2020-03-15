import React from 'react';
import TitleModule from '../../../../TitleModule';
import EditorTextarea from '../../../../Textarea/EditorTextarea';
import { message, notification, Input } from 'antd';
import modelContext from '../../../../../Models/context';
class CreateNews extends React.PureComponent {
  state = {
    titleNews: '',
    clear: false,
  };

  static contextType = modelContext;

  setEditorValue = event => {
    this.setState({
      editorValue: event,
    });
  };

  clearStatus = event => {
    const { clear } = this.state;
    if (clear)
      this.setState({
        clear: false,
      });
  };

  onChange = ({ currentTarget: { value = '' } = {} }) => {
    this.setState({
      ...this.state,
      titleNews: value,
    });
  };

  onPublish = async contentState => {
    const { statusApp = '' } = this.props;
    const { titleNews = '' } = this.state;
    const { Request } = this.context;
    if (!contentState) {
      return message.error('Ничего не найдено');
    }

    if (!titleNews) {
      return message.error('Название не найдено');
    }

    if (statusApp === 'online') {
      try {
        const rest = new Request();
        const res = await rest.sendRequest(
          '/news/createNews',
          'POST',
          {
            queryParams: {
              actionPath: 'news',
              actionType: 'create_single_news',
            },
            metadata: { title: titleNews, content: contentState },
          },
          true,
        );

        const { response: { params: { done = false } = {} } = {} } = res.data || {};

        if (!done) {
          throw new Error('Bad create news');
        }

        this.setState(
          {
            ...this.state,
            clear: true,
          },
          () => message.success('Новость создана.'),
        );
      } catch (error) {
        console.error(error);
        notification.error({
          title: 'Ошибка создания новой новости',
          message: 'Возможно данные повреждены',
        });
      }
    } else
      return notification.error({
        title: 'Ошибка сети',
        message: 'Интернет соединение отсутствует',
      });
  };
  render() {
    const { clear = false, titleNews = '' } = this.state;
    const { readOnly = '' } = this.props;
    return (
      <div className="createNews">
        <TitleModule classNameTitle="createNewsTitle" title="Создание новой новости" />
        <div className="createNews__main">
          <Input
            autoFocus={true}
            value={titleNews}
            onChange={this.onChange}
            placeholder="Заголовок новости"
          />

          <EditorTextarea
            disabled={readOnly}
            clearStatus={this.clearStatus}
            clear={clear}
            onPublish={this.onPublish}
            mode="createNewsEdit"
          />
        </div>
      </div>
    );
  }
}

export default CreateNews;
