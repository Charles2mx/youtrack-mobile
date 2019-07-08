/* @flow */
import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';

import type {IssueOnList} from '../../flow/Issue';
import type {BundleValue} from '../../flow/CustomFields';

import ColorField from '../../components/color-field/color-field';
import Tags from '../../components/tags/tags';
import {next} from '../../components/icon/icon';
import {COLOR_FONT_GRAY} from '../../components/variables/variables';
import {getPriotityField, getForText, getEntityPresentation} from '../../components/issue-formatter/issue-formatter';

import styles from './issue-list.styles';

type Props = {
  issue: IssueOnList,
  onClick: Function,
  onTagPress: (query: string) => any
};

export default class IssueRow extends Component<Props, void> {
  static _getSubText(issue) {
    const issueIdStyle = issue.resolved ? {textDecorationLine: 'line-through'} : null;

    return (<Text>
      <Text style={issueIdStyle}>{issue.idReadable}</Text>
      <Text> by {getEntityPresentation(issue.reporter)} {getForText(issue.fieldHash.Assignee)}</Text>
    </Text>);
  }

  getSummaryStyle(issue: IssueOnList) {
    if (issue.resolved) {
      return {
        color: COLOR_FONT_GRAY,
        fontWeight: '200'
      };
    }
  }

  renderPriority() {
    const priorityField = getPriotityField(this.props.issue);
    if (!priorityField || !priorityField.value || priorityField.value.length === 0) {
      return <View style={styles.priorityPlaceholder}/>;
    }
    const values: Array<BundleValue> = [].concat(priorityField.value);
    const LAST = values.length - 1;

    return (
      <ColorField
        text={values[LAST].name}
        color={values[LAST].color}
      />
    );
  }

  render() {
    const {issue, onTagPress} = this.props;

    return (
      <TouchableOpacity onPress={() => this.props.onClick(issue)} testID="issue-row">
        <View style={styles.row}>

          <View>
            <View style={styles.priorityWrapper}>{this.renderPriority()}</View>
          </View>

          <View style={styles.rowText}>

            <View style={styles.rowTopLine}>
              <Text style={[styles.summary, this.getSummaryStyle(issue)]} numberOfLines={2} testID="issue-row-summary">
                {issue.summary}
              </Text>
              <Image style={styles.arrowImage} source={next}></Image>
            </View>

            <Text style={styles.subtext} numberOfLines={1} testID="issue-row-details">{IssueRow._getSubText(issue)}</Text>

            {Boolean(issue.tags && issue.tags.length) &&
            <View style={styles.tags}>
              <Tags tags={issue.tags} onTagPress={onTagPress}/>
            </View>}

          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
