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
  strong: {
    color: 'gray', marginRight: '15px'
  }
};

function createMarkUp(html) {
  return { __html: html };
}

function PreviewEmailContent({id, to, subject, body, onSendEmailClick, issent}) {
  return (
    <div style={styles.contentBox}>
      <div className='u-full-width' style={styles.content}>
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


