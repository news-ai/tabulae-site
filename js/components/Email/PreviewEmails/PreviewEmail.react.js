import React, {Component, PropTypes} from 'react';
import StaticEmailContent from './StaticEmailContent.react';
import RaisedButton from 'material-ui/RaisedButton';
import GeneralEditor from '../GeneralEditor/GeneralEditor2.react';
import {connect} from 'react-redux';
import {grey800} from 'material-ui/styles/colors';
import * as stagingActions from '../actions';
import FontIcon from 'material-ui/FontIcon';

const styles = {
  contentBox: {
    border: '1px dotted lightgray',
    margin: '10px',
    padding: '5px',
    position: 'relative',
    overflowWrap: 'break-word'
  },
  bounced: {
    color: 'red'
  }
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

const PauseOverlay = ({message}: {message: string}) => (
  <div style={Object.assign({}, styles.contentBox, emailPanelPauseOverlay)}>
    <div style={{margin: 0}}>
    <span style={{color: 'white', fontSize: '1.3em'}}>Image is loading</span><FontIcon style={{margin: '0 5px'}} color='white' className='fa fa-spin fa-spinner'/></div>
  </div>);

class PreviewEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bodyHtml: props.body,
      rawBodyContentState: undefined,
      subjectHtml: props.subject,
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
    this.onCancel = _ => this.setState({bodyHtml: props.body, subjectHtml: props.subject, onEditMode: false, rawBodyContentState: props.savedContentState});
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.body !== nextProps.body) {
      this.setState({bodyHtml: nextProps.body, subjectHtml: nextProps.subject});
    }
  }

  _onSave() {
    const props = this.props;
    const state = this.state;
    let emailObj = {
      listid: props.listid,
      to: props.to,
      subject: state.subject,
      body: state.body,
      contactid: props.id,
      templateid: props.templateid,
      cc: props.cc,
      bcc: props.bcc,
      fromemail: props.fromemail
    };
    props.patchEmail(emailObj)
    .then(_ => this.setState({onEditMode: false}));
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div style={styles.contentBox}>
        <div style={{position: 'absolute', right: 10, top: 10}}>
          <RaisedButton
          label={state.onEditMode ? 'Save' : 'Edit'}
          onClick={_ => {
            if (state.onEditMode) {
              props.turnOffDraft();
              this.onSave();
            } else {
              if (!state.rawBodyContentState) {
                this.setState({rawBodyContentState: props.savedContentState}, _ => {
                  props.turnOnDraft();
                  this.toggleEditMode();
                });
              } else {
                props.turnOnDraft();
                this.toggleEditMode();
              }
            }
          }}/>
        {state.onEditMode &&
          <RaisedButton label='Cancel' onClick={_ => {
            props.turnOffDraft();
            this.onCancel();
          }}/>}
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
        {!state.onEditMode && <div style={{margin: '10px 0'}}>
          <RaisedButton onClick={props.onSendEmailClick} labelStyle={{textTransform: 'none'}} label={props.sendLater ? 'Schedule' : 'Send'} />
        </div>}
      </div>
      );
  }
}


PreviewEmail.PropTypes = {
  id: PropTypes.number.isRequired,
  to: PropTypes.string.isRequired,
  subject: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  onSendEmailClick: PropTypes.func,
  issent: PropTypes.bool.isRequired,
  bounced: PropTypes.bool.isRequired,
  bouncedreason: PropTypes.string,
  clicked: PropTypes.number,
  opened: PropTypes.number
};

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

