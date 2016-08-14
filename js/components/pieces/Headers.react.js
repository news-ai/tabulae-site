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
  }

  _logChange(obj, i) {
    const { headers, defaultOptions, optionSelected } = this.state;
    const value = obj.value;
    let newOptionSelected = optionSelected;
    let newDefaultOptions = defaultOptions;
    let newHeaders = headers;
    console.log('--------');
    console.log(obj);

    if (optionSelected[value] !== undefined) {
      console.log('EXIST');
      if (headers[i].value) {
        const currObj = headers[i].value;
        newOptionSelected[currObj.value] = false;
      }
      newOptionSelected[value] = true;
    } else {
      console.log('DOESNT EXIST');
      newOptionSelected[value] = true;
      newDefaultOptions.push({ value, label: value });
    }
    newHeaders[i].value = obj;
    console.log(newHeaders);
    console.log(newOptionSelected);
    console.log(newDefaultOptions);
    console.log('--------');
    this.setState({
      headers: newHeaders,
      optionSelected: newOptionSelected,
      defaultOptions: newDefaultOptions
    });
  }

  render() {
    const { headers, defaultOptions, optionSelected } = this.state;
    const options = defaultOptions.filter( option => !optionSelected[option.value]);
    console.log(options);
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
            allowCreate
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
