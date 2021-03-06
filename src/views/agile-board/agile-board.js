/* @flow */

import {View, Text, RefreshControl, TouchableOpacity, ActivityIndicator, Dimensions} from 'react-native';
import React, {Component} from 'react';
import usage from '../../components/usage/usage';
import Select from '../../components/select/select';
import styles from './agile-board.styles';
import log from '../../components/log/log';
import BoardHeader from './board-header';
import BoardRow from '../../components/agile-row/agile-row';
import AgileCard from '../../components/agile-card/agile-card';
import BoardScroller, {COLUMN_SCREEN_PART} from '../../components/board-scroller/board-scroller';
import Router from '../../components/router/router';
import Auth from '../../components/auth/auth';
import {Draggable, DragContainer} from '../../components/draggable/';
import Api from '../../components/api/api';
import {
  COLOR_PINK,
  AGILE_COLLAPSED_COLUMN_WIDTH,
  COLOR_FONT_ON_BLACK,
  UNIT
} from '../../components/variables/variables';
import {getStorageState, flushStoragePart} from '../../components/storage/storage';
import type {SprintFull, Board, AgileBoardRow, AgileColumn} from '../../flow/Agile';
import type {IssueOnList} from '../../flow/Issue';
import type {AgilePageState} from './board-reducers';

import * as boardActions from './board-actions';
import {connect} from 'react-redux';
import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import ModalView from '../../components/modal-view/modal-view';
import ErrorMessageInline from '../../components/error-message/error-message-inline';
import {HIT_SLOP} from '../../components/common-styles/button';
import {IconMagnifyZoom} from '../../components/icon/icon';
import {renderNavigationItem} from './agile-board__renderer';
import {View as AnimatedView} from 'react-native-animatable';
import {routeMap} from '../../app-routes';

const CATEGORY_NAME = 'Agile board';

type Props = AgilePageState & {
  auth: Auth,
  api: Api,
  isLoadingMore: boolean,
  noMoreSwimlanes: boolean,
  sprint: ?SprintFull,
  isSprintSelectOpen: boolean,
  selectProps: Object,
  issuePermissions: IssuePermissions,
  onLoadBoard: () => any,
  onLoadMoreSwimlanes: () => any,
  onRowCollapseToggle: (row: AgileBoardRow) => any,
  onColumnCollapseToggle: (column: AgileColumn) => any,
  onOpenSprintSelect: (any) => any,
  onOpenBoardSelect: (any) => any,
  onCloseSelect: (any) => any,
  createCardForCell: (columnId: string, cellId: string) => any,
  onCardDrop: (any) => any,
  refreshAgile: (agileId: string, sprintId: string) => any,
  toggleRefreshPopup: (isOutOfDate: boolean) => any
};

type State = {
  zoomedIn: boolean,
  stickElement: { agile: boolean, boardHeader: boolean },
  offsetY: number
};

class AgileBoard extends Component<Props, State> {
  boardHeader: ?BoardHeader;

  constructor(props: Props) {
    super(props);
    this.state = {
      zoomedIn: getStorageState().agileZoomedIn ?? true,
      stickElement: {
        agile: false,
        boardHeader: false
      },
      offsetY: 0
    };
    Router.setOnDispatchCallback(this.onBoardLeave);
  }

  componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
    this.props.onLoadBoard();
  }

  onBoardLeave = (routeName: string, prevRouteName?: string) => {
    const agileBoardRouteName = routeMap.AgileBoard;
    if (routeName !== agileBoardRouteName && prevRouteName === agileBoardRouteName) {
      boardActions.destroySSE();
      this.props.toggleRefreshPopup(false);
    }
  }

  onVerticalScroll = (event) => {
    const {nativeEvent} = event;
    const newY = nativeEvent.contentOffset.y;
    const viewHeight = nativeEvent.layoutMeasurement.height;
    const contentHeight = nativeEvent.contentSize.height;
    const maxY = contentHeight - viewHeight;

    if (maxY > 0 && newY > 0 && (maxY - newY) < 40) {
      this.props.onLoadMoreSwimlanes();
    }

    this.setState({
      stickElement: {
        agile: newY > UNIT * 4,
        boardHeader: newY > UNIT * 16
      }
    });
  };

  onContentSizeChange = (width, height) => {
    const windowHeight = Dimensions.get('window').height;
    if (height < windowHeight) {
      this.props.onLoadMoreSwimlanes();
    }
  };

  syncHeaderPosition = (event) => {
    const {nativeEvent} = event;
    if (this.boardHeader) {
      this.boardHeader.setNativeProps({
        style: {left: -nativeEvent.contentOffset.x}
      });
    }
  };

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={this.props.isLoading}
      tintColor={this.props.isLoadingAgile ? COLOR_FONT_ON_BLACK : COLOR_PINK}
      onRefresh={() => this.props.onLoadBoard()}
    />;
  }

  _onTapIssue = (issue: IssueOnList) => {
    log.debug(`Opening issue "${issue.id}" from Agile Board`);
    usage.trackEvent(CATEGORY_NAME, 'Open issue');
    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id
    });
  };

  _getScrollableWidth = (): number | null => {
    const {sprint} = this.props;

    if (!sprint || !sprint.board || !sprint.board.columns) {
      return null;
    }

    const COLUMN_WIDTH = Dimensions.get('window').width * COLUMN_SCREEN_PART;
    return sprint.board.columns
      .map(col => col.collapsed ? AGILE_COLLAPSED_COLUMN_WIDTH : COLUMN_WIDTH)
      .reduce((res, item) => res + item, 0);
  };

  renderAgileSelector() {
    const {agile, onOpenBoardSelect, isLoading} = this.props;
    if (agile) {
      return renderNavigationItem({
        key: agile.id,
        label: agile.name,
        onPress: onOpenBoardSelect,
        style: styles.agileSelector,
        textStyle: styles.agileSelectorText,
        isLoading,
        showBottomBorder: this.state.stickElement.agile
      });
    }
  }

  renderSprintSelector() {
    const {sprint, onOpenSprintSelect, isLoading} = this.props;
    if (sprint) {
      return renderNavigationItem({
        key: sprint.id,
        label: sprint.name,
        onPress: onOpenSprintSelect,
        isLoading
      });
    }
  }

  renderZoomButton() {
    const {isLoading, isLoadingAgile, sprint} = this.props;
    const {zoomedIn, stickElement} = this.state;

    if (!stickElement.boardHeader && !isLoading && !isLoadingAgile && sprint) {
      return (
        <AnimatedView
          useNativeDriver
          duration={300}
          animation="zoomIn"
          style={styles.zoomButton}
        >
          <TouchableOpacity
            onPress={this.toggleZoom}
          >
            <IconMagnifyZoom zoomedIn={zoomedIn} size={24}/>
          </TouchableOpacity>
        </AnimatedView>
      );
    }

    return null;
  }

  boardHeaderRef = (instance: ?BoardHeader) => {
    if (instance) {
      this.boardHeader = instance;
    }
  };

  renderBoardHeader() {
    const {zoomedIn} = this.state;

    if (this.props.sprint) {
      return (
        <View style={styles.boardHeaderContainer}>
          <BoardHeader
            ref={this.boardHeaderRef}
            style={{minWidth: zoomedIn ? this._getScrollableWidth() : null}}
            columns={this.props.sprint.board?.columns}
            onCollapseToggle={this.props.onColumnCollapseToggle}
          />
        </View>
      );
    }
  }

  _renderSelect() {
    const {selectProps} = this.props;
    return (
      <Select
        getTitle={item => item.name}
        onCancel={this.props.onCloseSelect}
        {...selectProps}
      />
    );
  }

  renderRefreshPopup() {
    const {sprint, refreshAgile, toggleRefreshPopup} = this.props;

    if (!sprint || !sprint.agile) {
      return null;
    }

    return (
      <ModalView
        transparent={true}
        style={styles.popupModal}
        visible
        animationType="slide"
        onRequestClose={() => true}
      >
        <View style={styles.popupPanel}>
          <Text style={styles.popupText}>
            The current sprint is out of date. Reload it to avoid data loss or any other inconsistency.
          </Text>

          <View style={styles.popupButtons}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              style={styles.popupButton}
              onPress={() => refreshAgile(sprint.agile.id, sprint.id)}>
              <Text style={styles.popupButtonText}>Refresh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              hitSlop={HIT_SLOP}
              style={styles.popupButton}
              onPress={() => toggleRefreshPopup(false)}>
              <Text style={styles.popupButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ModalView>
    );
  }

  renderErrors() {
    const errors: Array<?string> = this.props.agile?.status?.errors || [];

    if (errors.length > 0) {
      return (
        <View>
          <Text style={styles.title}>Agile board has configuration errors:</Text>
          {errors.map(
            (errorText, index) => <ErrorMessageInline key={`agileError-${index}`} error={errorText}/>)
          }
        </View>
      );
    }
  }

  renderSprint(sprint: SprintFull) {
    const board: Board = sprint?.board;

    if (!sprint || !board) {
      return null;
    }

    const commonRowProps = {
      collapsedColumnIds: (board.columns || []).filter(col => col.collapsed).map(col => col.id),
      onTapIssue: this._onTapIssue,
      onTapCreateIssue: this.props.createCardForCell,
      onCollapseToggle: this.props.onRowCollapseToggle,
      renderIssueCard: (issue: IssueOnList) => {
        const canDrag = sprint.agile.isUpdatable || this.props.issuePermissions.canRunCommand(issue);
        return (
          <Draggable
            key={issue.id}
            data={issue.id}
            onPress={() => this._onTapIssue(issue)}
            disabled={!canDrag}
          >
            <AgileCard
              issue={issue}
              style={styles.card}
              estimationField={sprint.agile.estimationField}
              zoomedIn={this.state.zoomedIn}
            />
          </Draggable>
        );
      }
    };

    const orphan = <BoardRow key="orphan" row={board.orphanRow} {...commonRowProps}/>;

    return [
      sprint.agile.orphansAtTheTop && orphan,

      board.trimmedSwimlanes.map((swimlane: Object & { id: string }) => {
        return (
          <BoardRow
            key={swimlane.id}
            row={swimlane}
            {...commonRowProps}
          />
        );
      }),

      !sprint.agile.orphansAtTheTop && orphan,
    ];
  }

  onDragStart() {
    usage.trackEvent(CATEGORY_NAME, 'Card drag start');
  }

  onDragEnd = (draggingComponent: Object, hitZones: Array<Object>) => {
    const movedId = draggingComponent.data;
    const dropZone = hitZones[0];
    if (!dropZone) {
      return;
    }

    this.props.onCardDrop({
      columnId: dropZone.data.columnId,
      cellId: dropZone.data.cellId,
      leadingId: dropZone.data.issueIds
        .filter(id => id !== movedId)[dropZone.placeholderIndex - 1],
      movedId
    });
  };

  toggleZoom = () => {
    const zoomedIn = !this.state.zoomedIn;
    this.setState({zoomedIn});
    flushStoragePart({agileZoomedIn: zoomedIn});
  };

  renderBoard() {
    const {agile, sprint, isLoadingMore, isLoading} = this.props;
    const {zoomedIn} = this.state;
    const isSprintLoaded = agile?.status?.valid === true && !!sprint && !isLoading;

    return (
      <DragContainer onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
        <BoardScroller
          columns={sprint?.board?.columns}
          snap={zoomedIn}
          refreshControl={this._renderRefreshControl()}
          horizontalScrollProps={{
            contentContainerStyle: {
              display: 'flex',
              flexDirection: 'column',
              width: zoomedIn ? this._getScrollableWidth() : '100%'
            },
            onScroll: this.syncHeaderPosition
          }}
          verticalScrollProps={{
            onScroll: this.onVerticalScroll,
            onContentSizeChange: this.onContentSizeChange,
            contentContainerStyle: {
              minHeight: '100%'
            }
          }}

          agileSelector={this.renderAgileSelector()}
          sprintSelector={isSprintLoaded && this.renderSprintSelector()}
          boardHeader={isSprintLoaded && this.renderBoardHeader()}

        >

          {this.renderSprint(sprint)}
          {isLoadingMore && <ActivityIndicator color={COLOR_PINK} style={styles.loadingMoreIndicator}/>}

        </BoardScroller>
      </DragContainer>
    );
  }

  render() {
    const {sprint, isSprintSelectOpen, isOutOfDate, isLoading, isLoadingAgile} = this.props;

    return (
      <View
        testID="pageAgile"
        style={styles.agile}
      >

        {this.renderZoomButton()}

        {this.renderErrors()}

        {this.renderBoard()}

        {isSprintSelectOpen && this._renderSelect()}

        {isOutOfDate && this.renderRefreshPopup()}

        {Boolean(isLoadingAgile || (!sprint && isLoading)) && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="large" color={COLOR_PINK}/>
          </View>
        )}
      </View>
    );
  }
}


const mapStateToProps = (state, ownProps) => {
  return {
    ...state.agile,
    ...state.app
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadBoard: () => dispatch(boardActions.loadDefaultAgileBoard()),
    onLoadMoreSwimlanes: () => dispatch(boardActions.fetchMoreSwimlanes()),
    onRowCollapseToggle: (row) => dispatch(boardActions.rowCollapseToggle(row)),
    onColumnCollapseToggle: (column) => dispatch(boardActions.columnCollapseToggle(column)),
    onOpenSprintSelect: () => dispatch(boardActions.openSprintSelect()),
    onOpenBoardSelect: () => dispatch(boardActions.openBoardSelect()),
    onCloseSelect: () => dispatch(boardActions.closeSelect()),
    createCardForCell: (...args) => dispatch(boardActions.createCardForCell(...args)),
    onCardDrop: (...args) => dispatch(boardActions.onCardDrop(...args)),
    refreshAgile: (agileId: string, sprintId: string) => dispatch(boardActions.refreshAgile(agileId, sprintId)),
    toggleRefreshPopup: (isOutOfDate: boolean) => dispatch(boardActions.setOutOfDate(isOutOfDate))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AgileBoard);
