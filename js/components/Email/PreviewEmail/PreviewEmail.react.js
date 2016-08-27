import React, { PropTypes } from 'react';
import StaticEmailContent from './StaticEmailContent.react';

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


function PreviewEmail(props) {
  const {
      id,
      to,
      subject,
      body,
      onSendEmailClick,
      issent,
      bounced,
      bouncedreason,
      clicked,
      opened
    } = props;
  return (
    <div style={styles.contentBox}>
      <StaticEmailContent {...props} />
      {issent ? null : <button className='button' onClick={onSendEmailClick}>Send</button>}
    </div>
    );
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

export default PreviewEmail;


