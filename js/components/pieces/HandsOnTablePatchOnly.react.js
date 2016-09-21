import React, {Component} from 'react';
import { connect } from 'react-redux';
import {outdatedRenderer, hightlightRenderer} from 'constants/CustomRenderers';
import Handsontable from 'node_modules/handsontable/dist/handsontable.full.min';
import {COLUMNS} from 'constants/ColumnConfigs';
import withRouter from 'react-router/lib/withRouter';
import * as actionCreators from 'actions/AppActions';

if (!COLUMNS.some(col => col.data === 'listname')) {
  COLUMNS.push({
    data: 'listname',
    title: 'List Name',
  });
}

import 'node_modules/handsontable/dist/handsontable.full.min.css';

class HandsOnTablePatchOnly extends Component {
  constructor(props) {
    super(props);
    // this.props.fieldsmap.map(fieldObj => {
    //   if (fieldObj.customfield && !fieldObj.hidden) COLUMNS.push({data: fieldObj.value, title: fieldObj.name});
    // });
    if (!COLUMNS.some( col => col.data === 'publication_name_1')) {
      COLUMNS.push({
        data: 'publication_name_1',
        type: 'autocomplete',
        title: 'Publication 1',
        source: (query, callback) => {
          this.props.searchPublications(query)
          .then(publicationNameArray => callback(publicationNameArray));
        },
        strict: false
      });
    }
    if (!COLUMNS.some(col => col.data === 'publication_name_2')) {
      COLUMNS.push({
        data: 'publication_name_2',
        type: 'autocomplete',
        title: 'Publication 2',
        source: (query, callback) => {
          this.props.searchPublications(query)
          .then(publicationNameArray => callback(publicationNameArray));
        },
        strict: false
      });
    }
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
    this.table = new Handsontable(this.refs.dataGridPatch, this.state.options);
  }

  componentWillUnmount() {
    this.props.clearSearchCache();
  }

  render() {
    const props = this.props;
    return (<div className='print'>
      <h4 style={{margin: 20}}>Temporary List generated from Search: "{props.query}"</h4>
      <p>You can edit the contacts from your search results, but add/delete are disabled from this Table.</p>
      <div id={props.tableId} ref='dataGridPatch'></div>
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  const listData = state.listReducer[listId];
  let contacts = [];

  const results = state.searchReducer.received.map(id => {
    const contact = state.searchReducer[id];
    const list = state.listReducer[contact.listid];
    if (list) {
      list.contacts.map((contactId, i) => {
        if (contactId === contact.id) {
          contact.rowNum = i;
          contact.listname = list.name;
        }
      });
    }
    return contact;
  });
  return {
    // id: listId,
    tableId: state.searchReducer.query,
    query: state.searchReducer.query,
    data: results,
    // fieldsmap: listData.fieldsmap,
    // name: listData.name
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    searchPublications: query => dispatch(actionCreators.searchPublications(query)),
    clearSearchCache: _ => dispatch(actions.clearSearchCache()),
  };
};
// pass in fieldsmap and contacts

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(withRouter(HandsOnTablePatchOnly));