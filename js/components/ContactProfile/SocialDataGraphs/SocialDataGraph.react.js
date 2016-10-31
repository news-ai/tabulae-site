import React, {Component} from 'react';
import LineGraph from './LineGraph.react';
import Checkbox from 'material-ui/Checkbox';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

class SocialDataGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      params: this.props.params,
      dataKeys: this.props.dataKeys,
      normalizeBy: null
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    //console.log(props.data);
    //const normalizedData = props.data.map(dataObj => {

    //});

    return (
      <div className='row' style={{marginTop: '10px', marginBottom: '10px'}}>
        <div className='large-12 large-offset-1 medium-12 medium-offset-1 small-12 columns'>
          <h5>{props.title} Stats</h5>
        </div>
        <div className='large-9 medium-12 small-12 columns horizontal-center'>
          <LineGraph
          data={props.data}
          dataKeys={props.dataKeys.filter(key => state.params[key])} />
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
        </div>
        <div>
          <span>Normalize by:</span>
          <DropDownMenu value={state.normalizeBy} onChange={(e, index, val) => this.setState({normalizeBy: val})}>
          {props.dataKeys
            .filter(dataKey => state.params[dataKey])
            .map((dataKey, i) => <MenuItem key={i} value={dataKey} primaryText={dataKey}/>)}
          </DropDownMenu>
        </div>
      </div>);
  }
}

export default SocialDataGraph;
