import React, {PropTypes, Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import PreviewEmail from './PreviewEmail.react';
import Waiting from 'components/Waiting';

class PreviewEmails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberDraftEmails: 0
    };
  }

  render() {
    const state = this.state;
    const {sendLater, isReceiving, previewEmails, onSendEmailClick} = this.props;
    const onSendAllEmailsClick = _ => previewEmails.map(email => onSendEmailClick(email.id));

    let renderNode;
    if (previewEmails.length === 0) renderNode = <span>All done.</span>;
    else {
      renderNode = (
      <div>
        <RaisedButton label={sendLater ? 'Schedule All Emails' : 'Send All'} primary labelStyle={{textTransform: 'none'}} onClick={onSendAllEmailsClick} />
        {previewEmails.map((email, i) =>
          <PreviewEmail
          turnOnDraft={_ => this.setState({numberDraftEmails: state.numberDraftEmails + 1})}
          turnOffDraft={_ => this.setState({numberDraftEmails: state.numberDraftEmails - 1})}
          sendLater={sendLater}
          key={`preview-email-${i}`}
          {...email}
          onSendEmailClick={_ => onSendEmailClick(email.id)}
          />)}
      </div>
      );
    }
    return (
      <div style={{padding: 10}}>
        <Waiting isReceiving={isReceiving} text='Generating emails...' textStyle={{marginTop: '20px'}}/>
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
