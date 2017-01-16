import React, {Component} from 'react';
import { connect } from 'react-redux';
import {outdatedRenderer, hightlightRenderer} from 'constants/CustomRenderers';
import Handsontable from 'node_modules/handsontable/dist/handsontable.full.min';
import {COLUMNS} from 'constants/ColumnConfigs';
import withRouter from 'react-router/lib/withRouter';
import * as actionCreators from 'actions/AppActions';
import * as actions from '../Search/actions';
import RaisedButton from 'material-ui/RaisedButton';
import find from 'lodash/find';

// take out selected
let defaultColumns = [{
  data: 'listname',
  title: 'List Name'
}, ...COLUMNS.filter(col => col.data !== 'selected')];

import 'node_modules/handsontable/dist/handsontable.full.min.css';

class HandsOnTablePatchOnly extends Component {
  constructor(props) {
    super(props);
    if (!defaultColumns.some(col => col.data === 'publication_name_1' && col.type === 'autocomplete')) {
      defaultColumns = defaultColumns.filter(col => !(col.data === 'publication_name_1' && col.type !== 'autocomplete'));
      defaultColumns.push({
        data: 'publication_name_1',
        type: 'autocomplete',
        title: 'Publication 1',
        source: (query, callback) => {
          props.searchPublications(query)
          .then(publicationNameArray => callback(publicationNameArray));
        },
        strict: false
      });
    }
    if (!defaultColumns.some(col => col.data === 'publication_name_2' && col.type === 'autocomplete')) {
      defaultColumns = defaultColumns.filter(col => !(col.data === 'publication_name_2' && col.type !== 'autocomplete'));
      defaultColumns.push({
        data: 'publication_name_2',
        type: 'autocomplete',
        title: 'Publication 2',
        source: (query, callback) => {
          props.searchPublications(query)
          .then(publicationNameArray => callback(publicationNameArray));
        },
        strict: false
      });
    }
    this.props.fieldsmap.map(fieldObj => {
      if (fieldObj.customfield && !fieldObj.hidden && !defaultColumns.some(col => col.data === fieldObj.value)) {
        defaultColumns.push({data: fieldObj.value, title: fieldObj.name});
      }
    });
    this.state = {
      dirtyRows: [],
      options: {
        data: this.props.data,
        rowHeaders: true,
        colHeaders: true,
        sortIndicator: true,
        manualColumnMove: false,
        manualRowMove: true,
        manualColumnResize: true,
        manualRowResize: true,
        minSpareRows: 10,
        columns: defaultColumns,
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
        beforeChange: (changes, source) => {
          const data = this.state.options.data;
          let dirtyRows = this.state.dirtyRows;
          changes.map(change => {
            const rowId = change[0];
            const contact = data[rowId];
            if (!dirtyRows.some(rId => rId === contact.id)) {
              dirtyRows.push(contact.id);
            }
          });
          this.setState({dirtyRows});
        },
      }
    };
    this.onSaveClick = this._onSaveClick.bind(this);
    this.createPublicationPromises = this._createPublicationPromises.bind(this);
    this.handleNormalField = this._handleNormalField.bind(this);
  }

  componentDidMount() {
    this.table = new Handsontable(this.refs.dataGridPatch, this.state.options);
  }

  componentWillUnmount() {
    this.table.destroy();
    this.props.clearSearchCache();
  }

  _handleNormalField(row) {
    const props = this.props;
    const list = props.listReducer[row.listid];
    let field = {};
    let customfields = [];
    list.fieldsmap.map(fieldObj => {
      if (fieldObj.customfield) {
        customfields.push({
          name: fieldObj.value,
          value: row[fieldObj.value]
        });
      } else {
        field[fieldObj.value] = row[fieldObj.value];
      }
    });
    if (customfields.length > 0) field.customfields = customfields;
    let employers = [];
    if (row['publication_name_1']) employers.push(props.publicationReducer[row['publication_name_1']]);
    if (row['publication_name_2']) employers.push(props.publicationReducer[row['publication_name_2']]);
    field.employers = employers;
    field.id = row.id;
    return field;
  }

  _onSaveClick() {
    const dirtyRows = this.state.dirtyRows;
    if (dirtyRows.length > 0) {
      const data = this.state.options.data;
      let patchContactList = [];
      Promise.all(this._createPublicationPromises(data))
      .then(_ => {
        dirtyRows.map(rowId => {
          const row = find(data, row => row.id === rowId);
          const contact = this.handleNormalField(row);
          patchContactList.push(contact);
        });
        this.props.patchContacts(patchContactList);
      });
    }
  }

  _createPublicationPromises(localData) {
    const props = this.props;
    let promises = [];
    localData.map(row => {
      if (row['publication_name_1']) {
        const pubName1 = row['publication_name_1'];
        if (!props.publicationReducer[pubName1]) {
          promises.push(props.createPublication({name: pubName1}));
        }
      }
      if (row['publication_name_2']) {
        const pubName2 = row['publication_name_2'];
        if (!props.publicationReducer[pubName2]) {
          promises.push(props.createPublication({name: pubName2}));
        }
      }
    });
    return promises;
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div className='print'>
        <div className='row noprint'>
          <div className='hide-for-small-only medium-1 medium-offset-8 large-offset-10 large-1 columns'>
            <div style={{position: 'fixed', top: 100, zIndex: 200}}>
              <RaisedButton
              primary
              label='Save'
              labelStyle={{textTransform: 'none'}}
              onClick={this.onSaveClick}
              />
            </div>
            {
            /*<div style={{position: 'fixed', top: 150, zIndex: 180}}>
              <p style={{fontSize: '0.8em', zIndex: 150}}>{props.lastSavedAt}</p>
            </div>*/
            }
          </div>
        </div>
        <h4 style={{margin: 20}}>Temporary List generated from Search: "{props.query}"</h4>
        <span style={{marginLeft: 15}}>You can edit the contacts from your search results, but add/delete are disabled from this Table.</span>
        <p style={{marginLeft: 15}}>You can only add a custom column field if the custom column exists in the list the contact belongs in.</p>
        <div id={props.tableId} ref='dataGridPatch'></div>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  const accumFieldsmap = [];
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
      if (list.fieldsmap) {
        // accumulate all customfields
        list.fieldsmap.map(fieldObj => {
          if (!accumFieldsmap.some(aFieldObj => fieldObj.value === aFieldObj.value)) {
            accumFieldsmap.push(fieldObj);
          }
        });
      }
    }
    return contact;
  });
  return {
    // id: listId,
    tableId: state.searchReducer.query,
    query: state.searchReducer.query,
    data: results,
    fieldsmap: accumFieldsmap,
    publicationReducer: state.publicationReducer,
    listReducer: state.listReducer
    // name: listData.name
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    searchPublications: query => dispatch(actionCreators.searchPublications(query)),
    clearSearchCache: _ => dispatch(actions.clearSearchCache()),
    patchContacts: contacts => dispatch(actionCreators.patchContacts(contacts)),
    createPublication: name => dispatch(actionCreators.createPublication(name)),
  };
};
// pass in fieldsmap and contacts

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(withRouter(HandsOnTablePatchOnly));