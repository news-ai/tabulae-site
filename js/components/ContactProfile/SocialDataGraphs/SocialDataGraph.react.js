import React, {Component} from 'react';
import LineGraph from './LineGraph.react';
import Checkbox from 'material-ui/Checkbox';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

function divide(numerator, denomenator, fixedTo) {
  const res = Math.round(numerator * (1 / fixedTo) / denomenator) / (1 / fixedTo);
  if (!isNaN(res)) return res;
}

class SocialDataGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      params: this.props.params,
      dataKeys: this.props.dataKeys,
      averageBy: null
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    console.log(props.averageBy);
    console.log(props.data);
    let data = props.data;
    const dataKeys = props.dataKeys.filter(key => state.params[key]);
    if (state.averageBy !== null) {
      data = props.data.map(dataObj => {
        let newDataObj = Object.assign({}, dataObj);
        dataKeys.map(key => (newDataObj[key] = divide(dataObj[key], dataObj[state.averageBy], 0.0001)));
        return newDataObj;
      });
    }

    return (
      <div className='row' style={{marginTop: '10px', marginBottom: '10px'}}>
        <div className='large-12 large-offset-1 medium-12 medium-offset-1 small-12 columns'>
          <h5>{props.title} Stats</h5>
        </div>
        <div className='large-9 medium-12 small-12 columns horizontal-center'>
          <LineGraph
          data={data}
          dataKeys={dataKeys}
          />
        </div>
        <div className='large-3 medium-12 small-12 columns'>
          {props.dataKeys.map((dataKey, i) =>
            <Checkbox
            key={i}
            label={dataKey}
            checked={state.params[dataKey]}
            onCheck={(e, checked) =>
              this.setState({params: Object.assign({}, state.params, {[dataKey]: checked})})
            }/>)}
          {props.averageBy &&
            <div style={{margin: '20px 0'}}>
              <span>Average By: </span>
              <DropDownMenu value={state.averageBy} onChange={(e, index, val) => this.setState({averageBy: val})}>
              {[<MenuItem key={-1} value={null} primaryText='None' />,
                ...props.averageBy.map((dataKey, i) => <MenuItem key={i} value={dataKey} primaryText={dataKey}/>)
                ]}
              </DropDownMenu>
            </div>
          }
        </div>
      </div>);
  }
}

export default SocialDataGraph;