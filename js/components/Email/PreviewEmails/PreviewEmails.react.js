import React, {PropTypes, Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import PreviewEmail from './PreviewEmail.react';
import Waiting from 'components/Waiting';
import Fuse from 'fuse.js';
import TextField from 'material-ui/TextField';

const fuseOptions = {
  threshold: 0.6,
  shouldSort: true,
  keys: [{
    name: 'firstname',
    weight: 0.7
  }, {
    name: 'lastname',
    weight: 0.7
  }, {
    name: 'to',
    weight: 0.5
  }, {
    name: 'subject',
    weight: 0.2
  }, {
    name: 'body',
    weight: 0.2
  }]
};

class PreviewEmails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberDraftEmails: 0,
      searchValue: '',
      searchOn: false,

    };
    this.onChange = this._onChange.bind(this);
    this.fuse = new Fuse(this.props.previewEmails, fuseOptions);
  }

  _onChange(e) {
    const value = e.target.value;
    this.setState({searchValue: value});
    if (value.length > 0) {
      const results = this.fuse.search(value);
      this.setState({searchOn: true, results});
    } else {
      this.setState({searchOn: false});
    }
  }

  render() {
    const state = this.state;
    const {sendLater, isReceiving, onSendEmailClick} = this.props;
    const previewEmails = state.searchOn ? state.results : this.props.previewEmails;
    const onSendAllEmailsClick = _ => previewEmails.map(email => onSendEmailClick(email.id));

    let sendAllButtonLabel = sendLater ? 'Schedule All Emails' : 'Send All';
    if (state.numberDraftEmails > 0) sendAllButtonLabel = 'Draft in Progess';

    let renderNode;
    if (previewEmails.length === 0) renderNode = <span>All done.</span>;
    else {
      renderNode = (
      <div>
        <RaisedButton disabled={state.numberDraftEmails > 0} label={sendAllButtonLabel} primary labelStyle={{textTransform: 'none'}} onClick={onSendAllEmailsClick} />
        {previewEmails.map((email, i) =>
          <PreviewEmail
          turnOnDraft={_ => {
            window.Intercom('trackEvent', 'use_preview_draft');
            this.setState({numberDraftEmails: state.numberDraftEmails + 1});
          }}
          turnOffDraft={_ => this.setState({numberDraftEmails: state.numberDraftEmails - 1})}
          sendLater={sendLater}
          key={`preview-email-${i}`}
          {...email}
          onSendEmailClick={_ => {
            window.Intercom('trackEvent', 'sent_email', {numSentEmails: previewEmails.length, scheduled: sendLater});
            onSendEmailClick(email.id);
          }}
          />)}
      </div>
      );
    }
    return (
      <div style={{padding: 10}}>
        <Waiting style={{position: 'absolute', right: 15, top: 15}} isReceiving={isReceiving} text='Generating emails...' textStyle={{marginTop: '20px'}}/>
        <div>
          <TextField id='preview_searchValue' value={state.searchValue} onChange={this.onChange}/>
        </div>
        {renderNode}
      </div>);
  }
}

PreviewEmails.PropTypes = {
  isReceiving: PropTypes.bool.isRequired,
  previewEmails: PropTypes.array.isRequired,
  onSendEmailClick: PropTypes.func.isRequired,
};

export default PreviewEmails;
