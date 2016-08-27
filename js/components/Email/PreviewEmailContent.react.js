import React, { PropTypes } from 'react';

const styles = {
  analytics: {
    margin: '10px'
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

const button = {
  border: '1px solid black',
  display: 'inline-block',
  // alignItems: 'center',
  // justifyContent: 'center',
  borderRadius: '5px',
  padding: '2px'
};

function CountView({label, count}) {
  return (
    <div style={button}>
      <span style={{
        marginLeft: '3px',
        marginRight: '3px'
      }}>{label}</span>
      <span style={{
        marginLeft: '3px',
        marginRight: '3px'
      }}>{count}</span>
    </div>
    );
}

function AnalyticsPanel({opened, clicked}) {
  return (<div className='email-analytics' style={styles.analytics}>
    <CountView label='Opened' count={opened} />
    <CountView label='Clicked' count={clicked} />
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


