import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import * as actionCreators from 'actions/AppActions';
import Radium from 'radium';
// import {Table, Column, Cell} from 'fixed-data-table';
import 'react-select/dist/react-select.css';
// import 'fixed-data-table/dist/fixed-data-table.css';

const TEST_HEADERS = [{
  "rows": ["Erin", "Hector", "Dena", "Georgia Alexia", "Cheryl", "Renata", "Courtney", "Lauren", "Gina Rose", "Christina", "Don", "Jasmine", "Alex", "Martin", "Sarah"]
}, {
  "rows": ["Turon", "Castro", "Giannini", "Benjou", "Locke", "Gar", "Ignelzie", "Parker", "Sirico", "Sulpizio", "West", "Lombardi", "White", "Brown", "Stallmann"]
}, {
  "rows": ["Erin turon, Stylist, Inc.", "10 and 10 Men Magazine", "1st Styling Assistant To Edward Enninful", "5280 Magazine", "7x7", "Abtp, Freelance", "Accessories Magazine", "Accessories Magazine", "Accessories Magazine", "Aeri Yun", "Agency Gerard Management", "Ala Moana Shopping Magazine And Modern Luxury Hawaii", "Alex White Edits", "Alicia Lombardini's Studio", "Alive Magazine"]
}, {
  "rows": ["Stylist", "Senior Fashion Editor", "", "Fashion Editor", "Contributing Editor", "Photo Stylist", "Trend Director", "Editor", "Fashion Market Editor", "Fashion Assistant", "Fashion Stylist", "Editor In Chief, Ala Moana Shopping Magazine", "Stylist", "Assistant", "Fashion Editor"]
}, {
  "rows": ["", "Rtw Accessories Mens and Womans", "", "Rtw, Accessories, Fine Jewelry, And Beauty", "Costume Jewelry, Fine Jewelry, Shoes, Bags, Rtw, Home, and Beauty", "", "Costume Jewelry, Fine Jewelry, Shoes, Bags, and Rtw", "Costume Jewelry, Shoes, Bags, and Rtw", "", "Ready to Wear and Accessories", "", "Costume Jewelry, Fine Jewelry, Shoes, Bags, Rtw, Home, and Beauty", "", "Costume Jewelry, Fine Jewelry, Shoes, Bags, and Rtw", "Costume Jewelry, Fine Jewelry, Shoes, Bags, Rtw, Bridal, Home, and Beauty"]
}, {
  "rows": ["erin_turon@yahoo.com", "studio@hector-castro.com", "dena.giannini@gmail.com", "gab@georgiaalexiabenjou.com", "cheryl@7x7.com", "g.renata11@yahoo.com", "courtneyi@busjour.com", "fashion2@busjour.com", "GinaS@busjour.com", "christina.sulpizio@me.com", "donweststylist@gmail.com", "jlombardi@modernluxury.com", "white.alex@me.com", "martin@martinbrownstudio.com", "sarah@alivemag.com"]
}, {
  "rows": ["", "", "", "", "", "http://www.renatagar.com", "http://www.accessoriesmag.com", "", "", "", "", "", "", "", "http://www.alivemag.com"]
}, {
  "rows": ["", "", "8/17 - email", "", "", "", "8/17 - email", "", "", "", "", "", "", "", "8/17 - email"]
}];

class Headers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // headers: this.props.headers,
      headers: TEST_HEADERS,
      // dataList: TEST_HEADERS.map( item => item.rows ),
      defaultOptions: [
        {value: '_', label: '[leave me blank]'},
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
    console.log(headers);
    const order = headers.map( header => !header.value ? '' : header.value.value === '_' ? '' : header.value.value);
    console.log(order);
    onProcessHeaders(order);
  }

  render() {
    const { headers, defaultOptions, dataList } = this.state;
     
    const options = defaultOptions;
    return (
      <div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
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
        <button className='button' onClick={this._sendHeaderNames}>Set Column Names</button>
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
