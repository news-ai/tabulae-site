import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as actions from './actions';

import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';
import IconButton from 'material-ui/IconButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

class EmailStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentOffset: 0,
      currentLimit: 7
    };
    this.onLeftClick = this._onLeftClick.bind(this);
    this.onRightClick = this._onRightClick.bind(this);
    this.fetchEmailStats  = this._fetchEmailStats.bind(this);
    this.onLimitChange = this._onLimitChange.bind(this);
  }

  componentWillMount() {
    this.fetchEmailStats();
  }

  _fetchEmailStats() {
    return this.props.fetchEmailStats(this.state.currentLimit);
  }

  _onLeftClick() {
    new Promise((resolve, reject) => {
      if (this.props.doneLoading) resolve(true);
      else this.fetchEmailStats().then(resolve, reject);
    })
    .then(_ => {
      const {currentOffset, currentLimit} = this.state;
      this.setState({currentOffset: currentOffset + currentLimit});
    });
  }

  _onRightClick() {
    const {currentOffset, currentLimit} = this.state;
    if (currentOffset - currentLimit >= 0) {
      this.setState({currentOffset: currentOffset - currentLimit});
    }
  }

  _onLimitChange(event, index, newLimit) {
    if (!this.props.doneLoading) this.fetchEmailStats();
    this.setState({currentLimit: newLimit});
  }

  render() {
    const props = this.props;
    const state = this.state;
    let left = props.data.length - (state.currentOffset + state.currentLimit);
    if (left < 0) left = 0;
    const right = props.data.length - state.currentOffset;
    const data = props.data.slice(left, right);
    // if (data.length % state.currentLimit > 0) {
    //   data = [...data, new Array(data.length % state.currentLimit).fill({})];
    // }
    console.log(left);
    console.log(right);
    console.log(this.state.currentLimit);
    return (
      <div>
        <div className='vertical-center'>
          <AreaChart
          width={700}
          height={400}
          data={data}
          margin={{top: 10, right: 30, left: 0, bottom: 0}}
          >
            <XAxis dataKey='Date'/>
            <YAxis/>
            <CartesianGrid strokeDasharray='3 3'/>
            <Tooltip/>
            <Area type='monotone' dataKey='Clicks' stackId='1' stroke='#8884d8' fill='#8884d8' />
            <Area type='monotone' dataKey='Opens' stackId='1' stroke='#82ca9d' fill='#82ca9d' />
          </AreaChart>
        </div>
        <div className='vertical-center'>
          <IconButton
          disabled={props.doneLoading && left === 0}
          onClick={this.onLeftClick}
          iconClassName='fa fa-arrow-left'
          />
          <DropDownMenu value={state.currentLimit} onChange={(event, index, newLimit) => this.setState({currentLimit: newLimit})}>
            <MenuItem key={7} value={7} primaryText='Past 7 Days' />
            <MenuItem key={14} value={14} primaryText='Past Two Weeks' />
            <MenuItem key={30} value={30} primaryText='Past 30 Days' />
          </DropDownMenu>
          <IconButton
          disabled={state.currentOffset - state.currentLimit < 0}
          onClick={this.onRightClick}
          iconClassName='fa fa-arrow-right'
          />
        </div>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    data: state.emailStatsReducer.received.map(datestring => state.emailStatsReducer[datestring]),
    doneLoading: state.emailStatsReducer.offset === null
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmailStats: limit => dispatch(actions.fetchEmailStats(limit)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailStats);
