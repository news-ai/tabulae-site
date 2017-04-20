import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailStats from './EmailStats/EmailStats.react';
import {actions as campaignActions} from './Campaign';
import {PieChart, Pie, Tooltip, Cell} from 'recharts';
import {grey800} from 'material-ui/styles/colors';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const styles = {
  span: {
    fontSize: '0.8em',
    color: grey800,
    verticalAlign: 'text-top'
  },
  number: {
    padding: 5,
  },
  block: {
    display: 'block'
  }
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
  date
}) => {
  return (
    <div style={{margin: 10, padding: 10, border: `1px dotted ${grey800}`}} className='row'>
      <div className='large-12 medium-12 small-12 columns'>
        <span className='smalltext'>{date}</span>
      </div>
      <div className='large-4 medium-5 small-12 columns'>
      {subject}
      </div>
      <div className='large-2 medium-4 small-4 columns'>
        <div style={styles.block}>
          <span style={styles.span}>Total Opens</span>
          <div style={styles.number}>
          {opens}
          </div>
        </div>
        <div style={styles.block}>
          <span style={styles.span}>Total Clicks</span>
          <div style={styles.number}>
          {clicks}
          </div>
        </div>
      </div>
      <div className='large-2 medium-4 small-4 columns'>
        <div style={styles.block}>
          <span style={styles.span}>Unique Opens</span>
          <div style={styles.number}>
          {uniqueOpens}
          </div>
        </div>
        <div style={styles.block}>
          <span style={styles.span}>Unique Open %</span>
          <div style={styles.number}>
          {uniqueOpensPercentage}
          </div>
        </div>
      </div>
      <div className='large-2 medium-4 small-4 columns'>
        <div style={styles.block}>
          <span style={styles.span}>Unique Clicks</span>
          <div style={styles.number}>
          {uniqueClicks}
          </div>
        </div>
        <div style={styles.block}>
          <span style={styles.span}>Unique Clicks %</span>
          <div style={styles.number}>
          {uniqueClicksPercentage}
          </div>
        </div>
      </div>
      <div style={styles.block}>
        <span style={styles.span}>Bounces</span>
        <div style={styles.number}>
        {bounces}
        </div>
      </div>
      <div className='large-offset-10 medium-offset-10 small-offset-8 columns'>
        <span className='text right'>See All Emails</span>
      </div>
    </div>
  );
};

class CampaignContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.props.fetchCampaignStats();
  }

  render() {
    const props = this.props;
    const state = this.state;
    console.log(props.campaigns);
    return (
      <div>
        <EmailStats/>
      {props.campaigns.map(campaign =>
        <Campaign key={campaign.uniqueId} {...campaign}/>)}
      </div>);
  }
}


const mapStateToProps = (state, props) => {
  return {
    campaigns: state.campaignStatsReducer.received.map(id => state.campaignStatsReducer[id])
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchCampaignStats: _ => dispatch(campaignActions.fetchCampaignStats()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CampaignContainer);
