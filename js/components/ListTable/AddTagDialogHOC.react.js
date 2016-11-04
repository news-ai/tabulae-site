import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import * as actionCreators from 'actions/AppActions';
import {ControlledInput} from '../ToggleableEditInput';
import Waiting from '../Waiting';

class AddTagDialogHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: '',
    };
  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div>
        <Dialog open={state.open} title='Tags & Client' onRequestClose={_ => this.setState({open: false, value: ''})}>
          <Waiting style={{float: 'right', margin: 5}} isReceiving={props.isReceiving}/>
          <div className='row' style={{margin: '20px 0'}}>
            <ControlledInput async placeholder='----- Client name empty -----' disabled={props.list.readonly} name={props.list.client} onBlur={props.onAddClient}/>
          </div>
          <div className='row'>
            <TextField hintText='New Tag Name' value={state.value} onChange={e => this.setState({value: e.target.value})}/>
            <IconButton iconClassName='fa fa-plus' style={{margin: '0 5px'}} tooltip='Add Tag' tooltipPosition='top-right' onClick={_ => {
              props.onAddTag(state.value);
              this.setState({value: ''});
            }}/>
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
    list: state.listReducer[props.listId],
    isReceiving: state.listReducer.isReceiving,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const listId = props.listId;
  return {
    patchList: listBody => dispatch(actionCreators.patchList(listBody))
  };
};

const mergeProps = ({list, ...stateProps}, {patchList}, {children}) => {
  return {
    list,
    ...stateProps,
    onAddTag: name => patchList({
      listId: list.id,
      name: list.name,
      tags: list.tags === null ? [name] : [...list.tags, name],
      client: list.client
    }),
    onAddClient: client => patchList({
      listId: list.id,
      name: list.name,
      tags: list.tags,
      client
    }),
    children
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(AddTagDialogHOC);
