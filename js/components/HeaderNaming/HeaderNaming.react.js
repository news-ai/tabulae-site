import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import {Grid, WindowScroller} from 'react-virtualized';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import {grey500} from 'material-ui/styles/colors';
import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

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
    this.onAddCustom = this._onAddCustom.bind(this);
  }

  componentWillMount() {
    this.props.fetchHeaders();
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.headers && nextProps.headers) {
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
      className='headersnaming-headercell vertical-center'
      key={key}
      style={style}>
        <span style={{fontSize: '1.1em', fontWeight: 'bold', marginLeft: 15, color: grey500}}>{contentBody}</span>
      </div>
      );
  }

  _rowRenderer({columnIndex, rowIndex, key, style}) {
    const rows = this.props.headers[rowIndex].rows;
    let classname = rowIndex % 2 === 0 ?
        'headersnaming-cell evenRow vertical-center' :
        'headersnaming-cell oddRow vertical-center';
    let contentBody;
    switch (columnIndex) {
      case 0:
        contentBody = <span style={{marginLeft: 15}}>{rows[0]}</span>;
        break;
      case 1:
        contentBody = <span style={{fontSize: '0.9em', marginLeft: 15}}>{rows[1]}</span>;
        break;
      case 2:
        contentBody = (
        <DropDownMenu
        value={this.state.order[rowIndex]}
        onChange={(e, i, v) => this.onMenuChange(e, i, v, rowIndex, this.state.order[rowIndex])}>
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
      className={classname}
      key={key}
      style={style}>
      {contentBody}
      </div>);
  }

  _onMenuChange(event, index, value, rowIndex, prevValue) {
    if (value === undefined) {
      const emptyOrder = this.state.order.map((val, i) => rowIndex === i ? undefined : val);
      const emptyOptions = this.state.options.map(option => option.value === prevValue ? Object.assign({}, option, {selected: false}) : option);
      this.setState({
        order: emptyOrder,
        options: emptyOptions
      }, _ => this._headernames.recomputeGridSize());
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
    this.props.onAddHeaders(order);
  }

  _onAddCustom() {
    alertify.prompt(
      'Name Custom Property',
      'This will be applied as a custom column name.',
      '',
      (e, name) => {
        const value = name.toLowerCase().split(' ').join('_');
        const options = [...this.state.options, {value, label: name, selected: false}];
        this.setState({options}, _ => this._headernames.recomputeGridSize());
      },
      _ => {});
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div className='horizontal-center' style={{margin: 50}}>
      {props.isReceiving && <span>LOADING ...</span>}
      {props.headers &&
        <div>
          <div>
            <IconButton
            style={{float: 'right'}}
            iconClassName='fa fa-plus'
            tooltip='Add Custom Properties'
            tooltipPosition='bottom-right'
            onClick={this.onAddCustom}
            />
          </div>
          <div style={{marginBottom: 20}}>
            <Grid
            className='BodyGrid'
            cellRenderer={this.headerRenderer}
            columnCount={3}
            columnWidth={250}
            height={50}
            width={750}
            rowCount={1}
            rowHeight={50}
            />
          </div>
          <Grid
          ref={ref => this._headernames = ref}
          className='BodyGrid'
          cellRenderer={this.rowRenderer}
          columnCount={3}
          columnWidth={250}
          height={props.headers.length * 60}
          width={750}
          rowCount={props.headers.length}
          rowHeight={60}
          />
          <div style={{margin: 20}}>
            <RaisedButton style={{float: 'right'}} icon={<FontIcon color={grey500} className={props.isProcessWaiting ? 'fa fa-spinner fa-spin' : 'fa fa-paper-plane'} />} label='Submit' onClick={this.onSubmit} />
          </div>
        </div>}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  return {
    listId,
    isProcessWaiting: state.fileReducer.isProcessWaiting,
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
