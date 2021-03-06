/* @flow */

import React, {PureComponent} from 'react';
import {TouchableOpacity} from 'react-native';

import {IconStar} from '../icon/icon';
import {COLOR_ICON_MEDIUM_GREY, COLOR_PINK} from '../variables/variables';
import {HIT_SLOP} from '../common-styles/button';

type Props = {
  style?: any,
  starred: boolean,
  canStar: boolean,
  onStarToggle: (starred: boolean) => any
}

export default class IssueStar extends PureComponent<Props, void> {

  render() {
    const {starred, canStar, onStarToggle, style} = this.props;

    if (!canStar) {
      return null;
    }

    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={style}
        onPress={() => onStarToggle(!starred)}>
        <IconStar
          size={22}
          color={starred ? COLOR_PINK : COLOR_ICON_MEDIUM_GREY}
        />
      </TouchableOpacity>
    );
  }
}
