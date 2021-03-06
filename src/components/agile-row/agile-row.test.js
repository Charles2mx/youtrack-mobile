import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
import mocks from '../../../test/mocks';

import BoardRow from './agile-row';

describe('<BoardRow/>', () => {
  let wrapper;
  let issueMock;

  beforeEach(() => {
    issueMock = mocks.createIssueMock();
  });


  describe('Render', () => {

    beforeEach(() => {
      doShallow(createRowMock());
    });

    it('should render a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render a header', () => {
      expect(findByTestId('agileRowHeader')).toHaveLength(1);
    });

    it('should render a collapse button', () => {
      expect(findByTestId('agileRowCollapseButton')).toHaveLength(1);
    });

    describe('Issue id', () => {
      it('should not render an issue readable id', () => {
        expect(findByTestId('agileRowIssueId')).toHaveLength(0);
      });

      it('should render an issue readable id', () => {
        doShallow(createRowMock({issue: {idReadable: 'X-1'}}));

        expect(findByTestId('agileRowIssueId')).toHaveLength(1);
      });
    });

    describe('Column', () => {
      it('should render an expanded column', () => {
        expect(findByTestId('agileRowColumn')).toHaveLength(1);
        expect(findByTestId('agileRowColumnCollapsed')).toHaveLength(0);
      });

      describe('Collapsed column', () => {
        beforeEach(() => {
          const collapsedColumnIdMock = 'columnIdCollapsed';
          const rowMock = createRowMock({
            cells: [{
              id: '',
              issues: [issueMock],
              column: {
                id: collapsedColumnIdMock,
                collapsed: true
              }
            }]
          });
          doShallow(rowMock, [collapsedColumnIdMock]);
        });

        it('should render a collapsed column', () => {
          expect(findByTestId('agileRowColumn')).toHaveLength(0);
          expect(findByTestId('agileRowColumnCollapsed')).toHaveLength(1);
        });

        it('should render a color-coded rect represents a card', () => {
          expect(findByTestId('agileRowColumnCollapsedCard')).toHaveLength(1);
        });
      });
    });

    describe('Row', () => {
      it('should render a row', () => {
        doShallow(createRowMock({collapsed: false}));
        expect(findByTestId('agileRow')).toHaveLength(1);
      });

      it('should not render a collapsed row', () => {
        doShallow(createRowMock({collapsed: true}));
        expect(findByTestId('agileRowColumn')).toHaveLength(0);
      });
    });
  });


  function doShallow(row, collapsedColumnIds: ?Array<string> = []) {
    wrapper = shallow(<BoardRow row={row} collapsedColumnIds={collapsedColumnIds}/>);
  }

  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function createRowMock(...args) {
    return Object.assign({
      id: 'rowMockId',
      name: 'orphans',
      summary: 'summary',
      cells: [{
        id: 'id',
        row: {
          id: 'orphans',
        },
        column: {
          id: 'id',
          collapsed: false
        },
        issues: []
      }]
    }, ...args);
  }
});
