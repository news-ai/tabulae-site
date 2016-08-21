import React, { PropTypes } from 'react';

const styles = {
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
  sendButton: {
    // float: 'right'
  }
};

function createMarkUp(html) {
  return { __html: html };
}

function PreviewEmailContent({id, to, subject, body, sendEmail, issent}) {
  return (
    <div style={styles.contentBox}>
      <div className='u-full-width' style={styles.content}>
        <p style={styles.span}><strong style={{color: 'gray', marginRight: '15px'}}>To</strong>{to}</p>
        <p style={styles.span}><strong style={{color: 'gray', marginRight: '15px'}}>Subject</strong>{subject}</p>
        <div style={styles.span} dangerouslySetInnerHTML={createMarkUp(body)} />
      </div>
      <button style={styles.sendButton} onClick={sendEmail}>Send</button>
    </div>
    );
}

PreviewEmailContent.PropTypes = {
};

export default PreviewEmailContent;


