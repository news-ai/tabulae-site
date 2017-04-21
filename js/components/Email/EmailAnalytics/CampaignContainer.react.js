import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailStats from './EmailStats/EmailStats.react';
import {actions as campaignActions} from './Campaign';
import {List, AutoSizer, CellMeasurer, WindowScroller} from 'react-virtualized';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import {grey400, grey600, grey700, grey500, grey800, blue800} from 'material-ui/styles/colors';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
import {Tooltip} from 'react-lightweight-tooltip';

const styles = {
};

const fontIconStyle = {color: grey400};
const isReceivingContainerStyle = {margin: '10px 0'};
const iconButtonIconStyle = {color: grey600};

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
}

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
      <div className='large-5 medium-12 small-12 columns'>
      {subject || <span style={{color: grey800}}>(No Subject)</span>}
      </div>
      <div className='large-2 medium-4 small-4 columns'>
        <Block hint='Total number of email opens' value={opens} title='Total Opens'/>
        <Block hint='Total number of clicks on embeded links' value={clicks} title='Total Clicks'/>
      </div>
      <div className='large-2 medium-4 small-4 columns'>
        <Block hint='Total number of people who opened' value={uniqueOpens} title='Unique Opens'/>
        <Block hint='How many people opened out of people delivered' value={`${uniqueOpensPercentage}%`} title='Unique Open Rate'/>
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
      <div className='large-offset-10 medium-offset-9 small-offset-8 columns'>
        <span className='text right'>See All Emails</span>
      </div>
    </div>
  );
};

class CampaignContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.rowRenderer = this._rowRenderer.bind(this);
    this._campaignRef = this._campaignRef.bind(this);
    this._campaignCellMeasurerRef = this._campaignCellMeasurerRef.bind(this);
    this.cellRenderer = ({rowIndex, ...rest}) => this.rowRenderer({index: rowIndex, ...rest});
    window.onresize = () => {
      if (this._campaign) {
        this._campaignCellMeasurer.resetMeasurements();
        this._campaign.recomputeRowHeights();
      }
    };
  }

  componentWillUnmount() {
    window.onresize = undefined;
  }

  _campaignRef(ref) {
    this._campaign = ref;
  }

  _campaignCellMeasurerRef(ref) {
    this._campaignCellMeasurer = ref;
  }

  componentWillMount() {
    this.props.fetchCampaignStats();
  }

  _rowRenderer({key, index, isScrolling, isVisible, style}) {
    return (
      <div style={style} key={key}>
        <Campaign {...this.props.campaigns[index]}/>
      </div>);
  }

  render() {
    const props = this.props;
    const state = this.state;

    return (
      <div>
        <EmailStats/>
      {props.campaigns && 
        <WindowScroller>
        {({height, isScrolling, scrollTop}) =>
          <AutoSizer disableHeight>
            {({width}) =>
              <CellMeasurer
              ref={this._campaignCellMeasurerRef}
              cellRenderer={this.cellRenderer}
              columnCount={1}
              rowCount={props.campaigns.length}
              width={width}
              >
              {({getRowHeight}) =>
                <List
                ref={this._campaignRef}
                autoHeight
                width={width}
                height={height}
                rowHeight={getRowHeight}
                rowCount={props.campaigns.length}
                rowRenderer={this.rowRenderer}
                scrollTop={scrollTop}
                isScrolling={isScrolling}
                />
              }
              </CellMeasurer>
            }
            </AutoSizer>
          }
        </WindowScroller>}
      {props.isReceiving &&
        <div className='horizontal-center' style={isReceivingContainerStyle}>
          <FontIcon style={fontIconStyle} className='fa fa-spinner fa-spin'/>
        </div>}
      {props.hasNext && !props.isReceiving &&
        <div className='horizontal-center'>
          <IconButton
          tooltip='Load More'
          tooltipPosition='top-center'
          onClick={props.fetchCampaignStats}
          iconClassName='fa fa-chevron-down'
          iconStyle={iconButtonIconStyle}
          />
        </div>}
      </div>);
  }
}


const mapStateToProps = (state, props) => {
  return {
    campaigns: state.campaignStatsReducer.received.map(id => state.campaignStatsReducer[id]),
    hasNext: state.campaignStatsReducer.offset !== null,
    isReceiving: state.campaignStatsReducer.isReceiving,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchCampaignStats: _ => dispatch(campaignActions.fetchCampaignStats()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CampaignContainer);
