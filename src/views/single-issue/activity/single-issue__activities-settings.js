/* @flow */

import styles from './single-issue-activity.styles';

import {View, Text, TouchableOpacity} from 'react-native';
import React, {Component} from 'react';

import type {UserAppearanceProfile} from '../../../flow/User';
import type {ActivityEnabledType} from '../../../flow/Activity';

import {getEntityPresentation} from '../../../components/issue-formatter/issue-formatter';
import {saveIssueActivityEnabledTypes} from './single-issue-activity__helper';

import apiHelper from '../../../components/api/api__helper';

import Select from '../../../components/select/select';
import ModalView from '../../../components/modal-view/modal-view';

import {COLOR_ICON_GREY, COLOR_ICON_MEDIUM_GREY} from '../../../components/variables/variables';
import {IconAngleDown, IconCheck} from '../../../components/icon/icon';
import selectStyles from '../../../components/select/select.styles';

type Props = {
  issueActivityTypes: Array<ActivityEnabledType>,
  issueActivityEnabledTypes: Array<ActivityEnabledType>,
  onApply: Function,
  userAppearanceProfile: UserAppearanceProfile,
  disabled?: boolean,
};

type State = {
  visible: boolean,
  select: {
    show: boolean,
    dataSource: () => Promise<Array<Object>>,
    onChangeSelection?: (selectedItems: Array<Object>) => any,
    multi: boolean,
    selectedItems: Array<ActivityEnabledType>,
    getTitle?: (item: Object) => string
  },
  naturalCommentsOrder: boolean,
};

const defaultState = {
  visible: false,
  select: {
    show: true,
    multi: true,
    selectedItems: [],
    dataSource: () => Promise.resolve([]),
    onChangeSelection: items => {}
  },
  naturalCommentsOrder: true,
};

type SettingsOrderItem = { label: string, isNaturalCommentsOrder: boolean };

export default class SingleIssueActivitiesSettings extends Component<Props, State> {
  constructor(props: Object) {
    super();

    const naturalCommentsOrder = props?.userAppearanceProfile?.naturalCommentsOrder;
    this.state = {
      ...defaultState,
      ...{naturalCommentsOrder: naturalCommentsOrder}
    };

    this.state.select.dataSource = () => Promise.resolve(props.issueActivityTypes);
    this.state.select.selectedItems = props.issueActivityEnabledTypes;
  }

  _toggleSettingsVisibility = () => {
    const {visible} = this.state;
    this.setState({visible: !visible});
  };

  _selectedTypesChanged(): boolean {
    return !apiHelper.equalsByProp(
      this.props.issueActivityEnabledTypes,
      this.state.select.selectedItems,
      'id'
    );
  }

  _onApplySettings() {
    const {select, naturalCommentsOrder} = this.state;
    const {userAppearanceProfile, onApply} = this.props;

    saveIssueActivityEnabledTypes(select.selectedItems);
    this._toggleSettingsVisibility();

    const isOrderChanged = userAppearanceProfile.naturalCommentsOrder !== naturalCommentsOrder;
    if (isOrderChanged || this._selectedTypesChanged()) {
      onApply({
        ...userAppearanceProfile,
        ...{naturalCommentsOrder: naturalCommentsOrder}
      });
    }
  }

  _renderSelect() {
    return (
      <Select
        style={styles.settingsSelect}
        {...this.state.select}
        noFilter={true}
        emptyValue={null}
        onSelect={() => {}}
        getTitle={getEntityPresentation}
        onCancel={this._toggleSettingsVisibility}
        onChangeSelection={(selectedItems) => this.setState({select: {...this.state.select, selectedItems}})}
        topPadding={0}
      />
    );
  }

  _renderSortOrderSettings() {
    const orderData: Array<SettingsOrderItem> = [
      {
        label: 'Sort: oldest first',
        isNaturalCommentsOrder: true
      },
      {
        label: 'Sort: newest first',
        isNaturalCommentsOrder: false
      }
    ];
    return (
      <View style={styles.settingsOrderSettings}>
        {orderData.map((it: SettingsOrderItem) => (
          <TouchableOpacity
            key={it.label}
            style={[selectStyles.row, {minHeight: 62}]}
            onPress={() => this.setState({naturalCommentsOrder: it.isNaturalCommentsOrder})}
          >
            <Text style={styles.settingsOrderSettingsText}>{it.label}</Text>
            {this.state.naturalCommentsOrder === it.isNaturalCommentsOrder && <IconCheck size={26} color={COLOR_ICON_GREY}/>}
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  _renderSettings() {
    const {visible, select} = this.state;

    return (
      <ModalView
        transparent={true}
        visible={visible}
        animationType={'slide'}
        style={styles.settingsModal}
      >
        <View style={styles.settingsModalContent}>
          {this._renderSelect()}
          {select.show && this._renderSortOrderSettings()}
          {select.show &&
          <TouchableOpacity
            style={[
              styles.settingsApplyButton,
              select.selectedItems.length === 0 ? styles.settingsApplyButtonDisabled : null
            ]}
            onPress={() => this._onApplySettings()}
            disabled={select.selectedItems.length === 0}
          >
            <Text style={styles.settingsApplyButtonText}>Apply</Text>
          </TouchableOpacity>}
        </View>
      </ModalView>
    );
  }

  render() {
    const selectedCategoriesTitle = this.state.select.selectedItems.map(
      (category) => category.name
    ).join(', ');
    return (
      <View>
        <TouchableOpacity
          disabled={this.props.disabled}
          style={styles.settingsToggle}
          onPress={this._toggleSettingsVisibility}
        >
          <Text style={styles.secondaryText}>{selectedCategoriesTitle} </Text>
          <IconAngleDown size={19} color={COLOR_ICON_MEDIUM_GREY}/>
        </TouchableOpacity>

        {this.state.visible && this._renderSettings()}
      </View>
    );
  }
}