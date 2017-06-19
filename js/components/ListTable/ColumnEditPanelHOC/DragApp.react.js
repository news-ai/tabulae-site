import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Container from './Container.react';
import {connect} from 'react-redux';

import {
  generateTableFieldsmap,
  measureSpanSize,
  exportOperations,
  isNumber,
  _getter
} from 'components/ListTable/helpers';

class App extends Component {
	constructor(props) {
		super(props);		
		const hiddenList = this.props.fieldsmap.filter(field => field.hidden);
		const showList = this.props.fieldsmap.filter(field => !field.hidden);
		this.state = {
			hiddenList,
			showList
		};
	}

	render() {
		const state = this.state;

		console.log(this.props.fieldsmap);

		return (
			<div style={{...style}}>
				<Container id={1} title='Hidden' list={state.hiddenList} />
				<Container id={2} title='Show' list={state.showList} />
			</div>
		);
	}
}

const style = {
	display: 'flex',
	justifyContent: 'space-around',
	paddingTop: '20px'
};

const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const listData = state.listReducer[listId];

  const rawFieldsmap = generateTableFieldsmap(listData);
  return {
  	fieldsmap: rawFieldsmap,
  }
};

const mapDispatchToProps = (dispatch, props) => {
	return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(App));
