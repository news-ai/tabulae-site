import React, {Component} from 'react';
import LineGraph from './LineGraph.react';
import Checkbox from 'material-ui/Checkbox';

class SocialDataGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      params: this.props.params,
      dataKeys: this.props.dataKeys
    };
  }

  render() {
    const props = this.props;
    const state = this.state;

    return (
      <div className='row' style={{marginTop: '10px', marginBottom: '10px'}}>
        <div className='large-12 large-offset-1 medium-12 medium-offset-1 small-12 columns'>
          <h5>{props.title} Stats</h5>
        </div>
        <div className='large-8 medium-8 small-12 columns horizontal-center'>
          <LineGraph
          data={props.data}
          dataKeys={props.dataKeys.filter(key => state.params[key])} />
        </div>
        <div className='large-4 medium-4 small-12 columns'>
          {props.dataKeys.map((dataKey, i) =>
            <Checkbox
            key={i}
            label={dataKey}
            checked={state.params[dataKey]}
            onCheck={(e, checked) =>
              this.setState({params: Object.assign({}, state.params, {[dataKey]: checked})})
            }/>)}
        </div>
      </div>);
  }
}

export default SocialDataGraph;
