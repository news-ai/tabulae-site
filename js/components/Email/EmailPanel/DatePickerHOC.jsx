import React, {Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import DatePicker from 'react-datepicker';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';
import FlatButton from 'material-ui/FlatButton';

import moment from 'moment-timezone';
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

const DATE_FORMAT = 'YYYY-MM-DD HH:mm';
const UTC_ZONE = 'Europe/London';

const TIMEZONE_NAMES = [
  {offset: -12.0, text: 'Pacific/Kwajalein'},
  {offset: -11.0, text: 'Pacific/Samoa'},
  {offset: -10.0, text: 'Pacific/Honolulu'},
  {offset: -9.0, text: 'America/Anchorage'},
  {offset: -8.0, text: 'America/Los_Angeles'},
  {offset: -7.0, text: 'America/Denver'},
  {offset: -6.0, text: 'America/Chicago'},
  {offset: -5.0, text: 'America/New_York'},
  {offset: -4.0, text: 'Canada/Atlantic'},
  {offset: -3.5, text: 'Canada/Newfoundland'},
  {offset: -3.0, text: 'America/Buenos_Aires'},
  {offset: -2.0, text: 'America/Noronha'},
  {offset: -1.0, text: 'Atlantic/Azores'},
  {offset: 0.0, text: 'Europe/London'},
  {offset: 1.0, text: 'Europe/Brussels'},
  {offset: 2.0, text: 'Europe/Copenhagen'},
  {offset: 3.0, text: 'Europe/Moscow'},
  {offset: 3.5, text: 'Asia/Tehran'},
  {offset: 4.0, text: 'Asia/Dubai'},
  {offset: 4.5, text: 'Asia/Kabul'},
  {offset: 5.0, text: 'Asia/Ashkhabad'},
  {offset: 5.5, text: 'Asia/Calcutta'},
  {offset: 5.75, text: 'Asia/Katmandu'},
  {offset: 6.0, text: 'Asia/Thimbu'},
  {offset: 6.5, text: 'Asia/Rangoon'},
  {offset: 7.0, text: 'Asia/Bangkok'},
  {offset: 8.0, text: 'Asia/Taipei'},
  {offset: 9.0, text: 'Asia/Tokyo'},
  {offset: 9.5, text: 'Australia/Darwin'},
  {offset: 10.0, text: 'Australia/Victoria'},
  {offset: 11.0, text: 'Asia/Magadan'},
  {offset: 12.0, text: 'Pacific/Auckland'}
];

const timezones = TIMEZONE_NAMES
.map((timezone, i) => <MenuItem value={timezone.text} key={`timezone-${i}`} primaryText={timezone.text}/>);

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
      timezone: TIMEZONE_NAMES[7].text,
    };
    this.onToggle = this._onToggle.bind(this);
    this.onRequestOpen = this._onRequestOpen.bind(this);
    this.onRequestClose = this._onRequestClose.bind(this);
  }

  componentDidUpdate(prevState) {
  }

  _onToggle(e, toggled) {
    const state = this.state;
    if (!toggled) this.props.clearUTCTime();
    const date = moment(state.date).minutes(state.minute).hour(state.hour);
    if (date < moment()) {
      alert(`Can't select date that is earlier than right now. Please pick another time.`);
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
                <DropDownMenu maxHeight={200} value={state.hour} onChange={(e, i, hour) => this.setState({date: state.date.hours(hour), hour})}>
                  {hours}
                </DropDownMenu> : 
                <DropDownMenu maxHeight={200} value={state.minute} onChange={(e, i, minute) => this.setState({date: state.date.minutes(minute), minute})}>
                  {minutes}
                </DropDownMenu>
              </div>
              <div className='vertical-center'>
                <span>Timezone Selection: </span>
                <DropDownMenu maxHeight={200} value={state.timezone} onChange={(e, i, timezone) => this.setState({timezone})}>
                  {timezones}
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
