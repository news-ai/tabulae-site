import React, {Component} from 'react';
import {connect} from 'react-redux';

import FontIcon from 'material-ui/FontIcon';
import {blue400, grey700} from 'material-ui/styles/colors';

import DatePicker from 'antd/lib/date-picker';
import Popover from 'antd/lib/Popover';
import 'antd/lib/date-picker/style/css';
import 'antd/lib/popover/style/css';
import 'antd/lib/button/style/css';
import moment from 'moment-timezone';

const rightNow = moment(new Date());

class DatePickerWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: null,
      visible: false
    };
    this.hide = _ => this.setState({visible: false});
    this.handlePopover = this._handlePopover.bind(this);
    this.onTimeChange = this._onTimeChange.bind(this);
  }

  _handlePopover(visible) {
    if (visible) this.setState({visible});
  }

  _onTimeChange(date, datestring) {
    if (date === null) {
      this.props.clearUTCTime();
      this.setState({visible: false});
      return;
    }
    if (this.state.date !== null && date < this.state.date)  {
      alert(`Can't select date that is earlier than right now. Please pick another time.`);
      return;
    }
    this.setState({date, visible: false});
    this.props.setUTCTime(date.utc().format());
  }

  render() {
    const state = this.state;
    const props = this.props;
    const content = (
      <DatePicker
      showTime
      showToday={false}
      format='YYYY-MM-DD HH:mm:ss'
      placeholder='Select Time'
      value={state.date}
      onChange={this.onTimeChange}
      />);
    return (
      <Popover
      content={content}
      visible={state.visible}
      trigger='click'
      onVisibleChange={this.handlePopover}
      >
        <FontIcon
        className='fa fa-calendar pointer'
        color={props.isTimeSet ? blue400 : grey700}
        />
      </Popover>
    );
  }
}


const mapStateToProps = (state, props) => {
  return {
    isTimeSet: state.stagingReducer.utctime !== null
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setUTCTime: utctime => dispatch({type: 'SET_SCHEDULE_TIME', utctime}),
    clearUTCTime: _ => dispatch({type: 'CLEAR_SCHEDULE_TIME'})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DatePickerWrapper);

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
