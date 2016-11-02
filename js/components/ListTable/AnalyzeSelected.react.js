import React, {Component} from 'react';

import Waiting from '../Waiting';
import Dialog from 'material-ui/Dialog';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import {XAxis, YAxis, CartesianGrid, Line, Tooltip, LineChart} from 'recharts';
import {red300, blue300, purple300, cyan300, green300, indigo300, orange300} from 'material-ui/styles/colors';

const colors = [red300, blue300, purple300, cyan300, green300, indigo300, orange300];

function divide(numerator, denomenator, fixedTo) {
  if (numerator === undefined || denomenator === undefined) return undefined;
  const res = Math.round(numerator * (1 / fixedTo) / denomenator) / (1 / fixedTo);
  if (!isNaN(res)) return res;
}

const GraphSeriesItem = props => {
  let data = props.dataMap[props.dataKey];
  if (props.averageBySelected && props.averageBySelected !== null) {
    data = data.map((oldDataObj, i) => {
      let dataObj = Object.assign({}, oldDataObj);
      props.handles.map(handle => (
        dataObj[handle] = divide(dataObj[handle], props.dataMap[props.averageBySelected][i][handle], 0.001)
      ));
      return dataObj;
    });
  }

  return (
    <div className='row'>
      <div className='large-6 medium-12 small-12 columns'>
        <div className='row'>
          <h5>{props.dataKey}</h5>
        </div>
        <div className='row'>
          <LineChart
          syncId={props.syncid}
          key={`graph-${props.passdownkey}`}
          width={720}
          height={250}
          data={data}
          margin={{top: 5, right: 40, left: 20, bottom: 5}}>
            <XAxis dataKey='dateString'/>
            <YAxis/>
            <CartesianGrid strokeDasharray='3 3'/>
            <Tooltip/>
            {props.handles.map((handle, index) => (
              <Line key={`${props.dataKey}-${index}`} type='monotone' dataKey={handle} stroke={colors[index]} activeDot={{r: 8}}/>
              ))}
          </LineChart>
        </div>
      </div>
    </div>);
};

class AnalyzeSelected extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: [],
      averageBySelected: null
    };
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
          {props.averageBy && state.open && props.selected.length > 0 &&
            <div style={{margin: '20px 0'}}>
              <span>Average By: </span>
              <DropDownMenu value={state.averageBySelected} onChange={(e, index, val) => this.setState({averageBySelected: val})}>
              {[<MenuItem key={-1} value={null} primaryText='None' />,
                ...props.averageBy.map((dataKey, i) => <MenuItem key={i} value={dataKey} primaryText={dataKey}/>)
                ]}
              </DropDownMenu>
            </div>
          }
          {props.selected.length > 0 && state.open && !props.isReceiving &&
            props.dataKeys.map((dataKey, i) => {
              if (state.averageBySelected && state.averageBySelected !== null && state.averageBySelected === dataKey) return null;
              return (
              <GraphSeriesItem passdownkey={i} averageBySelected={state.averageBySelected} dataKey={dataKey} {...props}/>
              );
            })}
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

export default AnalyzeSelected;
