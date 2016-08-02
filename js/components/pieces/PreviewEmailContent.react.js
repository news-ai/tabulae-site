import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { globalStyles } from '../../constants/StyleConstants';
import Radium from 'radium';

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
      <div style={styles.content}>
        <label>email</label>
        <span style={styles.span}>{to}</span>
        <label>subject</label>
        <span style={styles.span}>{subject}</span>

        <label>Sent</label>
        <span style={styles.span}>{String(issent)}</span>
        <label>body</label>
        <div style={styles.span} dangerouslySetInnerHTML={createMarkUp(body)} />
      </div>
      <button style={styles.sendButton} onClick={sendEmail}>Send</button>
    </div>
    );
}

PreviewEmailContent.PropTypes = {
};

export default PreviewEmailContent;


