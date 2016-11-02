import React, {Component} from 'react';

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
      this.props.fetchData(this.props.selected);
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
              <div className='row'>
                <div className='large-6 medium-12 small-12 columns'>
                  <div className='row'>
                    <h5>{dataKey}</h5>
                  </div>
                  <div className='row'>
                    <LineChart
                    syncId={props.syncid}
                    key={i}
                    width={720}
                    height={250}
                    data={props.dataMap[dataKey]}
                    margin={{top: 5, right: 40, left: 20, bottom: 5}}>
                      <XAxis dataKey='dateString'/>
                      <YAxis/>
                      <CartesianGrid strokeDasharray='3 3'/>
                      <Tooltip/>
                      {props.handles.map((handle, index) => (
                        <Line key={`${dataKey}-${index}`} type='monotone' dataKey={handle} stroke={colors[index]} activeDot={{r: 8}}/>
                        ))}
                    </LineChart>
                  </div>
                </div>
              </div>
                ))}
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

export default AnalyzeSelected;
