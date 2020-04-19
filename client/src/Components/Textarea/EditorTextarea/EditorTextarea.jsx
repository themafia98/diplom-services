import React from 'react';
import { editorTextareaType } from '../types';
import clsx from 'clsx';
import { stateFromHTML } from 'draft-js-import-html';
import { convertFromRaw } from 'draft-js';
import { getValidContent } from '../../../Utils';
import { Editor } from 'react-draft-wysiwyg';
import _ from 'lodash';

import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Button } from 'antd';
import modelContext from '../../../Models/context';

class EditorTextarea extends React.Component {
  state = {
    contentState: null,
  };

  static contextType = modelContext;
  static propTypes = editorTextareaType;
  static defaultProps = {
    disabled: false,
    readOnly: false,
    clear: false,
    mode: '',
    contentType: {},
  };

  static getDerivedStateFromProps = (props, state) => {
    const { onChange = null, contentState = null } = props;

    if (_.isFunction(onChange) && contentState) {
      return {
        ...state,
        contentState: getValidContent(contentState),
      };
    }
    return state;
  };

  componentDidMount = () => {
    const { contentState = {} } = this.props;
    if (contentState && (!_.isEmpty(contentState) || _.isString(contentState))) {
      try {
        this.setState({
          contentState: _.isString(contentState) ? stateFromHTML(contentState) : contentState,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  componentDidUpdate = () => {
    const { clear = false, clearStatus = null, readOnly = false } = this.props;
    const { schema = {} } = this.context;
    if (clear && !readOnly) {
      this.setState(
        {
          contentState: convertFromRaw(schema.getEditorJSON()),
        },
        () => {
          if (clearStatus) clearStatus(false);
        },
      );
    }
  };

  onContentStateChange = contentState => {
    const { onChange = null } = this.props;

    if (onChange) onChange(contentState);
    else this.setState({ contentState: contentState });
  };

  handlePastedText = (text, html, editorState) => {
    this.setState({ contentState: editorState });
  };

  render() {
    const { contentState = null } = this.state;
    const {
      mode = '',
      onPublish = null,
      readOnly = false,
      disabled = false,
      buttonName = '',
      shouldDisplayButton = false,
    } = this.props;

    const readOnlyProps =
      readOnly && contentState
        ? {
            contentState,
          }
        : {};
    const classNameButton = buttonName ? 'customButton-editor' : 'createNews-button';
    return (
      <div className={clsx('content', readOnly ? 'readOnly' : null)}>
        <Editor
          readOnly={disabled || readOnly}
          toolbarHidden={readOnly}
          localization={{ locale: 'ru' }}
          handlePastedText={this.handlePastedText}
          wrapperClassName="editor-wrapper"
          editorClassName="editor"
          {...readOnlyProps}
          onContentStateChange={this.onContentStateChange}
        />
        {(mode === 'createNewsEdit' && !readOnly) || shouldDisplayButton ? (
          <Button
            disabled={disabled}
            onClick={onPublish ? onPublish.bind(this, contentState) : null}
            className={classNameButton}
            type="primary"
          >
            {buttonName ? buttonName : 'Опубликовать'}
          </Button>
        ) : null}
      </div>
    );
  }
}

export default EditorTextarea;
