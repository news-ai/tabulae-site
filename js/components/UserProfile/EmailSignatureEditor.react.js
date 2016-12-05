import React, {PropTypes, Component} from 'react';
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
import draftRawToHtml from '../Email/EmailPanel/utils/draftRawToHtml';
import Link from '../Email/EmailPanel/components/Link';
import CurlySpan from '../Email/EmailPanel/components/CurlySpan.react';
import EntityControls from '../Email/EmailPanel/components/EntityControls';
import {convertFromHTML} from 'draft-convert';
import {grey500} from 'material-ui/styles/colors';
import * as actionCreators from '../../actions/AppActions';
import alertify from 'alertifyjs';

export function findEntities(entityType, contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === entityType
      );
    },
    callback
  );
}

const CURLY_REGEX = /{([^}]+)}/g;

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

export function curlyStrategy(contentBlock, callback) {
  findWithRegex(CURLY_REGEX, contentBlock, callback);
}

class EmailSignatureEditor extends Component {
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
    this.CONVERT_CONFIGS = {
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
            const entityKey = Entity.create('image', 'IMMUTABLE', {
              src,
              size,
              imageLink
            });
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
      },
    };

    this.ENTITY_CONTROLS = [
      {label: 'Manage Link', action: this._manageLink.bind(this), icon: 'fa fa-link', entityType: 'LINK'}
    ];

    this.state = {
      editorState: this.props.html !== null ?
        EditorState.createWithContent(convertFromHTML(this.CONVERT_CONFIGS)(this.props.html), decorator) :
        EditorState.createEmpty(decorator),
      html: this.props.html,
      editing: false,
      showToolbar: false,
      dirty: false
    };

    this.emitHTML = (editorState) => {
      const raw = convertToRaw(editorState.getCurrentContent());
      let html = draftRawToHtml(raw);
      if (this.state.dirty && html === this.props.html) this.setState({dirty: false});
      else this.setState({dirty: true});
      this.setState({html});
    };
    this.showToolbar = this._showToolbar.bind(this);
    this.onChange = this._onChange.bind(this);
    this.onSave = this._onSave.bind(this);
    this.addLink = this._addLink.bind(this);
    this.removeLink = this._removeLink.bind(this);
    this.getSelectedBlockElement = this.getSelectedBlockElement.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.html !== this.state.html) {
      const content = convertFromHTML(nextProps.html);
      const editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
      this.setState({html: nextProps.html});
      this.onChange(editorState);
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
        this.setState({showToolbar: false});
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

  getSelectedBlockElement() {
    let selection = window.getSelection();
    if (selection.rangeCount === 0) return null;
    let node = selection.getRangeAt(0).startContainer;
    do {
      if (node.getAttribute && node.getAttribute('data-block') === 'true')
        return node;
      node = node.parentNode;
    } while (node !== null);
    return null;
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

  _showToolbar(rect) {
    this.setState({showToolbar: true, rect});
  }

  _onChange(editorState) {
    let previousContent = this.state.editorState.getCurrentContent();
    this.setState({editorState});
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const node = this.getSelectedBlockElement();
      if (node !== null) {
        const rect = node.getBoundingClientRect();
        this.showToolbar(rect);
      }
    } else {
      this.setState({showToolbar: false});
    }
    // only emit html when content changes
    if (previousContent !== editorState.getCurrentContent()) {
      this.emitHTML(editorState);
    }
  }

  _onSave() {
    const oldPerson = this.props.person;
    const person = {
      firstname: oldPerson.firstname,
      lastname: oldPerson.lastname,
      getdailyemails: oldPerson.getdailyemails,
      emailsignature: this.state.html
    };
    this.setState({editing: false});
    this.props.patchPerson(person).then(_ => this.setState({dirty: false}));
  }

  render() {
    const {editorState} = this.state;
    const state = this.state;
    return (
      <div style={{paddingLeft: 40}}>
        <div style={{border: 'dotted 1px lightgrey', height: 200, width: 400, overflowY: 'scroll'}}>
         <Editor
          editorState={editorState}
          onChange={this.onChange}
          placeholder='Email Signature goes here...'
          onFocus={_ => this.setState({editing: true, finished: false})}
          />
        </div>
        {state.showToolbar &&
          <div
          style={{
            position: 'fixed',
            top: state.rect.top,
            left: state.rect.left - 20,
            zIndex: 10
          }}>
            <EntityControls
            editorState={editorState}
            entityControls={this.ENTITY_CONTROLS}
            />
          </div>
          }
        {state.dirty && <button className='button tiny' onClick={this.onSave}>Save</button>}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person,
    html: state.personReducer.person.emailsignature || null
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchPerson: body => dispatch(actionCreators.patchPerson(body)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailSignatureEditor);
