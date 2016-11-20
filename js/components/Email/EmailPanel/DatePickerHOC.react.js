import React, {Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import DatePicker from 'react-datepicker';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';

import moment from 'moment';

import 'node_modules/react-datepicker/dist/react-datepicker.css';

const FORMAT = 'dddd, MMMM';

const hours = [];
for (let i = 0; i < 24; i++) {
  hours.push(<MenuItem value={i} key={`hour-${i}`} primaryText={`${i}`} />);
}

const minutes = [];
for (let i = 0; i < 60; i++) {
  minutes.push(<MenuItem value={i} key={`minute-${i}`} primaryText={`${i}`} />);
}

class DatePickerHOC extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    const rightNow = moment(today);
    this.state = {
      open: false,
      date: rightNow,
      hour: rightNow.hours(),
      minute: rightNow.minutes(),
      toggled: false
    };
    this.onToggle = this._onToggle.bind(this);
  }

  componentDidUpdate(prevState) {
    if (!prevState.open && this.state.open && !this.state.toggled) {
      const today = new Date();
      const rightNow = moment(today);
      this.state = {
        date: rightNow,
        hour: rightNow.hours(),
        minute: rightNow.minutes(),
      };
    }
  }

  _onToggle(e, toggled) {
    const state = this.state;
    const date = moment(state.date).minutes(state.minute).hour(state.hour);
    if (date < moment()) {
      alert(`Can't select date that is earlier than right now. Please pick another time.`);
    } else {
      this.setState({toggled});
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const m = moment(state.date);
    return (
      <div>
        <Dialog title='Schedule for Later' autoScrollBodyContent open={state.open} onRequestClose={_ => this.setState({open: false, date: null})}>
          <div className='horizontal-center' style={{margin: '20px 0'}}>
            <DatePicker
            inline
            onChange={date => this.setState({date})}
            selected={state.date}
            />
          </div>
          <div className='horizontal-center'>
            <div>
              <div className='vertical-center' style={{margin: '5px 0'}}>
               {m.isValid() && <span style={{margin: '0 5px'}}>{m.format(FORMAT)}</span>}
                <DropDownMenu maxHeight={200} value={state.hour} onChange={(e, i, hour) => this.setState({hour})}>
                  {hours}
                </DropDownMenu> : 
                <DropDownMenu maxHeight={200} value={state.minute} onChange={(e, i, minute) => this.setState({minute})}>
                  {minutes}
                </DropDownMenu>
              </div>
              <Toggle style={{margin: '10px 0'}} onToggle={this.onToggle} toggled={state.toggled} label='Schedule to send at this time'/>
            </div>
          </div>
        </Dialog>
      {props.children({onRequestOpen: _ => this.setState({open: true})})}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DatePickerHOC);
