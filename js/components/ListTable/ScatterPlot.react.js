import React, {Component} from 'react';

import Waiting from '../Waiting';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Line, Tooltip, LineChart} from 'recharts';
import * as c from 'material-ui/styles/colors';

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

// const data = [
// {x: 100, y: 200, z: 200},
// {x: 120, y: 100, z: 260},
// {x: 170, y: 300, z: 400},
// {x: 140, y: 250, z: 280},
// {x: 150, y: 400, z: 500},
// {x: 110, y: 280, z: 200}
// ];

class ScatterPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: [],
      averageBySelected: null,
      data: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.fieldsmap !== null &&
      nextProps.contacts !== null &&
      nextProps.contacts.length > 0
      ) {
      const xfieldObj = nextProps.fieldsmap.find(fieldObj => fieldObj.value === 'likes_to_posts');
      const data = nextProps.contacts.map(contactObj => {
        contactObj[xfieldObj.value] = parseFloat(xfieldObj.strategy(contactObj));
        contactObj.instagramfollowers = parseFloat(contactObj.instagramfollowers);
        return contactObj;
      })
      .filter(contactObj => contactObj[xfieldObj.value] && contactObj.instagramfollowers);
      this.setState({data});
    }
  }

  render() {
    const state = this.state;
    const props = this.props;
    console.log(state.data);
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
          {state.open && <ScatterChart width={400} height={400} margin={{top: 20, right: 20, bottom: 20, left: 20}}>
            <XAxis dataKey={'likes_to_posts'} name='stature' unit='cm'/>
            <YAxis dataKey={'instagramfollowers'} name='weight' unit='kg'/>
            <Scatter name='A school' data={state.data} fill='#8884d8'/>
            <CartesianGrid />
            <Tooltip cursor={{strokeDasharray: '3 3'}}/>
          </ScatterChart>}
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

export default ScatterPlot;
