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

const timezone_names = [
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
];

const timezones = timezone_names
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
      timezone: moment.tz.guess(),
    };
    this.onToggle = this._onToggle.bind(this);
  }

  componentDidUpdate(prevState) {
    if (!prevState.open && this.state.open && !this.state.toggled) {
      const today = new Date();
      const rightNow = moment(today);
      this.state = {
        open: true,
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
