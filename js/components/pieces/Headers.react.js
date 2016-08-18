import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import * as actionCreators from 'actions/AppActions';
import Radium from 'radium';
// import {Table, Column, Cell} from 'fixed-data-table';
import 'react-select/dist/react-select.css';
// import 'fixed-data-table/dist/fixed-data-table.css';

class Headers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headers: this.props.headers,
      defaultOptions: [
        {value: '_', label: '[leave me blank]'},
        {value: 'ignore_column', label: '[Ignore this column]'},
        {value: 'firstname', label: 'First Name'},
        {value: 'lastname', label: 'Last Name'},
        {value: 'email', label: 'Email'},
        {value: 'employers', label: 'Employer(s)'},
        {value: 'pastemployers', label: 'Past Employer(s)'},
        {value: 'linkedin', label: 'LinkedIn'},
        {value: 'twitter', label: 'Twitter'},
        {value: 'instagram', label: 'Instagram'},
        {value: 'website', label: 'Website'},
        {value: 'blog', label: 'Blog'},
      ],
      optionSelected: {
        firstname: false,
        lastname: false,
        email: false,
        employers: false,
        pastemployers: false,
        notes: false,
        linkedin: false,
        twitter: false,
        instagram: false,
        website: false,
        blog: false
      }
    };
    this._logChange = this._logChange.bind(this);
    this._createCustom = this._createCustom.bind(this);
    this._sendHeaderNames = this._sendHeaderNames.bind(this);
  }

  _createCustom(options, filterValue, excludeOptions) {
    // TODO: flag input when custom values are being created
    const lowerFilterValue = filterValue.toLowerCase();
    const filteredOptions = options.filter( option => {
      if (option.value.toLowerCase().substring(0, lowerFilterValue.length) === lowerFilterValue) return true;
      else if (option.label.toLowerCase().substring(0, lowerFilterValue.length) === lowerFilterValue) return true;
      else return false;
    });

    if (filteredOptions.length === 0 && filterValue.length > 0) {
      filteredOptions.push({ value: filterValue, label: filterValue, create: true });
    }

    return filteredOptions;
  }

  _logChange(obj, i) {
    const { headers, defaultOptions, optionSelected } = this.state;
    const value = obj.value;
    let newOptionSelected = optionSelected;
    let newDefaultOptions = defaultOptions;
    let newHeaders = headers;

    if (optionSelected[value] !== undefined) {
      if (headers[i].value) {
        // if field is set, turn that original value back on before setting new one
        const currObj = headers[i].value;
        newOptionSelected[currObj.value] = false;
        newDefaultOptions = newDefaultOptions.map( option => {
          if (option.value === currObj.value) option.disabled = false;
          return option;
        });
      }
      // turn value on and set the field
      newOptionSelected[value] = true;
      newDefaultOptions = newDefaultOptions.map( option => {
        if (option.value === value) option.disabled = true;
        return option;
      });
    } else {
      if (obj.create) {
        newOptionSelected[value] = true;
        newDefaultOptions.push({ value, label: value, disabled: true});
      }
    }
    newHeaders[i].value = obj;
    this.setState({
      headers: newHeaders,
      optionSelected: newOptionSelected,
      defaultOptions: newDefaultOptions
    });
  }

  _sendHeaderNames() {
    const { headers } = this.state;
    const { dispatch, onProcessHeaders } = this.props;
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

  render() {
    const { headers, defaultOptions } = this.state;
    const options = defaultOptions;
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
        {headers.map( (header, i) => {
        return (
          <div key={i} style={{width: '180px'}}>
            <Select
            name={'row-' + i}
            options={options}
            onChange={ val => this._logChange(val, i)}
            value={header.value}
            filterOptions={this._createCustom}
            width='100px'
            />
            <ul style={{listStyleType: 'none'}}>
            {header.rows.map( (item, j) => <li
              key={j}
              style={{
                borderTop: '1px solid lightgray',
                margin: '0 0 0 0',
                textAlign: 'center',
                height: '23px',
                overflow: 'auto'
              }}
              >{item}</li>)}
            </ul>
          </div>);
      })}
        </div>
        <button className='button' style={{ float: 'right' }} onClick={this._sendHeaderNames}>Set Column Names</button>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(Radium(Headers));
