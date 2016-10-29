import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {grey400, grey700, yellow50} from 'material-ui/styles/colors';
import {SortableContainer, SortableHandle, SortableElement, arrayMove} from 'react-sortable-hoc';

import './react_sortable_hoc.css';

const DragHandle = SortableHandle(() => <i className='fa fa-bars pointer' aria-hidden='true' />);

const Column = ({name, value, customfield, tableOnly, hidden, readonly, internal, comment, hideCheckbox, onCheck, onRemove}) => {
  let typeLabel = 'Editable';
  if (tableOnly) typeLabel = 'Table Only';
  if (customfield) typeLabel = 'Custom Editable';
  if (internal) typeLabel = 'Internal';
  if (readonly) typeLabel = 'Read Only';
  return (
    <div className='row item'>
      <div className='large-1 medium-1 small-6 columns'>
        <DragHandle />
      </div>
      <div className='large-1 medium-1 small-6 columns'>
        <Checkbox disabled={internal || hideCheckbox} checked={hidden} onCheck={(e, checked) => onCheck(e, checked, value)} />
      </div>
      <div className='large-4 medium-5 small-12 columns'>
        <span style={{fontSize: '0.9em'}}>{name}</span>
      </div>
      <div className='large-2 medium-3 small-12 columns'>
        <span style={{fontSize: '0.9em'}}>{typeLabel}</span>
      </div>
      <div className='large-4 medium-2 small-12 columns' style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
        {customfield && !readonly && <i className='fa fa-trash hoverable-icon' aria-hidden='true' onClick={_ => onRemove(value)} />}
        {!customfield && tableOnly && comment && <span style={{fontSize: '0.8em'}}>{comment}</span>}
      </div>
    </div>
    );
};

const SortableItem = SortableElement(({fieldObj, onCheck, onRemove}) => <Column {...fieldObj} onCheck={onCheck} onRemove={onRemove} />);

const SortableList = SortableContainer(({items, onCheck, onRemove}) => {
  return (
    <div>
      <div className='row' style={{borderBottom: 'solid 1px black', marginBottom: 5}}>
        <div className='large-1 columns'>
        </div>
        <div className='large-1 medium-1 columns'>
          <span>Hidden</span>
        </div>
        <div className='large-4 medium-5 columns'>
          <span>Name</span>
        </div>
        <div className='large-2 medium-3 columns'>
          <span>Type</span>
        </div>
        <div className='large-4 medium-2 columns'>
        </div>
      </div>
      {items
        .map((fieldObj, index) => (
          <SortableItem
          disabled={fieldObj.tableOnly}
          key={index}
          index={index}
          fieldObj={fieldObj}
          onCheck={onCheck}
          onRemove={onRemove}
          />)
      )}
    </div>
  );
});

class AddOrHideColumns extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      items: this.props.fieldsmap,
      textvalue: '',
    };
    this.onSortEnd = ({oldIndex, newIndex}) => this.setState({items: arrayMove(this.state.items, oldIndex, newIndex)});
    this.onCheck = this._onCheck.bind(this);
    this.onSubmit = this._onSubmit.bind(this);
    this.onAddColumn = this._onAddColumn.bind(this);
    this.onRemove = this._onRemove.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.fieldsmap === null && nextProps.fieldsmap !== null) {
      this.setState({items: nextProps.fieldsmap});
    }

    if (
      this.props.fieldsmap !== null &&
      nextProps.fieldsmap !== null &&
      this.props.fieldsmap.length !== nextProps.fieldsmap.length) {
      this.setState({items: nextProps.fieldsmap});
    }
  }

  _onCheck(e, checked, value) {
    let items;
    if (this.state.items.some(item => item.value === value && item.checkboxStrategy)) {
      items = this.state.items.find(item => item.value === value && item.checkboxStrategy).checkboxStrategy(this.state.items, checked);
    } else {
      items = this.state.items.map(fieldObj => {
        if (fieldObj.value === value) return Object.assign({}, fieldObj, {hidden: checked});
        return fieldObj;
      });
    }
    this.setState({items});
  }

  _onSubmit() {
    const fieldsmap = this.state.items
    .filter(fieldObj => !fieldObj.tableOnly)
    .map(({name, value, hidden, customfield}) => ({name, value, hidden, customfield}));
    const listBody = {
      listId: this.props.listId,
      name: this.props.list.name,
      fieldsmap
    };
    this.props.patchList(listBody);
    this.setState({open: false, textvalue: ''});
  }

  _onAddColumn() {
    const value = this.state.textvalue;
    if (this.state.items.some(fieldObj => fieldObj.name === value || fieldObj.value === value)) {
      this.setState({errorText: 'duplicate'});
      return;
    }
    const prevFieldsmap = this.state.items
    .filter(fieldObj => !fieldObj.tableOnly)
    .map(({name, value, hidden, customfield}) => ({name, value, hidden, customfield}));
    const fieldsmap = [...prevFieldsmap, {
      name: value,
      value: value.toLowerCase().split(' ').join('_'),
      customfield: true,
      hidden: false
    }];
    const listBody = {
      listId: this.props.listId,
      name: this.props.list.name,
      fieldsmap
    };
    this.props.patchList(listBody);
    this.setState({open: false, textvalue: ''});
  }

  _onRemove(deleteValue) {
    const fieldsmap = this.state.items
    .filter(fieldObj => !fieldObj.tableOnly)
    .map(({name, value, hidden, customfield}) => ({name, value, hidden, customfield}))
    .filter(fieldObj => fieldObj.value !== deleteValue);
    const listBody = {
      listId: this.props.listId,
      name: this.props.list.name,
      fieldsmap
    };
    this.props.patchList(listBody);
  }

  render() {
    const props = this.props;
    const state = this.state;
    const actions = [
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={_ => this.setState({open: false})}
      />,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onTouchTap={this.onSubmit}
      />,
    ];
    return (
      <div>
        <Dialog autoScrollBodyContent modal actions={actions} open={state.open} title='Show/Hide Columns' onRequestClose={_ => this.setState({open: false})}>
          <div style={{marginTop: 20}}>
            <div style={{margin: '20px 0'}}>
              <span style={{fontSize: '0.9em'}}>
                Use the drag handle icon <i style={{margin: '0 3px'}} className='fa fa-bars' aria-hidden='true'/> to reorder the order of you columns. Activate or de-activate default columns. Create or delete custom columns that you can use as template variable in emails.
              </span>
            </div>
            <div className='panel' style={{
              backgroundColor: yellow50,
              margin: 10,
              padding: 10
            }}>
              <span style={{fontSize: '0.8em'}}>
              There is a number of auto-generated columns that are activated when certain columns are not hidden. For example,
              activating <strong>Instagram Likes</strong> and <strong>Instagram Comments</strong> also activates <strong>Likes-to-Comments ratio</strong>.
              </span>
            </div>
            {props.isReceiving && <FontIcon className={'fa fa-spinner fa-spin'} />}
            {props.fieldsmap !== null && state.items !== null &&
              <SortableList
              lockAxis='y'
              items={state.items}
              onSortEnd={this.onSortEnd}
              onCheck={this.onCheck}
              onRemove={this.onRemove}
              useDragHandle
              />}
            <div style={{margin: 30}}>
              <span>Add Column</span>
              <TextField
              id='custom-column'
              style={{marginLeft: 15, marginRight: 15}}
              value={state.textvalue}
              errorText={state.errorText}
              onChange={e => this.setState({textvalue: e.target.value})}
              />
              <RaisedButton
              label='Add'
              icon={<FontIcon color={grey400} hoverColor={grey700} className='fa fa-plus' />}
              onClick={this.onAddColumn}
              />
            </div>
          </div>
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isReceiving: state.listReducer.isReceiving,
    list: state.listReducer[props.listId],
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchList: listObj => dispatch(actionCreators.patchList(listObj)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddOrHideColumns);
