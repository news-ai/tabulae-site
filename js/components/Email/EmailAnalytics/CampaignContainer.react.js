import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailStats from './EmailStats/EmailStats.react';
import {actions as campaignActions} from './Campaign';
import {List, AutoSizer, CellMeasurer, WindowScroller} from 'react-virtualized';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import {grey400, grey600, grey700, grey500, grey800} from 'material-ui/styles/colors';
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

const fontIconStyle = {color: grey400};
const isReceivingContainerStyle = {margin: '10px 0'};
const iconButtonIconStyle = {color: grey600};

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
