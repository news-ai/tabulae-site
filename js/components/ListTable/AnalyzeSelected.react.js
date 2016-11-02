import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import * as twitterDataActions from '../ContactProfile/SocialDataGraphs/Twitter/actions';
import withRouter from 'react-router/lib/withRouter';

import Dialog from 'material-ui/Dialog';
import {XAxis, YAxis, CartesianGrid, Legend, Line, Tooltip, LineChart} from 'recharts';
import {red300, blue300, purple300, cyan300, green300, indigo300, orange300} from 'material-ui/styles/colors';

const colors = [red300, blue300, purple300, cyan300, green300, indigo300, orange300];

class AnalyzeSelected extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: []
    };
  }

  componentWillMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.open && this.state.open) {
      this.props.fetchTwitterData(this.props.selected);
    }
  }

  render() {
    const state = this.state;
    const props = this.props;
    console.log(props.data);
    return (
      <div>
        <Dialog
        title='Analyze Selected'
        open={state.open}
        modal={false}
        autoScrollBodyContent
        onRequestClose={_ => this.setState({open: false})}
        >
          <LineChart
          width={550}
          height={300}
          data={props.data}
          margin={{top: 5, right: 40, left: 20, bottom: 5}}>
            <XAxis dataKey='CreatedAt'/>
            <YAxis/>
            <CartesianGrid strokeDasharray='3 3'/>
            <Tooltip/>
            <Legend />
            {props.contacts.map((id, i) => (
              <Line key={i} type='monotone' dataKey={id} stroke={colors[i]} activeDot={{r: 8}}/>
              ))}
          </LineChart>
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const filledIds = props.selected.filter(id => state.twitterDataReducer[id]);
  const graphDataKeys = ['Likes', 'Posts', 'Followers', 'Following', 'Retweets'];
  // likes
  let data = [];
  if (props.selected.length > 0 && filledIds.length === props.selected.length) {
    for (let i = 0; i < state.twitterDataReducer[filledIds[0]].received.length; i++) {
      let obj = {CreatedAt: state.twitterDataReducer[filledIds[0]].received[i].CreatedAt};
      filledIds.map(contactId => {
        if (state.twitterDataReducer[contactId].received[i]) {
          obj[contactId] = state.twitterDataReducer[contactId].received[i]['Likes'];
        }
      });
      data.push(obj);
    }
  }

  return {
    contacts: filledIds,
    data
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchLists: _ => dispatch(actionCreators.fetchLists()),
    fetchTwitterData: selected => dispatch(twitterDataActions.fetchMultipleContactTwitterData(props.listId, selected, 7)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AnalyzeSelected));
