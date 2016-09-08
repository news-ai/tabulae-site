import React, { PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import PreviewEmail from './PreviewEmail.react';

function PreviewEmails({isReceiving, previewEmails, onSendEmailClick}) {
  const onSendAllEmailsClick = _ => previewEmails.map(email => onSendEmailClick(email.id));
  let renderNode;
  if (isReceiving) renderNode = <span>Loading...</span>;
  else if (previewEmails.length === 0) renderNode = <span>All done.</span>;
  else {
    renderNode = (
    <div>
      <RaisedButton label='Send All' primary labelStyle={{textTransform: 'none'}} onClick={onSendAllEmailsClick} />
      {previewEmails.map((email, i) => <PreviewEmail key={i} {...email} onSendEmailClick={_ => onSendEmailClick(email.id)} />)}
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
