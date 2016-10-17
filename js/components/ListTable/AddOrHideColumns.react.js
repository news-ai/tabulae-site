import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import Checkbox from 'material-ui/Checkbox';
import Toggle from 'material-ui/Toggle';
import FlatButton from 'material-ui/FlatButton';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

import './react_sortable_hoc.css';

const Column = ({name, value, customfield, tableOnly, hidden, onCheck}) => {
  return (
    <div className='row item'>
      <div className='large-1 medium-2 columns'>
        <Checkbox disabled={tableOnly} checked={hidden} onCheck={(e, checked) => onCheck(e, checked, value)} />
      </div>
      <div className='large-3 columns'>{name}</div>
      <div className='large-4 columns'>{tableOnly ? 'Table Only' : customfield ? 'Custom Editable' : 'Editable'}</div>
    </div>
    );
};

const SortableItem = SortableElement(({fieldObj, onCheck}) => <Column {...fieldObj} onCheck={onCheck} />);

const SortableList = SortableContainer(({items, onCheck}) => {
  return (
    <div>
      <div className='row' style={{borderBottom: 'solid 1px black'}}>
        <div className='large-1 medium-2 columns'>
          <span>Hidden</span>
        </div>
        <div className='large-3 columns'>
          <span>Name</span>
        </div>
        <div className='large-4 columns'>
          <span>Type</span>
        </div>
      </div>
      {items.map((fieldObj, index) =>
        <SortableItem
        disabled={fieldObj.tableOnly}
        key={index}
        index={index}
        fieldObj={fieldObj}
        onCheck={onCheck}
        />
      )}
    </div>
  );
});

class AddOrHideColumns extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      items: null
    };
    this.onSortEnd = ({oldIndex, newIndex}) => this.setState({items: arrayMove(this.state.items, oldIndex, newIndex)});
    this.onCheck = this._onCheck.bind(this);
    this.onSubmit = this._onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.fieldsmap === null && nextProps.fieldsmap !== null) {
      this.setState({items: nextProps.fieldsmap});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.open === false && this.state.open === true) {
    // onRequestOpen hit

    }
  }

  _onCheck(e, checked, value) {
    const items = this.state.items.map(fieldObj => {
      if (fieldObj.value === value) return Object.assign({}, fieldObj, {hidden: checked});
      return fieldObj;
    });
    this.setState({items});
  }

  _onSubmit() {
    console.log(this.state.items);
    const fieldsmap = this.state.items
    .filter(fieldObj => !fieldObj.tableOnly);
    console.log(fieldsmap);
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
        <Dialog autoScrollBodyContent modal actions={actions} open={state.open} title='Add or Hide Columns' onRequestClose={_ => this.setState({open: false})}>
         <div style={{marginTop: 10}}>
            {props.isReceiving && <FontIcon className={'fa fa-spinner fa-spin'} />}
            {props.fieldsmap !== null &&
              <SortableList
              lockAxis='y'
              items={state.items}
              onSortEnd={this.onSortEnd}
              onCheck={this.onCheck}
              />}
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
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchList: listObj => dispatch(actionCreators.patchList(listObj)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddOrHideColumns);
