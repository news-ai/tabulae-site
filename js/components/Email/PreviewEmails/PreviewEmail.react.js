import React, {Component} from 'react';
import StaticEmailContent from './StaticEmailContent.react';
import RaisedButton from 'material-ui/RaisedButton';
import GeneralEditor from '../GeneralEditor/GeneralEditor2.react';
import {connect} from 'react-redux';
import {grey800} from 'material-ui/styles/colors';
import * as stagingActions from '../actions';
import FontIcon from 'material-ui/FontIcon';
import {_getter} from 'components/ListTable/helpers';

const styles = {
  contentBox: {
    border: '1px dotted lightgray',
    margin: '10px',
    padding: '5px',
    position: 'relative',
    overflowWrap: 'break-word'
  },
  bounced: {color: 'red'},
  btnLabel: {textTransform: 'none'},
  btnContainer: {margin: '30px 10px 10px 10px'},
  topButtonContainer: {position: 'absolute', right: 10, top: 10}
};

const emailPanelPauseOverlay = {
  backgroundColor: grey800,
  zIndex: 300,
  position: 'absolute',
  opacity: 0.7,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const pauseOverlayStyle = {
  container: {margin: 0},
  text: {color: '#ffffff', fontSize: '1.3em'}
};

const PauseOverlay = ({message}: {message: string}) => (
  <div style={Object.assign({}, styles.contentBox, emailPanelPauseOverlay)}>
    <div style={pauseOverlayStyle.container}>
      <span style={pauseOverlayStyle.text}>Image is loading</span><FontIcon style={{margin: '0 5px'}} color='#ffffff' className='fa fa-spin fa-spinner'/>
    </div>
  </div>);

function replaceAll(html: string, contact: Object, fieldsmap: Array<Object>): string {
  if (html === null || html.length === 0) return {html: '', numMatches: 0};
  let newHtml = html;
  let matchCount = {};
  fieldsmap.map(fieldObj => {
    let value = '';
    const replaceValue = _getter(contact, fieldObj);
    if (replaceValue) value = replaceValue;
    const regexValue = new RegExp('\{' + fieldObj.name + '\}', 'g');
    // count num custom vars used
    const matches = newHtml.match(regexValue);
    if (matches !== null) matchCount[fieldObj.name] = matches.length;
    newHtml = newHtml.replace(regexValue, value);
  });
  const numMatches = Object.keys(matchCount).length;
  if (numMatches > 0) window.Intercom('trackEvent', 'num_custom_variables', {num_custom_variables: Object.keys(matchCount).length})
  return {html: newHtml, numMatches};
}

class PreviewEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bodyHtml: this.props.body,
      rawBodyContentState: undefined,
      subjectHtml: this.props.subject,
      onEditMode: false
    };
    this.updateBodyHtml = (html, raw) => {
      // console.log(html);
      this.setState({body: html, rawBodyContentState: raw});
    };
    this.onSubjectChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({subject});
    };
    this.toggleEditMode = _ => this.setState({onEditMode: true});
    this.onSave = this._onSave.bind(this);
    this.onCancel = _ => {
      this.props.turnOffDraft();
      this.setState({bodyHtml: this.props.body, subjectHtml: this.props.subject, onEditMode: false, rawBodyContentState: this.props.savedContentState});
    };
    this.onEditSaveClick = this._onEditSaveClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.body !== nextProps.body) {
      this.setState({bodyHtml: nextProps.body, subjectHtml: nextProps.subject});
    }
  }

  _onSave() {
    const props = this.props;
    const state = this.state;
    let subject = state.subject || props.subject;
    let body = state.body || props.body;
    subject = replaceAll(subject, props.contact, props.fieldsmap).html;
    body = replaceAll(body, props.contact, props.fieldsmap).html;

    let emailObj = {
      listid: props.listid,
      to: props.to,
      subject: subject,
      body: body,
      contactid: props.id,
      templateid: props.templateid,
      cc: props.cc,
      bcc: props.bcc,
      fromemail: props.fromemail
    };
    props.patchEmail(emailObj)
    .then(_ => this.setState({onEditMode: false}));
  }

  _onEditSaveClick() {
    if (this.state.onEditMode) {
      this.props.turnOffDraft();
      this.onSave();
    } else {
      if (!this.state.rawBodyContentState) {
        this.setState({rawBodyContentState: this.props.savedContentState}, _ => {
          this.props.turnOnDraft();
          this.toggleEditMode();
        });
      } else {
        this.props.turnOnDraft();
        this.toggleEditMode();
      }
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div style={styles.contentBox}>
        <div style={styles.topButtonContainer}>
          <RaisedButton label={state.onEditMode ? 'Save' : 'Edit'} onClick={this.onEditSaveClick}/>
        {state.onEditMode &&
          <RaisedButton label='Cancel' onClick={this.onCancel}/>}
        </div>
        {state.onEditMode ?
          <div>
          {props.isImageReceiving &&
            <PauseOverlay message='Image is Loading...'/>}
            <GeneralEditor
            width={600}
            onEditMode={state.onEditMode}
            rawBodyContentState={state.rawBodyContentState}
            subjectHtml={state.subjectHtml}
            onBodyChange={this.updateBodyHtml}
            onSubjectChange={this.onSubjectChange}
            debounce={500}
            />
          </div> :
          <StaticEmailContent {...props} />}
        {!state.onEditMode &&
          <div style={styles.btnContainer}>
            <RaisedButton
            onClick={props.onSendEmailClick}
            labelStyle={styles.btnLabel}
            label={props.sendLater ? 'Schedule' : 'Send'}
            />
          </div>}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    email: state.stagingReducer[props.emailId],
    person: state.personReducer.person,
    savedContentState: state.emailDraftReducer.editorState,
    isImageReceiving: state.emailImageReducer.isReceiving,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchEmail: emailBody => dispatch(stagingActions.patchEmail(props.id, emailBody)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PreviewEmail);

