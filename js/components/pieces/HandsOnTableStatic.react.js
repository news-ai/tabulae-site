import React, {Component} from 'react';
import { connect } from 'react-redux';
import {outdatedRenderer, hightlightRenderer} from 'constants/CustomRenderers';
import Handsontable from 'node_modules/handsontable/dist/handsontable.full.min';
import {COLUMNS} from 'constants/ColumnConfigs';
import withRouter from 'react-router/lib/withRouter';

if (!COLUMNS.some( col => col.data === 'publication_name_1')) {
  COLUMNS.push({
    data: 'publication_name_1',
    title: 'Publication 1',
  });
}
if (!COLUMNS.some(col => col.data === 'publication_name_2')) {
  COLUMNS.push({
    data: 'publication_name_2',
    title: 'Publication 2',
  });
}

import 'node_modules/handsontable/dist/handsontable.full.min.css';

class HandsOnTableStatic extends Component {
  constructor(props) {
    super(props);
    this.props.fieldsmap.map(fieldObj => {
      if (fieldObj.customfield && !fieldObj.hidden) COLUMNS.push({data: fieldObj.value, title: fieldObj.name});
    });
    this.state = {
      options: {
        data: this.props.data, // instantiate handsontable with empty Array of Array
        rowHeaders: true,
        sortIndicator: true,
        manualColumnMove: true,
        manualRowMove: true,
        manualColumnResize: true,
        manualRowResize: true,
        persistentState: true,
        minSpareRows: 10,
        columns: COLUMNS,
        renderAllRows: true,
        cells: (row, col, prop) => {
          const cellProperties = {};
          // default to highlightable renderer when selected
          cellProperties.renderer = hightlightRenderer;
          if (this.state.options.data[row]) {
            if (this.state.options.data[row].isoutdated) {
              // apply different colored renderer for outdated contacts
              cellProperties.renderer = outdatedRenderer;
            }
          }
          return cellProperties;
        },
      }
    };
  }

  componentDidMount() {
    this.table = new Handsontable(this.refs.dataGridStatic, this.state.options);
    window.print();
    this.props.router.goBack();
  }

  render() {
    return (<div className='print'>
      <h4 style={{margin: 20}}>{this.props.name}</h4>
      <div ref='dataGridStatic'></div>
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  const listData = state.listReducer[listId];
  let contacts = [];

  // if one contact is loaded before others, but also indexes lastFetchedIndex for lazy-loading
  if (listData) {
    if (!_.isEmpty(listData.contacts)) {
      listData.contacts.map( (contactId, i) => {
        if (state.contactReducer[contactId]) {
          contacts.push(state.contactReducer[contactId]);
        }
      });
    }
  }
  return {
    id: listId,
    data: contacts,
    fieldsmap: listData.fieldsmap,
    name: listData.name
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};
// pass in fieldsmap and contacts

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(withRouter(HandsOnTableStatic));