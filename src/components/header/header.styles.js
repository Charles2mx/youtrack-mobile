import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK} from '../variables/variables';

export default StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: UNIT,
    paddingRight: UNIT,
    flex: 0,
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtonLeft: {
    justifyContent: 'flex-start'
  },
  headerButtonRight: {
    justifyContent: 'flex-end'
  },
  headerButtonText: {
    fontSize: 17,
    color: COLOR_PINK
  },
  headerCenter: {
    flex: 1,
    alignItems: 'flex-start',
    flexShrink: 1,
    padding: 0,
    paddingLeft: UNIT * 2,
  }
});
