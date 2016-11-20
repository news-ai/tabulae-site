import React, {Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import DatePicker from 'react-datepicker';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';

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

/* const timezone_names = [
  {offset: -11.0, text: '(GMT -11:00) Midway Island, Samoa'},
  {offset: -10.0, text: '(GMT -10:00) Hawaii'},
  {offset: -9.0, text: '(GMT -9:00) Alaska'},
  {offset: -8.0, text: '(GMT -8:00) Pacific Time (US & Canada)'},
  {offset: -12.0, text: '(GMT -12:00) Eniwetok, Kwajalein'},
  {offset: -7.0, text: '(GMT -7:00) Mountain Time (US & Canada)'},
  {offset: -6.0, text: '(GMT -6:00) Central Time (US & Canada)'},
  {offset: -5.0, text: '(GMT -5:00) Eastern Time (US & Canada)'},
  {offset: -4.0, text: '(GMT -4:00) Atlantic Time (Canada)'},
  {offset: -3.5, text: '(GMT -3:30) Newfoundland'},
  {offset: -3.0, text: '(GMT -3:00) Brazil, Buenos Aires, Georgetown'},
  {offset: -2.0, text: '(GMT -2:00) Mid-Atlantic'},
  {offset: -1.0, text: '(GMT -1:00) Azores, Cape Verde Islands'},
  {offset: 0.0, text: '(GMT) Western Europe Time, London'},
  {offset: 1.0, text: '(GMT +1:00) Brussels, Copenhagen, Madrid, Paris'},
  {offset: 2.0, text: '(GMT +2:00) Kaliningrad, South Africa'},
  {offset: 3.0, text: '(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg'},
  {offset: 3.5, text: '(GMT +3:30) Tehran'},
  {offset: 4.0, text: '(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi'},
  {offset: 4.5, text: '(GMT +4:30) Kabul'},
  {offset: 5.0, text: '(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent'},
  {offset: 5.5, text: '(GMT +5:30) Bombay, Calcutta, Madras, New Delhi'},
  {offset: 5.75, text: '(GMT +5:45) Kathmandu'},
  {offset: 6.0, text: '(GMT +6:00) Almaty, Dhaka, Colombo'},
  {offset: 7.0, text: '(GMT +7:00) Bangkok, Hanoi, Jakarta'},
  {offset: 8.0, text: '(GMT +8:00) Beijing, Perth, Singapore, Hong Kong'},
  {offset: 9.0, text: '(GMT +9:00) Tokyo, Seoul, Osaka'},
  {offset: 9.5, text: '(GMT +9:30) Adelaide, Darwin'},
  {offset: 10.0, text: '(GMT +10:00) Eastern Australia, Guam, Vladivostok'},
  {offset: 11.0, text: '(GMT +11:00) Magadan, Solomon Islands, New Caledonia'},
  {offset: 12.0, text: '(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka'}
]; */

const timezone_names = [
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

const timezones = timezone_names
.map((timezone, i) => <MenuItem value={timezone.offset} key={`timezone-${i}`} primaryText={timezone.text}/>);

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
      timezone: timezone_names[7].offset,
    };
    this.onToggle = this._onToggle.bind(this);
    this.onRequestOpen = this._onRequestOpen.bind(this);
    this.onRequestClose = this._onRequestClose.bind(this);
  }

  componentDidUpdate(prevState) {
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
      const datestring = date.utcOffset(parseInt(this.state.timezone * 60, 10)).format('YYYYMMDD HHmmss ZZ');
      console.log(date);
      console.log(datestring);
      console.log(this.state.timezone);
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
      <div>
        <Dialog title='Schedule for Later' autoScrollBodyContent open={state.open} onRequestClose={this.onRequestClose}>
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DatePickerHOC);
