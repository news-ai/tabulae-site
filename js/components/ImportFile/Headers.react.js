import React, { Component } from 'react';
import 'node_modules/react-select/dist/react-select.css';
import AutoComplete from 'material-ui/AutoComplete';
import _ from 'lodash';
import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

const defaultSelectableOptions = [
  // {value: '_', label: '[leave me blank]', selected: false},
  // {value: 'ignore_column', label: '[Ignore this column]', selected: false},
  {value: 'firstname', label: 'First Name', selected: false},
  {value: 'lastname', label: 'Last Name', selected: false},
  {value: 'email', label: 'Email', selected: false},
  {value: 'employers', label: 'Employer/Publication'},
  {value: 'pastemployers', label: 'Past Employer(s)', selected: false},
  {value: 'linkedin', label: 'LinkedIn', selected: false},
  {value: 'twitter', label: 'Twitter', selected: false},
  {value: 'instagram', label: 'Instagram', selected: false},
  {value: 'website', label: 'Website', selected: false},
  {value: 'blog', label: 'Blog', selected: false},
];

const config = {
  text: 'label',
  value: 'value'
};

const listItemStyle = {
  borderTop: '1px solid lightgray',
  margin: '0 0 0 0',
  textAlign: 'center',
  height: '23px',
  overflow: 'auto'
};

class Headers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headers: this.props.headers,
      options: defaultSelectableOptions,
      order: Array(this.props.headers.length).fill(undefined)
    };
    this._sendHeaderNames = this._sendHeaderNames.bind(this);
    this.onNewRequest = this._onNewRequest.bind(this);
    this.clearValue = this._clearValue.bind(this);
  }

  _sendHeaderNames() {
    const { order, headers } = this.state;
    const { onProcessHeaders } = this.props;
    let untitledCount = 0;
    const newOrder = order.map(item => {
      if (item) {
        return item
      } else if (!item || item.length === 0) {
        untitledCount++;
        return `ignore_column`;
      }
    });
    if (untitledCount > 0)
      alertify.confirm(
        `There are ${untitledCount} columns that will be dropped when the list is imported.
        Make sure columns have names if you would like to import them.`,
        _ => onProcessHeaders(newOrder),
        _ => {}
        );
    else if (untitledCount === headers.length)
      alertify.alert(`Importing empty list is not allowed. You must at least name one column.`);
    else onProcessHeaders(newOrder);
  }

  _onNewRequest(req, reqIndex, headerIndex) {
    let order = this.state.order;
    if (_.isString(req)) {
      // custom
      order[headerIndex] = req;
    } else {
      // default
      // reset previous selected
      let options = this.state.options.map(option => {
        if (req.value === option.value) option.selected = true;
        return option;
      });
      this.setState({options});

      order[headerIndex] = req.value;
    }
    this.setState({order});
  }

  _clearValue(headerIndex) {
    const headerValue = (this.state.order[headerIndex]) ? this.state.order[headerIndex] : undefined;
    let options = this.state.options.map(option => {
      if (headerValue === option.value) option.selected = false;
      return option;
    });
    this.setState({options});
  }

  render() {
    const state = this.state;
    return (
      <div>
        <div style={{marginBottom: '30px'}}>
          <span>By setting the columns, you can do things like, emailing from template, sync up contact to their LinkedIn/Twitter, etc.</span><br />
          <span>You can custom set column names by typing the name in the dropdown bar as well.</span>
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: '30px'
        }}>

        {state.headers.map((header, i) =>
          <div key={i} style={{width: '180px'}}>
          <AutoComplete
          floatingLabelText='Column Name'
          openOnFocus
          onBlur={e => this.onNewRequest(e.target.value, null, i)}
          onFocus={_ => this.clearValue(i)}
          filter={AutoComplete.fuzzyFilter}
          onNewRequest={(req, reqIndex) => this.onNewRequest(req, reqIndex, i)}
          dataSource={state.options.filter(item => !item.selected)}
          dataSourceConfig={config}
        />
            <ul style={{listStyleType: 'none'}}>
            {header.rows.map((rowItem, j) => <li key={j} style={listItemStyle}>{rowItem}</li>)}
            </ul>
          </div>)}
        </div>
        <button className='button' style={{float: 'right'}} onClick={this._sendHeaderNames}>Set Column Names</button>
      </div>
    );
  }
}

export default Headers;
