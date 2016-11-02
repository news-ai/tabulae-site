import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import * as twitterDataActions from '../ContactProfile/SocialDataGraphs/Twitter/actions';
import withRouter from 'react-router/lib/withRouter';

import Waiting from '../Waiting';
import Dialog from 'material-ui/Dialog';
import {XAxis, YAxis, CartesianGrid, Line, Tooltip, LineChart} from 'recharts';
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
    return (
      <div>
        <Dialog
        title='Analyze Selected'
        open={state.open}
        modal={false}
        autoScrollBodyContent
        onRequestClose={_ => this.setState({open: false})}
        >
          <Waiting isReceiving={props.isReceiving}/>
          {props.selected.length > 0 && state.open && !props.isReceiving &&
            props.dataKeys.map((dataKey, i) => (
              <div className='row' style={{margin: '10px 0'}}>
                <div className='large-12 medium-12 small-12 columns'>
                  <h5>{dataKey}</h5>
                </div>
                <div className='large-12 medium-12 small-12 columns'>
                  <LineChart
                  key={i}
                  width={550}
                  height={300}
                  data={props.dataMap[dataKey]}
                  margin={{top: 5, right: 40, left: 20, bottom: 5}}>
                    <XAxis dataKey='dateString'/>
                    <YAxis/>
                    <CartesianGrid strokeDasharray='3 3'/>
                    <Tooltip/>
                    {props.contacts.map((id, index) => (
                      <Line key={index} type='monotone' dataKey={id} stroke={colors[i]} activeDot={{r: 8}}/>
                      ))}
                  </LineChart>
                </div>
              </div>
                ))
          }
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const filledIds = props.selected.filter(id => state.twitterDataReducer[id]);
  const dataKeys = ['Likes', 'Posts', 'Followers', 'Following', 'Retweets'];
  // likes
  let dataMap = {};
  if (props.selected.length > 0 && filledIds.length === props.selected.length) {
    dataKeys.map(dataKey => {
      let data = [];
      for (let i = 0; i < state.twitterDataReducer[filledIds[0]].received.length; i++) {
        const dateObj = new Date(state.twitterDataReducer[filledIds[0]].received[i].CreatedAt);
        let obj = {
          CreatedAt: state.twitterDataReducer[filledIds[0]].received[i].CreatedAt,
          dateString: `${dateObj.getMonth()}-${dateObj.getDay()}`
        };
        filledIds.map(contactId => {
          if (state.twitterDataReducer[contactId].received[i]) {
            obj[contactId] = state.twitterDataReducer[contactId].received[i][dataKey];
          }
        });
        data.push(obj);
      }
      dataMap[dataKey] = data;
    });
  }

  return {
    contacts: filledIds,
    dataMap,
    dataKeys,
    isReceiving: filledIds.length !== props.selected.length
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchLists: _ => dispatch(actionCreators.fetchLists()),
    fetchTwitterData: selected => dispatch(twitterDataActions.fetchMultipleContactTwitterData(props.listId, selected, 7)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AnalyzeSelected));
