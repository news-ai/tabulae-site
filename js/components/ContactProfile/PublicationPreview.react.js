import React, {Component} from 'react';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import {grey500, grey400} from 'material-ui/styles/colors';

const PublicationForm = ({onHide}) => {
  return (
      <div style={{padding: 8}}>
        <div className='row'>
          <span className='pointer' onClick={onHide} style={{fontSize: 0.9}}>Hide</span>
        </div>
        <div className='row'>
        Publication Form
        </div>
        <div className='row'>
          <TextField
          hintText='Publication Name'
          floatingLabelText='Publication Name'
          />
        </div>
        <div className='row'>
          <TextField
          hintText='Website Link'
          floatingLabelText='Website Link'
          />
        </div>
      </div>
    );
};

class PublicationPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    const {text, publication} = props;
    return text.length > 0 ? (
      <div>
        {publication ? <div>
          <div>
            NAME: {publication.name}
          </div>
          <div>
            URL: {publication.url}
          </div>
        </div> : <div>
          {!state.open &&
            <div>
              No such publication in our database.
              <RaisedButton
              label='Add'
              onClick={_ => this.setState({open: true})}
              />
            </div>}
          {state.open && <PublicationForm onHide={_ => this.setState({open: false})}/>}
        </div>}
      </div>) : null;
  }
}

const mapStateToProps = (state, props) => {
  const pubId = state.publicationReducer[props.text];
  return {
    publication: pubId ? state.publicationReducer[pubId] : undefined
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicationPreview);
