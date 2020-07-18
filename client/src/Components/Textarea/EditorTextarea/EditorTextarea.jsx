import React from 'react';
import { editorTextareaType } from '../types';
import clsx from 'clsx';
import { stateFromHTML } from 'draft-js-import-html';
import { convertFromRaw } from 'draft-js';
import { getValidContent } from 'Utils';
import { Editor } from 'react-draft-wysiwyg';
import _ from 'lodash';

import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Button } from 'antd';
import ModelContext from 'Models/context';

class EditorTextarea extends React.Component {
  state = {
    contentState: null,
  };

  static contextType = ModelContext;
  static propTypes = editorTextareaType;
  static defaultProps = {
    disabled: false,
    readOnly: false,
    clear: false,
    mode: '',
    contentState: {},
    onChange: null,
    clearStatus: null,
    onPublish: null,
    buttonName: '',
    shouldDisplayButton: false,
  };

  static getDerivedStateFromProps = (props, state) => {
    const { contentState } = props;
    const { contentState: content } = state;

    if (_.isEmpty(content) || contentState === null) {
      return {
        ...state,
        contentState: getValidContent(contentState),
      };
    }
    return state;
  };

  componentDidMount = () => {
    const { contentState = {} } = this.props;
    if (contentState && (!_.isEmpty(contentState) || typeof contentState === 'string')) {
      try {
        this.setState({
          contentState:
            typeof contentState === 'string' ? stateFromHTML(contentState) : getValidContent(contentState),
        });
      } catch (error) {
        if (error?.response?.status !== 404) console.error(error);
      }
    }
  };

  componentDidUpdate = () => {
    const { clear, clearStatus, readOnly } = this.props;
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

  onContentStateChange = (contentState) => {
    const { onChange = null } = this.props;

    if (onChange) onChange(contentState);
    else this.setState({ contentState: contentState });
  };

  handlePastedText = (text, html, editorState) => {
    this.setState({ contentState: editorState });
  };

  render() {
    const { contentState = null } = this.state;
    const { mode, onPublish, readOnly, disabled, buttonName, shouldDisplayButton } = this.props;

    const readOnlyProps =
      readOnly && contentState
        ? {
            contentState,
          }
        : {};
    const classNameButton = buttonName ? 'customButton-editor' : 'createNews-button';
    if (!contentState) return null;
    return (
      <div className={clsx('content', readOnly ? 'readOnly' : null)}>
        <Editor
          key="editor"
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
