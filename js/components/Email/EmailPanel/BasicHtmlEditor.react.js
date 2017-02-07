import React from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import find from 'lodash/find';
import {connect} from 'react-redux';
import Draft, {
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
import {actions as imgActions} from 'components/Email/EmailPanel/Image';
import {INLINE_STYLES, BLOCK_TYPES, POSITION_TYPES, FONTSIZE_TYPES} from './utils/typeConstants';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Dropzone from 'react-dropzone';
import {blue100, blue200, grey300} from 'material-ui/styles/colors';

import Subject from './Subject.react';
import Link from './components/Link';
import CurlySpan from './components/CurlySpan.react';
import EntityControls from './components/EntityControls';
import InlineStyleControls from './components/InlineStyleControls';
import BlockStyleControls from './components/BlockStyleControls';
import FontSizeControls from './components/FontSizeControls';
import ExternalControls from './components/ExternalControls';
import PositionStyleControls from './components/PositionStyleControls';
import Image from './Image/Image.react';
import FileWrapper from './FileWrapper.react';
import alertify from 'alertifyjs';
import sanitizeHtml from 'sanitize-html';
import Immutable from 'immutable';

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
  borderRadius: '0.9em',
  backgroundColor: 'white',
};

const Media = props => {
  const {block, contentState} = props;
  const entity = contentState.getEntity(block.getEntityAt(0));
  const {src} = entity.getData();
  const type = entity.getType();

  let media;
  if (type === 'image') {
    media = <Image src={src}/>;
  }
  return media;
};

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
        isActive: _ => this.props.files.length > 0
      },
      {
        label: 'Image Upload',
        onToggle: _ => this.imgDropzone.open(),
        icon: 'fa fa-camera',
        isActive: _ => false
      }
    ];

    this.CONVERT_CONFIGS = {
      htmlToStyle: (nodeName, node, currentStyle) => {
        if (nodeName === 'span') {
          const fontSize = node.style.fontSize.substring(0, node.style.fontSize.length - 2);
          const foundType = find(FONTSIZE_TYPES, type => type.label === fontSize);
          if (foundType) return currentStyle.add(foundType.style);
          return currentStyle;
        } else {
          return currentStyle;
        }
      },
      htmlToEntity: (nodeName, node) => {
        if (nodeName === 'a') {
          if (node.firstElementChild === null) {
            // LINK ENTITY
            return Entity.create('LINK', 'MUTABLE', {url: node.href});
          } else if (node.firstElementChild.nodeName === 'IMG') {
            // IMG ENTITY
            const imgNode = node.firstElementChild;
            const src = imgNode.src;
            const size = parseFloat(imgNode.style['max-height']) / 100;
            const imageLink = node.href;
            const entityKey = Entity.create('image', 'IMMUTABLE', {src, size, imageLink});
            this.props.saveImageData(src);
            this.props.saveImageEntityKey(src, entityKey);
            this.props.setImageSize(src, size);
            if (imageLink.length > 0) {
              this.props.setImageLink(src, imageLink);
            } else {
              this.props.setImageLink(src, undefined);
            }
            return entityKey;
          }
        }
      },
      htmlToBlock: (nodeName, node) => {
        if (nodeName === 'figure') {
          return {
            type: 'atomic',
            data: {}
          };
        }
        if (nodeName === 'p' || nodeName === 'div') {
          if (node.style.textAlign === 'center') {
            return {
              type: 'center-align',
              data: {}
            };
          } else if (node.style.textAlign === 'right') {
            return {
              type: 'right-align',
              data: {}
            };
          } else if (node.style.textAlign === 'justify') {
            return {
              type: 'justify-align',
              data: {}
            };
          }
        }
      },
    };

    this.state = {
      editorState: !isEmpty(this.props.bodyHtml) ?
        EditorState.createWithContent(convertFromHTML(this.CONVERT_CONFIGS)(this.props.bodyHtml), decorator) :
        EditorState.createEmpty(decorator),
      bodyHtml: this.props.bodyHtml || null,
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
      // console.log(html);
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
    this.handleImage = this._handleImage.bind(this);
    this.onImageUploadClicked = this._onImageUploadClicked.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.bodyHtml !== this.state.bodyHtml) {
      console.log('change template');
      // console.log(nextProps.bodyHtml);
      const configuredContent = convertFromHTML(this.CONVERT_CONFIGS)(nextProps.bodyHtml);
      // const content = ContentState.createFromBlockArray(htmlToContent(nextProps.bodyHtml));
      // const content = convertFromHTML(nextProps.bodyHtml);
      const editorState = EditorState.push(this.state.editorState, configuredContent, 'insert-fragment');
      this.onChange(editorState);
      this.setState({bodyHtml: nextProps.bodyHtml});
    }

    if (!this.props.updated && nextProps.updated) {
      const emailImageObject = nextProps.emailImageReducer[nextProps.current];
      const entityKey = emailImageObject.entityKey;
      Entity.replaceData(entityKey, {
        src: nextProps.current,
        size: `${~~(emailImageObject.size * 100)}%`,
        imageLink: emailImageObject.imageLink || '#'
      });
      this.props.onImageUpdated();
      this.emitHTML(this.state.editorState);
    }
  }
  componentWillUnmount() {
    this.props.clearAttachments();
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
      return 'not-handled';
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
      return 'handled';
    }
    return 'not-handled';
  }

  _manageLink() {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    if (selection.isCollapsed()) return;
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const endOffset = selection.getEndOffset();
    const blockAtLinkBeginning = contentState.getBlockForKey(startKey);
    let i;
    let linkKey;
    let hasEntityType = false;
    for (i = startOffset; i < endOffset; i++) {
      linkKey = blockAtLinkBeginning.getEntityAt(i);
      if (linkKey !== null) {
        const type = contentState.getEntity(linkKey).getType();
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
      'Enter a URL',
      'https://',
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
    let newState;
    let blockMap;
    // let blockArray;
    let contentState;

    if (html) {
      // console.log(html);
      const saneHtml = sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['span']),
        allowedAttributes: {
          p: ['style'],
          div: ['style'],
          span: ['style'],
          a: ['href']
        }
      });
      // console.log(saneHtml);
      contentState = convertFromHTML(this.CONVERT_CONFIGS)(saneHtml);
      blockMap = contentState.getBlockMap();
    } else {
      contentState = ContentState.createFromText(text.trim());
      blockMap = contentState.blockMap;
    }
    newState = Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), blockMap);
    this.onChange(EditorState.push(editorState, newState, 'insert-fragment'));

    return true;
  }

  _handleImage(url) {
    const {editorState} = this.state;
    // const url = 'http://i.dailymail.co.uk/i/pix/2016/05/18/15/3455092D00000578-3596928-image-a-20_1463582580468.jpg';
    const entityKey = Entity.create('image', 'IMMUTABLE', {
      src: url,
      size: `${~~(this.props.emailImageReducer[url].size * 100)}%`,
      imageLink: '#'
    });
    this.props.saveImageEntityKey(url, entityKey);

    const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
    return newEditorState;
  }

  _handleDroppedFiles(selection, files) {
    files.map(file => {
      if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        if (file.size <= 5000000) {
          // const newEditorState = this.handleImage();
          // this.onChange(newEditorState);
          this.props.uploadImage(file)
          .then(url => {
            const newEditorState = this.handleImage(url);
            this.onChange(newEditorState);
          });
        } else {
          alertify.warning(`Image size cannot exceed 5MB. The image dropped was ${(file.size / 1000000).toFixed(2)}MB`);
        }
      } else {
        alertify.warning(`Image type must be PNG or JPEG. The file dropped was ${file.type}.`);
      }
    });
  }

  _onImageUploadClicked(acceptedFiles, rejectedFiles) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    this.handleDroppedFiles(selection, acceptedFiles);
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
        <FileWrapper open={state.filePanelOpen} onRequestClose={_ => this.setState({filePanelOpen: false})}/>
        <Popover
        open={state.variableMenuOpen}
        anchorEl={state.variableMenuAnchorEl}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        onRequestClose={_ => this.setState({variableMenuOpen: false})}
        >
          <Menu desktop>
          {props.fieldsmap
            .filter(field => !field.hidden)
            .map((field, i) =>
            <MenuItem key={i} primaryText={field.name} onClick={_ => {
              this.insertText(field.name);
              this.setState({variableMenuOpen: false});
            }} />)}
          </Menu>
        </Popover>
        <Subject
        onSubjectChange={props.onSubjectChange}
        subjectHtml={props.subjectHtml}
        />
        <div style={{
          height: 480,
          overflowY: 'scroll',
        }}>
          <div className={className} onClick={this.focus}>
            <Editor
            blockStyleFn={getBlockStyle}
            blockRendererFn={mediaBlockRenderer}
            blockRenderMap={extendedBlockRenderMap}
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
          style={{margin: 10}}
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
            inlineStyles={INLINE_STYLES}
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
            <Dropzone ref={(node) => (this.imgDropzone = node)} style={{display: 'none'}} onDrop={this.onImageUploadClicked}/>
            <PositionStyleControls
            editorState={editorState}
            blockTypes={POSITION_TYPES}
            onToggle={this.toggleBlockType}
            />
            <FontSizeControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
            inlineStyles={FONTSIZE_TYPES}
            />
            <BlockStyleControls
            editorState={editorState}
            blockTypes={BLOCK_TYPES}
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
            accept='image/*'
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
  'SIZE-5': {fontSize: 5.5},
  'SIZE-6': {fontSize: 6},
  'SIZE-7.5': {fontSize: 7.5},
  'SIZE-8': {fontSize: 8},
  'SIZE-9': {fontSize: 9},
  'SIZE-10': {fontSize: 10},
  'SIZE-10.5': {fontSize: 10.5},
  'SIZE-11': {fontSize: 11},
  'SIZE-12': {fontSize: 12},
  'SIZE-14': {fontSize: 14},
  'SIZE-16': {fontSize: 16},
  'SIZE-18': {fontSize: 18},
  'SIZE-20': {fontSize: 20},
  'SIZE-22': {fontSize: 22},
  'SIZE-24': {fontSize: 24},
  'SIZE-26': {fontSize: 26},
  'SIZE-28': {fontSize: 28},
  'SIZE-36': {fontSize: 36},
  'SIZE-48': {fontSize: 48},
  'SIZE-72': {fontSize: 72},
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

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    case 'right-align':
      return 'RichEditor-right-align';
    case 'left-align':
      return 'RichEditor-left-align';
    case 'center-align':
      return 'RichEditor-center-align';
    case 'justify-align':
      return 'RichEditor-justify-align';
    default:
      return null;
  }
}

// const RightAlign = props => <div style={{backgroundColor: 'red'}}>{props.children}</div>;

const blockRenderMap = Immutable.Map({
  'right-align': {
    element: 'div',
  },
  'center-align': {
    element: 'div'
  },
  'justify-align': {
    element: 'div'
  }
});


const extendedBlockRenderMap = Draft.DefaultDraftBlockRenderMap.merge(blockRenderMap);

const mapStateToProps = (state, props) => {
  return {
    files: state.emailAttachmentReducer.attached,
    emailImageReducer: state.emailImageReducer,
    updated: state.emailImageReducer.updated,
    current: state.emailImageReducer.current
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setAttachments: files => dispatch({type: 'SET_ATTACHMENTS', files}),
    clearAttachments: _ => dispatch({type: 'CLEAR_ATTACHMENTS'}),
    uploadImage: file => dispatch(imgActions.uploadImage(file)),
    saveImageData: src => dispatch({type: 'IMAGE_UPLOAD_RECEIVE', src}),
    saveImageEntityKey: (src, key) => dispatch({type: 'SAVE_IMAGE_ENTITY_KEY', entityKey: key, src}),
    setImageSize: (src, size) => dispatch({type: 'SET_IMAGE_SIZE', size, src: src}),
    setImageLink: (src, imageLink) => dispatch({type: 'SET_IMAGE_LINK', imageLink, src: src}),
    onImageUpdated: _ => dispatch({type: 'ON_IMAGE_UPDATED'})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BasicHtmlEditor);
