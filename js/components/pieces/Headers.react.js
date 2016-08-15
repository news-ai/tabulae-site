import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import * as actionCreators from 'actions/AppActions';
import '../../../node_modules/react-select/dist/react-select.css';

class Headers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headers: this.props.headers,
      defaultOptions: [
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
  }

  _createCustom(options, filterValue, excludeOptions) {
    const lowerFilterValue = filterValue.toLowerCase();
    const filteredOptions = options.filter( option => {
      if (option.value.toLowerCase().substring(0, lowerFilterValue.length) === lowerFilterValue) return true;
      else if (option.label.toLowerCase().substring(0, lowerFilterValue.length) === lowerFilterValue) return true;
      else return false;
    });

    if (filteredOptions.length === 0 && filterValue.length > 0) {
      filteredOptions.push({ value: filterValue, label: filterValue, create: true });
    }
    console.log(options);
    console.log(filterValue);

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

  render() {
    const { headers, defaultOptions } = this.state;
    const options = defaultOptions;
    return (
      <div>
      {headers.map( (header, i) => {
        return (
          <div key={i}>
            <Select
            name={'row-' + i}
            options={options}
            onChange={ val => this._logChange(val, i)}
            value={header.value}
            filterOptions={this._createCustom}
            />
            <ul>
            {header.rows.map( (item, j) => <li key={j}>{item}</li>)}
            </ul>
          </div>);
      })}
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
  )(Headers);
