import React, { PropTypes } from 'react';
import StaticEmailContent from './StaticEmailContent.react';
import RaisedButton from 'material-ui/RaisedButton';

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
  const {onSendEmailClick, issent} = props;
  return (
    <div style={styles.contentBox}>
      <StaticEmailContent {...props} />
      {issent ? null : <RaisedButton onClick={onSendEmailClick} labelStyle={{textTransform: 'none'}} label='Send' />}
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


