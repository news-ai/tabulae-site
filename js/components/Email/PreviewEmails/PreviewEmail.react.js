import React, {Component, PropTypes} from 'react';
import StaticEmailContent from './StaticEmailContent.react';
import RaisedButton from 'material-ui/RaisedButton';
import PreviewEditor from './PreviewEditor.react';
import {connect} from 'react-redux';
import * as stagingActions from '../actions';

const styles = {
  contentBox: {
    border: '1px dotted lightgray',
    margin: '10px',
    padding: '5px',
  },
  bounced: {
    color: 'red'
  }
};


class PreviewEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bodyHtml: props.body,
      subjectHtml: props.subject,
      onEditMode: false
    };
    this.updateBodyHtml = html => this.setState({body: html});
    this.onSubjectChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({subject});
    };
    this.toggleEditMode = _ => this.setState({onEditMode: true});
    this.onSave = this._onSave.bind(this);
    this.onCancel = _ => this.setState({bodyHtml: props.body, subjectHtml: props.subject, onEditMode: false})
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
    props.patchEmail(emailObj);
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div style={styles.contentBox}>
        <div>
          <RaisedButton label={state.onEditMode ? 'Save' : 'Edit'} onClick={state.onEditMode ? this.onSave : this.toggleEditMode}/>
          {state.onEditMode && <RaisedButton label='Cancel' onClick={this.onCancel}/>}
        </div>
        {state.onEditMode ?
          <PreviewEditor
          width={700}
          bodyHtml={state.bodyHtml}
          subjectHtml={state.subjectHtml}
          onBodyChange={html => this.updateBodyHtml(html) }
          onSubjectChange={this.onSubjectChange}
          debounce={500}
          person={props.person}
          /> :
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
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchEmail: emailBody => dispatch(stagingActions.patchEmail(props.id, emailBody))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PreviewEmail);

