import IssuePermissions, {CREATE_ISSUE, READ_ISSUE, UPDATE_ISSUE, CAN_UPDATE_COMMENT, PRIVATE_UPDATE_ISSUE} from './issue-permissions';
import sinon from 'sinon';

describe('IssuePermissions', function () {
  const USER_ID = 'some-user-id';
  const PROJECT_ID = 'some-project-id';

  beforeEach(() => {
    this.permissionsMock = {
      has: sinon.stub().returns(false),
      hasEvery: sinon.stub().returns(false)
    };

    this.issueMock = {
      reporter: {ringId: USER_ID},
      project: {
        ringId: PROJECT_ID,
        plugins: {
          timeTrackingSettings: {
            enabled: false,
            spentTime: undefined
          }
        }
      }
    };

    this.commentMock = {
      author: {
        ringId: USER_ID
      }
    };

    this.fieldMock = {
      projectCustomField: {
        isPublic: true,
        field: {
          id: 'some-field',
        }
      }
    };

    this.issuePermissions = new IssuePermissions(this.permissionsMock, {id: USER_ID});
  });

  it('should init', () => {
    this.issuePermissions.should.be.defined;
  });

  describe('canUpdateGeneralInfo', () => {
    it('should allow to edit general info if user is reporter and has READ_ISSUE', () => {
      this.permissionsMock.has.withArgs(CREATE_ISSUE).returns(true);
      this.issuePermissions.canUpdateGeneralInfo(this.issueMock).should.be.true;
    });

    it('should not allow to edit issue if user is not reporter but has READ_ISSUE', () => {
      this.issueMock.reporter = {id: 'foo'};
      this.permissionsMock.has.withArgs(CREATE_ISSUE).returns(true);
      this.issuePermissions.canUpdateGeneralInfo(this.issueMock).should.be.false;
    });

    it('should not allow to edit issue if user is reporter but not has READ_ISSUE', () => {
      this.issuePermissions.canUpdateGeneralInfo(this.issueMock).should.be.false;
    });

    it('should allow to edit if user is not reporter but has UPDATE_ISSUE and READ_ISSUE', () => {
      this.issueMock.reporter = {id: 'foo'};
      this.permissionsMock.hasEvery.withArgs([READ_ISSUE, UPDATE_ISSUE]).returns(true);

      this.issuePermissions.canUpdateGeneralInfo(this.issueMock).should.be.true;
    });

    it('should not allow to edit if user is not reporter but has READ_ISSUE and not has UPDATE_ISSUE', () => {
      this.issueMock.reporter = {id: 'foo'};
      this.issuePermissions.canUpdateGeneralInfo(this.issueMock).should.be.false;
    });
  });

  describe('canEditComment', () => {
    it('should allow to edit own comment if has update permission', () => {
      this.permissionsMock.has.withArgs(CAN_UPDATE_COMMENT).returns(true);

      this.issuePermissions.canEditComment(this.issueMock, this.commentMock).should.be.true;
    });

    it('should not allow to edit not own comment if don\'t have update-not-own permission', () => {
      this.permissionsMock.has.withArgs(CAN_UPDATE_COMMENT).returns(true);
      this.commentMock.author = {id: 'foo'};

      this.issuePermissions.canEditComment(this.issueMock, this.commentMock).should.be.false;
    });
  });

  describe('canUpdateField', () => {
    it('should allow to edit public field to reporter even if only CREATE_ISSUE permission', () => {
      this.permissionsMock.has.withArgs(CREATE_ISSUE).returns(true);
      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.true;
    });

    it('should not allow to edit public field if not reporter and has no PRIVATE_UPDATE_ISSUE', () => {
      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.false;
    });

    it('should allow to edit public field if has PRIVATE_UPDATE_ISSUE', () => {
      this.permissionsMock.has.withArgs(PRIVATE_UPDATE_ISSUE).returns(true);
      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.true;
    });

    it('should not allow to update private field if has no PRIVATE_UPDATE_ISSUE', () => {
      this.fieldMock.projectCustomField.isPublic = false;
      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.false;
    });

    it('should allow to update private field if has PRIVATE_UPDATE_ISSUE', () => {
      this.fieldMock.projectCustomField.isPublic = false;
      this.permissionsMock.has.withArgs(PRIVATE_UPDATE_ISSUE).returns(true);
      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.true;
    });

    it('should not allow to edit spentTime field', () => {
      this.permissionsMock.has.withArgs(PRIVATE_UPDATE_ISSUE).returns(true);
      const {timeTrackingSettings} = this.issueMock.project.plugins;
      timeTrackingSettings.enabled = true;
      timeTrackingSettings.timeSpent = {
        field: {id: this.fieldMock.projectCustomField.field.id}
      };

      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.false;
    });

    it('should allow to edit spentTime field if old youtrack (no "plugins" field in old YT)', () => {
      this.permissionsMock.has.withArgs(PRIVATE_UPDATE_ISSUE).returns(true);
      delete this.issueMock.project.plugins;
      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.true;
    });

    it('should allow to edit any other time field', () => {
      this.permissionsMock.has.withArgs(PRIVATE_UPDATE_ISSUE).returns(true);
      const {timeTrackingSettings} = this.issueMock.project.plugins;
      timeTrackingSettings.enabled = true;
      timeTrackingSettings.timeSpent = {
        field: {id: 'some-another-field'}
      };

      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.true;
    });
  });
});
