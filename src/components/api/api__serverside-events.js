/* @flow */
import RNEventSource from '@huston007/react-native-eventsource';
import qs from 'qs';
import log from '../../components/log/log';
import agileFields from './api__agile-fields';
import apiHelper from './api__helper';

export default class ServersideEvents {
  backendUrl: string;
  lastPing: ?Date;
  eventSource: RNEventSource;

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;
  }

  subscribeAgileBoardUpdates(ticket: string) {
    const queryString = qs.stringify(
      {
        ticket,
        fields: agileFields.liveUpdate.toString()
      },
      {encode: false}
    );

    this.eventSource = new RNEventSource(`${this.backendUrl}/api/eventSourceBus?${queryString}`);

    this.eventSource.addEventListener('open', () => log.info('SSE connection opened'));

    this.eventSource.addEventListener('error', (event) => {
      if (event?.target?.readyState !== this.eventSource?.CLOSED) {
        this.close();
      }
      return log.info('SSE connection closed', event);
    });

    this.eventSource.addEventListener('ping', () => this.lastPing = new Date());
  }

  listenTo(eventName: string, callback: any => any) {
    this.eventSource.addEventListener(eventName, event => {
      const data = event.data ? JSON.parse(event.data) : event;

      if (event.data) {
        apiHelper.patchAllRelativeAvatarUrls(data, this.backendUrl);
      }

      return callback(data);
    });
  }

  close() {
    // this.eventSource.removeAllListeners();
    this.eventSource.close();
  }
}
