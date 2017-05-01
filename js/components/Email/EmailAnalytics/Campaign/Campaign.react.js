import React from 'react';
import {connect} from 'react-redux';
import {Tooltip} from 'react-lightweight-tooltip';

import withRouter from 'react-router/lib/withRouter';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import {grey800, blue800} from 'material-ui/styles/colors';

const blockStyles = {
  span: {
    fontSize: '0.8em',
    color: grey800,
    verticalAlign: 'text-top'
  },
  number: {
    padding: 2,
  },
  indicator: {
    fontSize: '1.5em',
    color: blue800
  },
  block: {
    display: 'block'
  },
  tooltip: {
    fontSize: '0.8em',
    color: 'darkgray'
  }
};

const greenRoundedStyle = {
  content: {
  },
  tooltip: {
    borderRadius: '6px',
    padding: 2
  },
  arrow: {
  },
};


const Block = ({title, value, hint}) => {
  return (
    <div style={blockStyles.block}>
      <Tooltip content={hint} styles={greenRoundedStyle}>
        <span style={blockStyles.span}>{title}</span>
      </Tooltip>
      <div style={blockStyles.number}>
      <span style={blockStyles.indicator}>{value}</span>
      </div>
    </div>);
};

const Campaign = ({
  subject,
  delivered,
  opens,
  uniqueOpens,
  uniqueOpensPercentage,
  clicks,
  uniqueClicks,
  uniqueClicksPercentage,
  bounces,
  date,
  router
}) => {
  return (
    <Paper className='row' zDepth={1} style={{margin: 10, padding: 10}}>
      <div className='large-12 medium-12 small-12 columns'>
        <span className='smalltext' style={{color: grey800}}>Created: {date}</span>
      </div>
      <div className='large-5 medium-12 small-12 columns'>
      {subject || <span style={{color: grey800}}>(No Subject)</span>}
      </div>
      <div className='large-2 medium-4 small-4 columns'>
        <Block hint='Total number of email opens' value={opens} title='Total Opens'/>
        <Block hint='Total number of clicks on embeded links' value={clicks} title='Total Clicks'/>
      </div>
      <div className='large-2 medium-4 small-4 columns'>
        <Block hint='Total number of people who opened' value={uniqueOpens} title='Unique Opens'/>
        <Block hint='How many people opened out of people delivered' value={`${Math.round(uniqueOpensPercentage * 100) / 100}%`} title='Unique Open Rate'/>
      </div>
      {/*
      <div className='large-2 medium-4 small-4 columns'>
        <Block hint='' value={uniqueClicks} title='Unique Clicks'/>
        <Block hint='' value={`${uniqueClicksPercentage}%`} title='Unique Clicks Rate'/>
      </div>
    */}
      <div className='large-2 medium-4 small-4 columns'>
        <Block hint='How many emails did not reach recepients' value={bounces} title='Bounces'/>
      </div>
      <div className='large-offset-9 medium-offset-8 small-offset-6 columns'>
        <div className='right'>
          <FlatButton
          primary
          label='See Emails'
          icon={<FontIcon className='fa fa-chevron-right'/>}
          onClick={_ => router.push({pathname: `/emailstats/all`, query: {subject: subject, date: date}})}
          />
        </div>
      </div>
    </Paper>
  );
};

const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Campaign));
