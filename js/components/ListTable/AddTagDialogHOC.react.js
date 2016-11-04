import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import {blue50, blue100, grey700} from 'material-ui/styles/colors';
import * as actionCreators from 'actions/AppActions';

class AddTagDialogHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: ''
    };
  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div>
        <Dialog open={state.open} title='Add Tag' onRequestClose={_ => this.setState({open: false, value: ''})}>
          <TextField underlineFocusStyle={{borderColor: blue100}} hintText='New Tag Name' value={state.value} onChange={e => this.setState({value: e.target.value})}/>
          <FlatButton style={{margin: '0 5px'}} backgroundColor={blue50} hoverColor={blue100} labelStyle={{textTransform: 'none', color: grey700}} label='Submit' onClick={_ => {
            props.onAddTag(state.value);
            this.setState({open: false, value: ''});
          }}/>
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
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const listId = props.listId;
  return {
    patchList: listBody => dispatch(actionCreators.patchList(listBody))
  };
};

const mergeProps = ({list}, {patchList}, {children}) => {
  return {
    list,
    onAddTag: name => patchList({
      listId: list.id,
      name: list.name,
      tags: list.tags === null ? [name] : [...list.tags, name]
    }),
    children
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(AddTagDialogHOC);
