import React from 'react';
import debounce from 'lodash/debounce';
import {stateToHTML} from 'draft-js-export-html';
import {
  Editor,
  EditorState,
  ContentState,
  Entity,
  RichUtils,
  convertToRaw,
  CompositeDecorator,
  Modifier,
  convertFromHTML
} from 'draft-js';

import Subject from './Subject.react';
import Link from './components/Link';
import CurlySpan from './components/CurlySpan.react';
import EntityControls from './components/EntityControls';
import InlineStyleControls from './components/InlineStyleControls';
import BlockStyleControls from './components/BlockStyleControls';

import { curlyStrategy, findEntities } from './utils/strategies';

const placeholder = 'Tip: Use column names as variables in your template email. E.g. "Hi {firstname}! It was so good to see you at {location} the other day...';
const injectCssToTags = {
  'p': 'margin: 0;font-family: arial;'
};

export default class BasicHtmlEditor extends React.Component {
  constructor(props) {
    super(props);
    const decorator = new CompositeDecorator([
      {
        strategy: findEntities.bind(null, 'link'),
        component: Link
      },
      {
        strategy: curlyStrategy,
        component: CurlySpan
      }
    ]);

    this.ENTITY_CONTROLS = [
      {label: 'Add Link', action: this._addLink.bind(this) },
      {label: 'Remove Link', action: this._removeLink.bind(this) }
    ];

    this.INLINE_STYLES = [
      {label: 'Bold', style: 'BOLD'},
      {label: 'Italic', style: 'ITALIC'},
      {label: 'Underline', style: 'UNDERLINE'},
      {label: 'Monospace', style: 'CODE'},
      {label: 'Strikethrough', style: 'STRIKETHROUGH'}
    ];

    this.BLOCK_TYPES = [
      {label: 'P', style: 'unstyled'},
      {label: 'H1', style: 'header-one'},
      {label: 'H2', style: 'header-two'},
      {label: 'Blockquote', style: 'blockquote'},
      {label: 'UL', style: 'unordered-list-item'},
      {label: 'OL', style: 'ordered-list-item'},
      {label: 'Code Block', style: 'code-block'}
    ];

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      bodyHtml: null
    };

    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => {
      let previousContent = this.state.editorState.getCurrentContent();
      this.setState({editorState});

      // only emit html when content changes
      if (previousContent !== editorState.getCurrentContent()) {
        this.emitHTML(editorState);
      }
    };

    function emitHTML(editorState) {
      const content = editorState.getCurrentContent();
      let html = stateToHTML(content, null, injectCssToTags);
      this.props.onBodyChange(html);
    }
    this.emitHTML = debounce(emitHTML, this.props.debounce);

    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.handleReturn = (e) => this._handleReturn(e);
    this.addLink = this._addLink.bind(this);
    this.removeLink = this._removeLink.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.bodyHtml !== this.state.bodyHtml) {
      console.log('change template');
      const content = ContentState.createFromBlockArray(convertFromHTML(nextProps.bodyHtml));
      const editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
      this.onChange(editorState);
      this.setState({bodyHtml: nextProps.bodyHtml});
    }
  }

  _handleKeyCommand(command) {
    const {editorState} = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _handleReturn(e) {
    if (e.metaKey === true) {
      return this._addLineBreak();
    } else {
      return false;
    }
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  _addLineBreak(/* e */) {
    let newContent, newEditorState;
    const {editorState} = this.state;
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const block = content.getBlockForKey(selection.getStartKey());

    console.log(content.toJS(), selection.toJS(), block.toJS());

    if (block.type === 'code-block') {
      newContent = Modifier.insertText(content, selection, '\n');
      newEditorState = EditorState.push(editorState, newContent, 'add-new-line');
      this.onChange(newEditorState);
      return true;
    } else {
      return false;
    }
  }

  _addLink(/* e */) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      return;
    }
    const href = window.prompt('Enter a URL');
    const entityKey = Entity.create('link', 'MUTABLE', {href});
    this.onChange(RichUtils.toggleLink(editorState, selection, entityKey));
  }

  _removeLink(/* e */) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      return;
    }
    this.onChange( RichUtils.toggleLink(editorState, selection, null));
  }

  render() {
    const {editorState} = this.state;
    const props = this.props;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div className='RichEditor-root' style={props.style}>
        <div className='RichEditor-controls RichEditor-styleButton'>
          <span>Emails are sent from: {props.person.email}</span>
        </div>
        <BlockStyleControls
          editorState={editorState}
          blockTypes={this.BLOCK_TYPES}
          onToggle={this.toggleBlockType}
        />
        <InlineStyleControls
          editorState={editorState}
          onToggle={this.toggleInlineStyle}
          inlineStyles={this.INLINE_STYLES}
        />
        <EntityControls
          editorState={editorState}
          entityControls={this.ENTITY_CONTROLS}
        />
        <div>
        <Subject
        onSubjectChange={props.onSubjectChange}
        subjectHtml={props.subjectHtml}
        />
        </div>
        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            handleReturn={this.handleReturn}
            onChange={this.onChange}
            placeholder={placeholder}
            ref='editor'
            spellCheck
          />
        </div>
         <div style={{
          position: 'absolute',
          bottom: 3,
          display: 'flex',
          justifyContent: 'space-between',
          width: props.style.width,
          paddingRight: '30px'
        }}>{props.children}</div>
      </div>
    );
  }
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  }
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}
