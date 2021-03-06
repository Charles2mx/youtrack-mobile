/* @flow */

import {StyleSheet} from 'react-native';

import {
  UNIT,
  COLOR_LIGHT_GRAY,
  COLOR_ICON_LIGHT_BLUE
} from '../variables/variables';
import {issueCard, secondaryText} from '../common-styles/issue';

export default StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginBottom: UNIT,
    marginRight: UNIT * 2,
    borderRadius: UNIT,
    overflow: 'hidden',
    backgroundColor: COLOR_LIGHT_GRAY
  },
  cardColorCoding: {
    flexShrink: 0,
    marginTop: UNIT / 4,
    marginBottom: UNIT / 4,
    width: UNIT / 2,
    borderTopLeftRadius: UNIT,
    borderBottomLeftRadius: UNIT
  },
  cardContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    padding: UNIT * 2,
    paddingTop: UNIT * 1.75,
    paddingBottom: UNIT * 1.75,
  },
  cardContainerNotZoomed: {
    padding: UNIT,
  },
  cardContent: {
    flexDirection: 'column'
  },
  issueHeader: {
    flexDirection: 'row'
  },
  issueHeaderLeft: {
    flexGrow: 1,
  },
  ghost: {
    display: 'none'
  },
  dragging: {
    width: '80%',
    borderWidth: 2,
    borderColor: COLOR_ICON_LIGHT_BLUE
  },
  draggingZoomedOut: {
    width: '20%'
  },
  estimation: {
    marginRight: UNIT,
    ...secondaryText
  },
  summary: {
    ...issueCard.issueSummary,
  },
  issueId: issueCard.issueId,
  assignees: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  assignee: {
    marginLeft: UNIT / 2
  },
  tags: {
    marginTop: UNIT
  },
  zoomedInText: {
    fontSize: 11
  }
});
