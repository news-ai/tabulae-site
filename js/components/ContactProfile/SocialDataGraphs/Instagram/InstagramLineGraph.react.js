import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from './actions';
import {XAxis, YAxis, CartesianGrid, Legend, Line, Tooltip, LineChart} from 'recharts';
import {red300, blue300, cyan300} from 'material-ui/styles/colors';

const data = [
  {name: 'Page A', uv: 4000, pv: 2400, amt: 2400},
  {name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
  {name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
  {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
  {name: 'Page E', uv: 1890, pv: 4800, amt: 2181},
  {name: 'Page F', uv: 2390, pv: 3800, amt: 2500},
  {name: 'Page G', uv: 3490, pv: 4300, amt: 2100},
];

class InstagramLineGraph extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchData();
  }

  render() {
    const props = this.props;
    const state = this.state;
    return props.data ? (
      <LineChart
      width={600}
      height={300}
      data={props.data.received}
      margin={{top: 5, right: 30, left: 20, bottom: 5}}>
        <XAxis dataKey='CreatedAt'/>
        <YAxis/>
        <CartesianGrid strokeDasharray='3 3'/>
        <Tooltip/>
        <Legend />
        <Line type='monotone' dataKey='Likes' stroke='#8884d8' activeDot={{r: 8}}/>
        <Line type='monotone' dataKey='Followers' stroke='#82ca9d' />
        <Line type='monotone' dataKey='Posts' stroke={blue300} />
        <Line type='monotone' dataKey='Comments' stroke={cyan300} />
      </LineChart>
      ) : null;
  }
}

function mapStateToProps(state, props) {
  return {
    data: state.instagramDataReducer[props.contactId]
  };
}

function mapDispatchToProps(dispatch, props) {
  return {
    fetchData: _ => dispatch(actions.fetchContactInstagramData(props.contactId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstagramLineGraph);
