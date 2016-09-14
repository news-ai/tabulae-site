import React, { Component } from 'react';
import 'node_modules/react-select/dist/react-select.css';
import AutoComplete from 'material-ui/AutoComplete';
import isString from 'lodash/isString';

const defaultSelectableOptions = [
  {value: '_', label: '[leave me blank]', selected: false},
  {value: 'ignore_column', label: '[Ignore this column]', selected: false},
  {value: 'firstname', label: 'First Name', selected: false},
  {value: 'lastname', label: 'Last Name', selected: false},
  {value: 'email', label: 'Email', selected: false},
  {value: 'employers', label: 'Employer(s)'},
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
      headers: null,
      options: defaultSelectableOptions,
      order: []
    };
    this._sendHeaderNames = this._sendHeaderNames.bind(this);
    this.onNewRequest = this._onNewRequest.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.headers);
    if (nextProps.headers) {
      if (nextProps.headers.length > 0 && this.state.headers === null) {
        this.setState({
          headers: nextProps.headers,
          order: Array(nextProps.headers.length).fill(null)
        });
      }
    }
  }

  _sendHeaderNames() {
    const { headers } = this.state;
    const { onProcessHeaders } = this.props;
    let untitledCount = 0;
    const order = headers.map( header => {
      if (!header.value || header.value.value === '_') {
        untitledCount++;
        return 'untitled-' + untitledCount;
      } else {
        return header.value.value;
      }
    });
    onProcessHeaders(order);
  }

  _onNewRequest(req, reqIndex, headerIndex) {
    let order = this.state.order;
    if (isString(req)) {
      console.log('STRING');
      console.log(req);
      // custom
      order[headerIndex] = req;
    } else {
      //default
      console.log('DEFAULT');
      order[headerIndex] = req.value;
      const options = this.state.options.map(
        option => (option.value === req.value) ? Object.assign({}, option, {selected: !option.selected}) : option
        );
      this.setState({options});
      console.log(options);
    }
    console.log(order);
    this.setState({order});
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

        {state.headers !== null ? state.headers.map( (header, i) =>
          <div key={i} style={{width: '180px'}}>
          <AutoComplete
          floatingLabelText='showAllItems'
          openOnFocus
          filter={AutoComplete.fuzzyFilter}
          onNewRequest={(req, reqIndex) => this.onNewRequest(req, reqIndex, i)}
          dataSource={state.options.filter(item => !item.selected)}
          dataSourceConfig={config}
        />
            <ul style={{listStyleType: 'none'}}>
            {header.rows.map((rowItem, j) => <li key={j} style={listItemStyle}>{rowItem}</li>)}
            </ul>
          </div>) : null}
        </div>
        <button className='button' style={{ float: 'right' }} onClick={this._sendHeaderNames}>Set Column Names</button>
      </div>
    );
  }
}

export default Headers;
