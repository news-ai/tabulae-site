import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import {AutoSizer, Grid, ScrollSync, WindowScroller} from 'react-virtualized';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';

const defaultSelectableOptions = [
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
  {value: 'notes', label: 'Notes', selected: false},
];

class HeaderNaming extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order: [],
      options: defaultSelectableOptions,
    };
    this.rowRenderer = this._rowRenderer.bind(this);
    this.headerRenderer = this._headerRenderer.bind(this);
    this.onMenuChange = this._onMenuChange.bind(this);
    this.onSubmit = this._onSubmit.bind(this);
  }

  componentWillMount() {
    this.props.fetchHeaders();
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (this.props.headers && nextProps.headers) {
      this.setState({order: Array(nextProps.headers.length).fill(undefined)});
    }
  }

  _headerRenderer({columnIndex, rowIndex, key, style}) {
    let contentBody;
    switch (columnIndex) {
      case 0:
        contentBody = 'First Cell from First Row';
        break;
      case 1:
        contentBody = 'Preview Information';
        break;
      case 2:
        contentBody = 'Tabulae Properties';
        break;
      default:
        contentBody = '';
    }
    return (
      <div
      className={
        rowIndex % 2 === 0 ?
        'cell evenRow vertical-center' :
        'cell oddRow vertical-center'}
      key={key}
      style={style}>
        <span style={{fontSize: '1.1em'}}>{contentBody}</span>
      </div>
      );
  }

  _rowRenderer({columnIndex, rowIndex, key, style}) {
    const rows = this.props.headers[rowIndex].rows;
    let contentBody;
    switch (columnIndex) {
      case 0:
        contentBody = <span>{rows[0]}</span>;
        break;
      case 1:
        contentBody = <span>{rows[1]}</span>;
        break;
      case 2:
       contentBody = (
        <DropDownMenu
        value={this.state.order[rowIndex]}
        onChange={(e, i, v) => this.onMenuChange(e, i, v, rowIndex)}>
        {[
          <MenuItem key={-1} value={undefined} primaryText='----- Ignore Column -----' />,
          ...this.state.options
          .map((option, i) => (
            <MenuItem
            key={i}
            disabled={option.selected}
            value={option.value}
            primaryText={option.label}
            />))
        ]}
        </DropDownMenu>);
        break;
      default:
        contentBody = '';
    }

    return (
      <div
      className={
        rowIndex % 2 === 0 ?
        'headersnaming-cell evenRow vertical-center' :
        'headersnaming-cell oddRow vertical-center'}
      key={key}
      style={style}>
      {contentBody}
      </div>);
  }

  _onMenuChange(event, index, value, rowIndex) {
    if (value === undefined) {
      this.setState({
        order: this.state.order.map(val => val === value ? undefined : val),
        options: this.state.options.map(option => option.value === value ? Object.assign({}, option, {selected: false}) : option)
      });
      return;
    }
    let prevOrder = this.state.order.slice();
    if (prevOrder[rowIndex]) prevOrder[rowIndex] = undefined;
    const order = prevOrder.map((columnName, i) => i === rowIndex ? value : columnName);
    const options = this.state.options
    .map(option => option.value === value ?
      Object.assign({}, option, {selected: !option.selected}) : option);
    this.setState({order, options}, _ => this._headernames.recomputeGridSize());
  }

  _onSubmit() {
    const order = this.state.order.map(name => name || 'ignore_column');
    console.log(order);
    this.props.onAddHeaders(order);
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div style={{margin: 50}}>
      {props.isReceiving && <span>LOADING ...</span>}
      {props.headers &&
        <div>
          <Grid
          className='BodyGrid'
          cellRenderer={this.headerRenderer}
          columnCount={3}
          columnWidth={300}
          height={60}
          width={1000}
          rowCount={1}
          rowHeight={50}
          />
          <WindowScroller>
          {args => (
            <Grid
            ref={ref => this._headernames = ref}
            className='BodyGrid'
            cellRenderer={this.rowRenderer}
            columnCount={3}
            columnWidth={300}
            height={args.height}
            scrollTop={args.scrollTop}
            width={1000}
            rowCount={props.headers.length}
            rowHeight={60}
            />)}
          </WindowScroller>
          <RaisedButton label='Submit' onClick={this.onSubmit} />
        </div>}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  return {
    listId,
    isReceiving: state.headerReducer.isReceiving,
    headers: state.headerReducer[listId],
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const listId = parseInt(props.params.listId, 10);
  return {
    fetchHeaders: _ => dispatch(actionCreators.fetchHeaders(listId)),
    onAddHeaders: order => dispatch(actionCreators.addHeaders(listId, order)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderNaming);
