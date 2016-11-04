import React, {Component} from 'react';

import Waiting from '../Waiting';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import * as c from 'material-ui/styles/colors';
import regression from 'regression';

const colors = [
  c.red300, c.blue300, c.purple300, c.cyan300, c.green300, c.indigo300, c.orange300,
  c.red400, c.blue400, c.purple400, c.cyan400, c.green400, c.indigo400, c.orange400,
  c.red500, c.blue500, c.purple500, c.cyan500, c.green500, c.indigo500, c.orange500,
  c.red600, c.blue600, c.purple600, c.cyan600, c.green600, c.indigo600, c.orange600,
  c.red700, c.blue700, c.purple700, c.cyan700, c.green700, c.indigo700, c.orange700,
  c.red800, c.blue800, c.purple800, c.cyan800, c.green800, c.indigo800, c.orange800,
];

function divide(numerator, denomenator, fixedTo) {
  if (numerator === undefined || denomenator === undefined) return undefined;
  const res = Math.round(numerator * (1 / fixedTo) / denomenator) / (1 / fixedTo);
  if (!isNaN(res)) return res;
}

class ScatterPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: [],
      averageBySelected: null,
      data: null,
      dataArray: [],
      regressionData: [],
      labels: []
    };
    this.getRegression = this._getRegression.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.fieldsmap !== null &&
      nextProps.contacts !== null &&
      nextProps.contacts.length > 0
      ) {
      const xfieldObj = nextProps.fieldsmap.find(fieldObj => fieldObj.value === 'likes_to_posts');
      if (!xfieldObj) return;
      const data = nextProps.contacts.map(contactObj => {
        let obj = {};
        obj.x = parseFloat(xfieldObj.strategy(contactObj));
        obj.y = parseFloat(contactObj.instagramfollowers);
        obj.name = contactObj.instagram;
        return obj;
      })
      .filter(obj => obj.x && obj.y);
      this.getRegression();
      this.setState({data});
    }
  }

  _getRegression() {
    if (this.state.data === null) return;
    const dataArray = this.state.data.map(obj => [obj.x, obj.y]);
    const result = regression('linear', dataArray);
    const m = result.equation[0];
    const cc = result.equation[1];
    let min = this.state.data[0].x;
    let max = this.state.data[0].x;
    for (let i = 1; i < this.state.data.length; i++) {
      if (this.state.data[i].x < min) min = this.state.data[i].x;
      if (this.state.data[i].x > max) max = this.state.data[i].x;
    }
    this.setState({
      regressionData: [
        {y: m * min + cc, x: min},
        {y: m * max + cc, x: max}
      ]});
  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div>
        <Dialog
        title='Who are beating the Average?'
        open={state.open}
        modal
        actions={[<FlatButton label='Close' onClick={_ => this.setState({open: false})}/>]}
        autoScrollBodyContent
        onRequestClose={_ => this.setState({open: false})}
        >
          <Waiting isReceiving={props.isReceiving}/>
          {state.open &&
            <ScatterChart data={state.data} width={600} height={400} margin={{top: 20, right: 20, bottom: 20, left: 20}}>
              <XAxis dataKey={'x'} name='likes_to_posts'/>
              <YAxis dataKey={'y'} name='followers'/>
              <ZAxis dataKey={'name'} name='username'/>
              <Scatter data={state.data} fill={colors[0]}/>
              <Scatter data={state.regressionData} line fill={colors[1]}/>
              <CartesianGrid/>
              <Tooltip cursor={{strokeDasharray: '3 3'}}/>
            </ScatterChart>
          }
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

export default ScatterPlot;
