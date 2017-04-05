import EmailStats from './EmailStats.react';
import React from 'react';

const EmailStatsContainer = () => {
  return (
    <div>
      <div className='row'>
        <span style={{fontSize: '1.5em'}}>Opens/Clicks History</span>
      </div>
      <div style={{marginTop: 20}}>
        <EmailStats/>
      </div>
    </div>
    );
};

export default EmailStatsContainer;
