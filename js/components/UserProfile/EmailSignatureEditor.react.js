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
      editorState: EditorState.createEmpty(decorator),
      html: null
    };

    this.emitHTML = (editorState) => {
      const raw = convertToRaw(editorState.getCurrentContent());
      let html = draftRawToHtml(raw);
      this.setState({html});
    };

    this.onChange = (editorState) => this.setState({editorState});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.html !== this.state.html) {
      const content = ContentState.createFromText(nextProps.subjectHtml);
      const editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
      this.setState({html: nextProps.html});
      this.onChange(editorState);
    }
  }

  render() {
    const {editorState} = this.state;
    return (
       <Editor
        editorState={editorState}
        onChange={this.onChange}
        placeholder='Email Signature goes here...'
      />
      );
  }
}

const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailSignatureEditor);
