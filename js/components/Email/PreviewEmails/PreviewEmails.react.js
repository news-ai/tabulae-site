import React, { PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import PreviewEmail from './PreviewEmail.react';

function PreviewEmails({isReceiving, previewEmails, onSendEmailClick}) {
  const onSendAllEmailsClick = _ => previewEmails.map(email => onSendEmailClick(email.id));
  return (
   (isReceiving || previewEmails.length === 0) ? <span>LOADING..</span> :
    <div>
      <RaisedButton label='Send All' primary labelStyle={{textTransform: 'none'}} onClick={onSendAllEmailsClick} />
      {previewEmails.map((email, i) => <PreviewEmail key={i} {...email} onSendEmailClick={_ => onSendEmailClick(email.id)} />)}
    </div>);
}

PreviewEmails.PropTypes = {
  isReceiving: PropTypes.bool.isRequired,
  previewEmails: PropTypes.array.isRequired, //TODO: define shape
  onSendEmailClick: PropTypes.func.isRequired
};

export default PreviewEmails;
