import React, { PropTypes } from 'react';

const styles = {
  analytics: {

  },
  contentBox: {
    border: '1px dotted lightgray',
    margin: '10px',
    padding: '5px',
  },
  content: {
    // margin: '5px',
  },
  span: {
    marginLeft: '5px',
    marginRight: '5px',
    marginBottom: '10px'
  },
  strong: {
    color: 'gray', marginRight: '15px'
  },
  bounced: {
    color: 'red'
  }
};

function createMarkUp(html) {
  return { __html: html };
}

function AnalyticsPanel({opened, clicked}) {
  return (<div className='email-analytics' style={styles.analytics}>
    <p>Opened: {opened}</p>
    <p>Clicked: {clicked}</p>
  </div>);
}

function PreviewEmailContent(props) {
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
      <div className='u-full-width' style={styles.content}>
        {bounced ? <p>Email bounced because of: <span style={styles.bounced}>{bouncedreason}</span></p> : null}
        {issent ? <AnalyticsPanel {...props} /> : null}
        <p style={styles.span}><strong style={styles.strong}>To</strong>{to}</p>
        <p style={styles.span}><strong style={styles.strong}>Subject</strong>{subject}</p>
        <div style={styles.span} dangerouslySetInnerHTML={createMarkUp(body)} />
      </div>
      {issent ? null : <button className='button' onClick={onSendEmailClick}>Send</button>}
    </div>
    );
}

PreviewEmailContent.PropTypes = {
};

export default PreviewEmailContent;


