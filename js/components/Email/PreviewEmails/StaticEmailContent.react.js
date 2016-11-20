import React, { PropTypes } from 'react';
import {grey600} from 'material-ui/styles/colors';
import moment from 'moment-timezone';

const styles = {
  content: {
    // margin: '5px',
  },
  span: {
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 10
  },
  strong: {
    color: 'gray',
    marginRight: 15
  },
};

const FORMAT = 'dddd, MMMM HH:mm';

function createMarkUp(html) {
  return { __html: html };
}

function StaticEmailContent({to, subject, body, sendat}) {
  let date;
  if (sendat !== null) date = moment(sendat);
  return(
   <div className='u-full-width' style={styles.content}>
      <p style={styles.span}><strong style={styles.strong}>To</strong>{to}</p>
      <p style={styles.span}><strong style={styles.strong}>Subject</strong>{subject}</p>
      {sendat !== null && <p style={styles.span}><span style={{fontSize: '0.9em', color: grey600}}>Scheduled: {date.tz(moment.tz.guess()).format(FORMAT)}</span></p>}
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