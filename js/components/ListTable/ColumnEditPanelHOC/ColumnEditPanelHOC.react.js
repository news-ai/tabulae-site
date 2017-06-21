import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import {actions as listActions} from 'components/Lists';
import HTML5Backend from 'react-dnd-html5-backend';
import Container from './Container.react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {yellow50} from 'material-ui/styles/colors';

import {
  generateTableFieldsmap,
  measureSpanSize,
  exportOperations,
  isNumber,
  _getter,
  reformatFieldsmap
} from 'components/ListTable/helpers';
import alertify from 'alertifyjs';

alertify.promisifyConfirm = (title, description) => new Promise((resolve, reject) => {
  alertify.confirm(title, description, resolve, reject);
});

alertify.promisifyPrompt = (title, description, defaultValue) => new Promise((resolve, reject) => {
  alertify.prompt(title, description, defaultValue, (e, value) => resolve(value), reject);
});

class ColumnEditPanelHOC extends Component {
	constructor(props) {
		super(props);		
		const hiddenList = this.props.fieldsmap.filter(field => field.hidden && !field.tableOnly);
		const showList = this.props.fieldsmap.filter(field => !field.hidden && !field.tableOnly);
		this.state = {
			hiddenList,
			showList,
			open: false,
			isUpdating: false,
			dirty: false,
		};
		this.updateList = this.updateList.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
	}

	updateList(list, containerType) {
		this.setState({[containerType]: list, dirty: true});
	}

  onSubmit() {
    const fieldsmap = reformatFieldsmap([...this.state.showList, ...this.state.hiddenList]);
    const listBody = {
      listId: this.props.listId,
      name: this.props.list.name,
      fieldsmap
    };
    this.setState({isUpdating: true});
    this.props.patchList(listBody)
    .then(_ => this.setState({isUpdating: false, open: false}))
  }

	render() {
		const state = this.state;
    const actions = [
      <FlatButton
        primary
        label='Cancel'
        disabled={state.isUpdating}
        onTouchTap={_ => this.setState({open: false})}
      />,
      <FlatButton
        primary
        label={state.isUpdating ? 'Updating...' : 'Submit'}
        disabled={state.isUpdating || !state.dirty}
        onTouchTap={this.onSubmit}
      />,
    ];

		// console.log(this.props.fieldsmap);

		return (
			<div>
        <Dialog autoScrollBodyContent modal actions={actions} open={state.open} title='Column Settings' onRequestClose={_ => this.setState({open: false})}>
          <div style={{margin: '20px 0'}}>
            <span className='text'>
              Drag each card to reorder the order of you columns. Drag column cards from <strong>Hidden Columns</strong> to <strong>Showing Columns</strong> to activate or de-activate default columns. You can also create custom columns that you can use as template variable in emails.
            </span>
          </div>

          <div className='panel' style={{
            backgroundColor: yellow50,
            margin: 10,
            padding: 10
          }}>
            <span className='smalltext'>
            There is a number of auto-generated columns that are activated when certain columns are not hidden. For example,
            activating <strong>Instagram Likes</strong> and <strong>Instagram Comments</strong> also activates <strong>Likes-to-Comments ratio</strong>.
            </span>
          </div>
					<div className='row' style={{...style}}>
						<Container
						containerType='hiddenList'
						updateList={this.updateList}
						className='large-4 medium-6 small-12 columns'
						id={1}
						title='Hidden Columns'
						list={state.hiddenList}
						/>
						<Container
						containerType='showList'
						className='large-8 medium-6 small-12 columns'
						updateList={this.updateList}
						id={2}
						title='Showing Columns'
						list={state.showList}
						/>
					</div>
        </Dialog>
	      {this.props.children({onRequestOpen: _ => this.setState({open: true})})}
			</div>
		);
	}
}

const style = {
	// display: 'flex',
	// justifyContent: 'space-around',
	paddingTop: '20px'
};

const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const list = state.listReducer[listId];

  const rawFieldsmap = generateTableFieldsmap(list);
  return {
  	fieldsmap: rawFieldsmap,
  	list: list
  }
};

const mapDispatchToProps = (dispatch, props) => {
	return {
    patchList: listObj => dispatch(listActions.patchList(listObj)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(ColumnEditPanelHOC));
