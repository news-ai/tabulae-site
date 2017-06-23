import React, {Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import DatePicker from 'react-datepicker';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';
import FlatButton from 'material-ui/FlatButton';
import timezones from './timezones';

import moment from 'moment-timezone';
import 'node_modules/react-datepicker/dist/react-datepicker.css';

const FORMAT = 'dddd, MMMM D, YYYY';
import alertify from 'alertifyjs';

const hours = [];
for (let i = 0; i < 24; i++) {
  hours.push(<MenuItem value={i} key={`hour-${i}`} primaryText={`${i}`} />);
}

const minutes = [];
for (let i = 0; i < 60; i++) {
  minutes.push(<MenuItem value={i} key={`minute-${i}`} primaryText={`${i}`} />);
}

const DATE_FORMAT = 'YYYY-MM-DD HH:mm';

const timezoneMenuItems = Object.keys(timezones)
.map((timezone, i) => <MenuItem value={timezones[timezone]} key={`timezone-${i}`} primaryText={timezone}/>);

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
      toggled: false,
      timezone: moment.tz.guess(),
    };
    this.onToggle = this._onToggle.bind(this);
    this.onRequestOpen = this._onRequestOpen.bind(this);
    this.onRequestClose = this._onRequestClose.bind(this);
  }

  componentDidUpdate(prevState) {
  }

  _onToggle(e, toggled) {
    if (!toggled) this.props.clearUTCTime();
    const now = moment();

    const date = this.state.date;
    const datestring = date.format(DATE_FORMAT);
    const localtime = moment.tz(datestring, this.state.timezone);

    if (localtime < now) {
      alertify.alert(
        `Selected Time Passed`,
        `<span>
        You selected <span style="color:red">${localtime.format(DATE_FORMAT)}</span>,
        but it is currently <span style="color:red">${now.tz(this.state.timezone).format(DATE_FORMAT)}</span> in <span style="color:green">${this.state.timezone}</span>.
        </span><br/>
        <span>
        Please pick another time.
        </span>`
        );
    } else {
      this.setState({toggled});
    }
  }

  _onRequestOpen() {
    const today = new Date();
    const rightNow = moment(today);
    if (this.state.toggled) {
      this.setState({open: true});
    } else {
      this.setState({
        open: true,
        date: rightNow,
        hour: rightNow.hours(),
        minute: rightNow.minutes(),
      });
    }
  }

  _onRequestClose() {
    if (this.state.toggled) {
      const date = this.state.date;
      const datestring = date.format(DATE_FORMAT);
      const localtime = moment.tz(datestring, this.state.timezone);
      this.props.setUTCTime(localtime.utc().format());
      this.setState({
        open: false
      });
    } else {
      this.setState({
        open: false
      });
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const m = moment(state.date);

    return (
      <div className={props.className} >
        <Dialog actions={[<FlatButton label='Close' onClick={this.onRequestClose}/>]}
        title='Schedule for Later' autoScrollBodyContent open={state.open} onRequestClose={this.onRequestClose}>
          <div className='horizontal-center' style={{margin: '20px 0'}}>
            <DatePicker inline onChange={date => this.setState({date})} selected={state.date} />
          </div>
          <div className='horizontal-center'>
            <div className='vertical-center'>
             {m.isValid() && <span style={{margin: '0 5px'}}>{m.format(FORMAT)}</span>}
            </div>
          </div>
          <div className='horizontal-center'>
            <div className='vertical-center' style={{margin: '5px 0'}}>
              <DropDownMenu maxHeight={200} value={state.hour} onChange={(e, i, hour) => this.setState({date: state.date.hours(hour), hour})}>
                {hours}
              </DropDownMenu> : 
              <DropDownMenu maxHeight={200} value={state.minute} onChange={(e, i, minute) => this.setState({date: state.date.minutes(minute), minute})}>
                {minutes}
              </DropDownMenu>
            </div>
          </div>
          <div className='horizontal-center'>
            <div>
              <div className='vertical-center'>
                <span>Timezone Selection: </span>
                <DropDownMenu maxHeight={200} value={state.timezone} onChange={(e, i, timezone) => this.setState({timezone})}>
                  {timezoneMenuItems}
                </DropDownMenu>
              </div>
              <Toggle style={{margin: '10px 0'}} onToggle={this.onToggle} toggled={state.toggled} label='Schedule to send at this time'/>
            </div>
          </div>
        </Dialog>
      {props.children({onRequestOpen: this.onRequestOpen})}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setUTCTime: utctime => dispatch({type: 'SET_SCHEDULE_TIME', utctime}),
    clearUTCTime: _ => dispatch({type: 'CLEAR_SCHEDULE_TIME'})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DatePickerHOC);
