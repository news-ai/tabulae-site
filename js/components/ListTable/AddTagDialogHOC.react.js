import React, {PropTypes, Component} from 'react';
import Dialog from 'material-ui/Dialog';

class AddTagDialogHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div>
        <Dialog open={state.open} title='Add Tag' onRequestClose={_ => this.setState({open: false})}>
        EYY
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>
      );
  }
}

export default AddTagDialogHOC;
