import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from './actions';
import {XAxis, YAxis, CartesianGrid, Legend, Line, Tooltip, LineChart} from 'recharts';
import {red300, blue300, cyan300} from 'material-ui/styles/colors';

class TwitterLineGraph extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchData();
  }

  render() {
    const props = this.props;
    const state = this.state;
        //<Line type='monotone' dataKey='Followers' stroke='#82ca9d' />
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
        <Line type='monotone' dataKey='Retweets' stroke={red300} />
        <Line type='monotone' dataKey='Posts' stroke={blue300} />
      </LineChart>
      ) : null;
  }
}

function mapStateToProps(state, props) {
  return {
    data: state.twitterDataReducer[props.contactId]
  };
}

function mapDispatchToProps(dispatch, props) {
  return {
    fetchData: _ => dispatch(actions.fetchContactTwitterData(props.contactId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TwitterLineGraph);
