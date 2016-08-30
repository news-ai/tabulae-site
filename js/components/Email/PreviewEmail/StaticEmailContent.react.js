import React, { PropTypes } from 'react';

const styles = {
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
}

function createMarkUp(html) {
  return { __html: html };
}

function StaticEmailContent({to, subject, body}) {
  return(
   <div className='u-full-width' style={styles.content}>
      <p style={styles.span}><strong style={styles.strong}>To</strong>{to}</p>
      <p style={styles.span}><strong style={styles.strong}>Subject</strong>{subject}</p>
      <div style={styles.span} dangerouslySetInnerHTML={createMarkUp(body)} />
    </div>
    );
}

StaticEmailContent.PropTypes = {
  to: PropTypes.string.isRequired,
  subject: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
};

export default StaticEmailContent;