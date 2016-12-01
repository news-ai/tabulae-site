import React, { PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import PreviewEmail from './PreviewEmail.react';
import Waiting from '../../Waiting';

function PreviewEmails({sendLater, isReceiving, previewEmails, onSendEmailClick}) {
  const onSendAllEmailsClick = _ => previewEmails.map(email => onSendEmailClick(email.id));
  let renderNode;
  if (isReceiving) renderNode = <Waiting isReceiving={isReceiving} text='Generating emails...' textStyle={{marginTop: '20px'}}/>;
  else if (previewEmails.length === 0) renderNode = <span>All done.</span>;
  else {
    renderNode = (
    <div>
      <RaisedButton label={sendLater ? 'Schedule All Emails' : 'Send All'} primary labelStyle={{textTransform: 'none'}} onClick={onSendAllEmailsClick} />
      {previewEmails.map((email, i) => <PreviewEmail sendLater={sendLater} key={i} {...email} onSendEmailClick={_ => onSendEmailClick(email.id)} />)}
    </div>
    );
  }
  return <div style={{padding: 10}}>{renderNode}</div>;
}

PreviewEmails.PropTypes = {
  isReceiving: PropTypes.bool.isRequired,
  previewEmails: PropTypes.array.isRequired, //TODO: define shape
  onSendEmailClick: PropTypes.func.isRequired,
};

export default PreviewEmails;
