import type {User} from './User';
import type {UserGroup} from './UserGroup';

export type Visibility = {
  $type: string,
  permittedUsers: Array<User>,
  permittedGroups: Array<UserGroup>,
}
