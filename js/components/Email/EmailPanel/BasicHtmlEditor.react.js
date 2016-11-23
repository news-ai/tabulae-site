import React from 'react';
import debounce from 'lodash/debounce';
import {connect} from 'react-redux';
import {
  Editor,
  EditorState,
  ContentState,
  Entity,
  RichUtils,
  AtomicBlockUtils,
  convertToRaw,
  CompositeDecorator,
  Modifier,
} from 'draft-js';
import draftRawToHtml from './utils/draftRawToHtml';
// import htmlToContent from './utils/htmlToContent';
import {convertFromHTML} from 'draft-convert';
import * as actionCreators from 'actions/AppActions';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Dialog from 'material-ui/Dialog';
import Dropzone from 'react-dropzone';
import {blue100, blue200, grey300} from 'material-ui/styles/colors';

import AttachmentPreview from '../EmailAttachment/AttachmentPreview.react';
import Subject from './Subject.react';
import Link from './components/Link';
import CurlySpan from './components/CurlySpan.react';
import EntityControls from './components/EntityControls';
import InlineStyleControls from './components/InlineStyleControls';
import BlockStyleControls from './components/BlockStyleControls';
import ExternalControls from './components/ExternalControls';
import Image from './Image/Image.react';

import alertify from 'alertifyjs';

import 'node_modules/draft-js/dist/Draft.css';

import {curlyStrategy, findEntities} from './utils/strategies';

const placeholder = 'Tip: Use column names as variables in your template email. E.g. "Hi {firstname}! It was so good to see you at {location} the other day...';

const controlsStyle = {
  position: 'fixed',
  height: 40,
  zIndex: 200,
  overflow: 'hidden',
  paddingLeft: 10,
  paddingRight: 10,
  bottom: 60,
  border: `solid 1px ${blue100}`,
  borderRadius: '0.8em',
  backgroundColor: 'white',
  files: []
};

const Media = props => {
  const entity = Entity.get(props.block.getEntityAt(0));
  const {src} = entity.getData();
  const type = entity.getType();

  let media;
  if (type === 'image') {
    media = <Image src={src} />;
  }
  return media;
};

function mediaBlockRenderer(block) {
  if (block.getType() === 'atomic') {
    return {
      component: Media,
      editable: false
    };
  }
  return null;
}


class BasicHtmlEditor extends React.Component {
  constructor(props) {
    super(props);
    const decorator = new CompositeDecorator([
      {
        strategy: findEntities.bind(null, 'LINK'),
        component: Link
      },
      {
        strategy: curlyStrategy,
        component: CurlySpan
      }
    ]);

    this.ENTITY_CONTROLS = [
      {label: 'Manage Link', action: this._manageLink.bind(this), icon: 'fa fa-link', entityType: 'LINK'}
    ];

    this.EXTERNAL_CONTROLS = [
      {
        label: 'File Upload',
        onToggle: _ => this.setState({filePanelOpen: true}),
        icon: 'fa fa-paperclip',
      }
    ];

    this.INLINE_STYLES = [
      {label: 'Bold', style: 'BOLD', icon: 'fa fa-bold'},
      {label: 'Italic', style: 'ITALIC', icon: 'fa fa-italic'},
      {label: 'Underline', style: 'UNDERLINE', icon: 'fa fa-underline'},
      // {label: 'Monospace', style: 'CODE'},
      {label: 'Strikethrough', style: 'STRIKETHROUGH', icon: 'fa fa-strikethrough'}
    ];

    this.BLOCK_TYPES = [
      {label: 'Normal', style: 'unstyled'},
      {label: 'Heading - Large', style: 'header-one'},
      {label: 'Heading - Medium', style: 'header-two'},
      {label: 'Blockquote', style: 'blockquote'},
      {label: 'Unordered List', style: 'unordered-list-item'},
      {label: 'Ordered List', style: 'ordered-list-item'},
      {label: 'Code Block', style: 'code-block'},
      {label: 'Atomic', style: 'atomic'}
    ];

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      bodyHtml: null,
      variableMenuOpen: false,
      variableMenuAnchorEl: null,
      isStyleBlockOpen: true,
      styleBlockAnchorEl: null,
      filePanelOpen: false,
    };

    this.focus = () => this.refs.editor.focus();
    this.onChange = this._onChange.bind(this);
    this.handleTouchTap = (event) => {
      event.preventDefault();
      this.setState({
        variableMenuOpen: true,
        variableMenuAnchorEl: event.currentTarget,
      });
    };
    function emitHTML(editorState) {
      const raw = convertToRaw(editorState.getCurrentContent());
      let html = draftRawToHtml(raw);
      // let newHTML = convertToHTML(editorState.getCurrentContent());
      // console.log(html);
      // console.log('newHTML');
      // console.log(newHTML);
      this.props.onBodyChange(html);
    }
    this.emitHTML = debounce(emitHTML, this.props.debounce);
    this.insertText = this._insertText.bind(this);
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    this.handleReturn = this._handleReturn.bind(this);
    this.addLink = this._addLink.bind(this);
    this.removeLink = this._removeLink.bind(this);
    this.manageLink = this._manageLink.bind(this);
    this.onCheck = _ => this.setState({isStyleBlockOpen: !this.state.isStyleBlockOpen});
    this.handlePastedText = this._handlePastedText.bind(this);
    this.handleDroppedFiles = this._handleDroppedFiles.bind(this);
    this.onDrop = this._onDrop.bind(this);
    this.handleImage = this._handleImage.bind(this);
  }

  componentWillMount() {
    if (this.props.person.emailsignature.length > 0) {
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.bodyHtml !== this.state.bodyHtml) {
      console.log('change template');
      // const content = ContentState.createFromBlockArray(htmlToContent(nextProps.bodyHtml));
      const content = convertFromHTML(nextProps.bodyHtml);
      const editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
      this.onChange(editorState);
      this.setState({bodyHtml: nextProps.bodyHtml});
    }
  }
  componentWillUnmount() {
    this.props.clearAttachments();
  }

  _onDrop(acceptedFiles, rejectedFiles) {
    const files = [...this.props.files, ...acceptedFiles];
    this.props.setAttachments(files);
  }

  _onChange(editorState) {
    let previousContent = this.state.editorState.getCurrentContent();
    this.setState({editorState});

    // only emit html when content changes
    if (previousContent !== editorState.getCurrentContent()) {
      this.emitHTML(editorState);
    }
  }

  _insertText(replaceText) {
    const {editorState} = this.state;
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const newContent = Modifier.insertText(content, selection, '{' + replaceText + '}');
    const newEditorState = EditorState.push(editorState, newContent, 'insert-fragment');
    this.onChange(newEditorState);
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
    // console.log(content.toJS(), selection.toJS(), block.toJS());
    if (block.type === 'code-block') {
      newContent = Modifier.insertText(content, selection, '\n');
      newEditorState = EditorState.push(editorState, newContent, 'add-new-line');
      this.onChange(newEditorState);
      return true;
    } else {
      return false;
    }
  }

  _handleImage(url) {
    const {editorState} = this.state;
    // const url = 'http://i.dailymail.co.uk/i/pix/2016/05/18/15/3455092D00000578-3596928-image-a-20_1463582580468.jpg';
    const entityKey = Entity.create('image', 'IMMUTABLE', {src: url});
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
    return newEditorState;
  }

  _manageLink() {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) return;
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const endOffset = selection.getEndOffset();
    const blockAtLinkBeginning = editorState.getCurrentContent().getBlockForKey(startKey);
    let i;
    let linkKey;
    let hasEntityType = false;
    for (i = startOffset; i < endOffset; i++) {
      linkKey = blockAtLinkBeginning.getEntityAt(i);
      if (linkKey !== null) {
        const type = Entity.get(linkKey).getType();
        if (type === 'LINK') {
          hasEntityType = true;
          break;
        }
      }
    }
    if (hasEntityType) {
      // REMOVE LINK
      this.removeLink();
    } else {
      // ADD LINK
      this.addLink();
    }
  }

  _addLink(/* e */) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) return;
    alertify.prompt(
      '',
      'Enter a URL', 'https://',
      (e, url) => {
        const entityKey = Entity.create('LINK', 'MUTABLE', {url});
        this.onChange(RichUtils.toggleLink(editorState, selection, entityKey));
      },
      _ => {});
  }

  _removeLink(/* e */) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      return;
    }
    this.onChange(RichUtils.toggleLink(editorState, selection, null));
  }

  _handlePastedText(text, html) {
    const {editorState} = this.state;
    const blockMap = ContentState.createFromText(text.trim()).blockMap;
    const newState = Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), blockMap);
    this.onChange(EditorState.push(editorState, newState, 'insert-fragment'));
    return true;
  }

  _handleDroppedFiles(selection, files) {
    files.map(file => {
      if (file.type === 'image/png' || file.type === 'image/jpg') {
        if (file.size <= 5000000) {
          // const newEditorState = this.handleImage();
          // this.onChange(newEditorState);
          this.props.uploadImage(file)
          .then(url => {
            const newEditorState = this.handleImage(url);
            this.onChange(newEditorState);
          });
        }
      }
    });
  }

  render() {
    const {editorState} = this.state;
    const props = this.props;
    const state = this.state;

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
      <div>
        <Dialog title='File Upload' autoScrollBodyContent open={state.filePanelOpen} onRequestClose={_ => this.setState({filePanelOpen: false})}>
          <div style={{margin: 10}} className='horizontal-center'>
            <Dropzone maxSize={5000000} onDrop={this.onDrop}>
              <div style={{margin: 10}}>Try dropping some files here, or click to select some files.</div>
            </Dropzone>
          </div>
          {props.files.length > 0 && (
            <div>
              <h4>Attached {props.files.length} files...</h4>
              <div className='row'>
              {props.files.map((file, i) =>
                <AttachmentPreview
                onRemoveClick={_ => props.setAttachments(props.files.filter((f, fi) => fi !== i))}
                key={`file-${i}`}
                name={file.name}
                preview={file.preview}
                size={file.size}
                maxLength={17}
                />)}
              </div>
            </div>
            )}
        </Dialog>
        <Popover
        open={state.variableMenuOpen}
        anchorEl={state.variableMenuAnchorEl}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        onRequestClose={_ => this.setState({variableMenuOpen: false})}
        >
          <Menu desktop>
          {props.fieldsmap.map((field, i) =>
            <MenuItem key={i} primaryText={field.name} onClick={_ => {
              this.insertText(field.name);
              this.setState({variableMenuOpen: false});
            }} />)}
          </Menu>
        </Popover>
        <div style={{marginTop: 8}}>
          <Subject
          onSubjectChange={props.onSubjectChange}
          subjectHtml={props.subjectHtml}
          />
        </div>
        <div style={{
          height: 480,
          overflowY: 'scroll',
        }}>
          <div className={className} onClick={this.focus}>
            <Editor
            blockStyleFn={getBlockStyle}
            blockRendererFn={mediaBlockRenderer}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            handleReturn={this.handleReturn}
            handlePastedText={this.handlePastedText}
            handleDroppedFiles={this.handleDroppedFiles}
            onChange={this.onChange}
            placeholder={placeholder}
            ref='editor'
            spellCheck
            />
          </div>
          <RaisedButton
          style={{margin: 18}}
          label='Insert Property'
          labelStyle={{textTransform: 'none'}}
          onClick={e => this.setState({variableMenuOpen: true, variableMenuAnchorEl: e.currentTarget})}
          />
        </div>
        {state.isStyleBlockOpen &&
          <div className='row vertical-center clearfix' style={controlsStyle}>
            <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
            inlineStyles={this.INLINE_STYLES}
            />
            <EntityControls
            editorState={editorState}
            entityControls={this.ENTITY_CONTROLS}
            />
            <ExternalControls
            editorState={editorState}
            externalControls={this.EXTERNAL_CONTROLS}
            active={props.files.length > 0}
            />
            <BlockStyleControls
            editorState={editorState}
            blockTypes={this.BLOCK_TYPES}
            onToggle={this.toggleBlockType}
            />
          </div>}
          <div className='vertical-center' style={{
            position: 'absolute',
            bottom: 3,
            width: props.width,
          }}>
          <div style={{padding: 3, marginRight: 10}}>
            <i
            className='fa fa-circle pointer'
            style={{color: state.isStyleBlockOpen ? blue200 : grey300}}
            onClick={this.onCheck}
            />
          </div>
           {props.children}
         </div>
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
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

const mapStateToProps = (state, props) => {
  return {
    files: state.emailAttachmentReducer.attached,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setAttachments: files => dispatch({type: 'SET_ATTACHMENTS', files}),
    clearAttachments: _ => dispatch({type: 'CLEAR_ATTACHMENTS'}),
    uploadImage: file => dispatch(actionCreators.uploadImage(file))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BasicHtmlEditor);
