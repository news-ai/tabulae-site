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
import {convertFromHTML} from 'draft-convert';
import {grey500} from 'material-ui/styles/colors';
import * as actionCreators from '../../actions/AppActions';

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
        strategy: findEntities.bind(null, 'link'),
        component: Link
      },
      {
        strategy: curlyStrategy,
        component: CurlySpan
      }
    ]);

    this.state = {
      editorState: this.props.html !== null ?
        EditorState.createWithContent(convertFromHTML(this.props.html), decorator) :
        EditorState.createEmpty(decorator),
      html: this.props.html,
      editing: false,
      finished: false
    };

    this.emitHTML = (editorState) => {
      const raw = convertToRaw(editorState.getCurrentContent());
      let html = draftRawToHtml(raw);
      console.log(html);
      this.setState({html});
    };
    this.showToolbar = this._showToolbar.bind(this);
    this.onChange = this._onChange.bind(this);
    this.onSave = this._onSave.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.html !== this.state.html) {
      const content = convertFromHTML(nextProps.html);
      const editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
      this.setState({html: nextProps.html});
      this.onChange(editorState);
    }
  }

  _showToolbar(editorState) {

  }

  _onChange(editorState) {
    let previousContent = this.state.editorState.getCurrentContent();
    this.setState({editorState});
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.showToolbar(editorState);
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
    this.props.patchPerson(person).then(_ => this.setState({finished: true}));
  }

  render() {
    const {editorState} = this.state;
    const state = this.state;
    return (
      <div>
        <div style={{border: 'dotted 1px lightgrey', maxHeight: 90, overflowY: 'scroll'}}>
         <Editor
          editorState={editorState}
          onChange={this.onChange}
          placeholder='Email Signature goes here...'
          onBlur={this.onSave}
          onFocus={_ => this.setState({editing: true, finished: false})}
          />
        </div>
        <span
        style={{fontSize: '0.8em', color: grey500, float: 'right'}}
        >{state.finished ? 'Saved.' : (state.editing ? 'Editing...' : '')}</span>
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
