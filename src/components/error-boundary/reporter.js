/* @flow */
import appPackage from '../../../package.json'; // eslint-disable-line import/extensions
import log from '../log/log';
import ResoureType from '../api/api__resource-types';

const {EXCEPTION_REPORTER_TOKEN} = appPackage.config;

if (!EXCEPTION_REPORTER_TOKEN) {
  log.debug('Exception robot token is not set');
}

const SERVER_URI = 'https://youtrack.jetbrains.com/api/issues?fields=idReadable';

const YOUTRACK_MOBILE_PROJECT_ID = '22-174';
const YOUTRACK_MOBILE_TEAM_ID = '10-603';

export async function reportCrash(summary: string, description: string): Promise<string> {
  const response = await fetch(SERVER_URI, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      Authorization: `Bearer ${EXCEPTION_REPORTER_TOKEN}`
    },
    body: JSON.stringify({
      summary,
      description,
      project: {id: YOUTRACK_MOBILE_PROJECT_ID},
      visibility: {
        $type: ResoureType.VISIBILITY_LIMITED,
        permittedGroups: [{id: YOUTRACK_MOBILE_TEAM_ID}]
      }
    })
  });
  const res: {idReadable: string} = await response.json();

  if (response.status > 400) {
    throw res;
  }

  return res.idReadable;
}
