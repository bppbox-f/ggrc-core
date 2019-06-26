/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import Mixin from '../mixin';

export default class ScopeObjectNotifications extends Mixin {
  get send_by_default() {
    return true;
  }

  get recipients() {
    return 'Admin,Assignee,Verifier,Compliance Contacts,' +
    'Primary Contacts,Secondary Contacts,Product Managers,' +
    'Technical Leads,Technical / ' +
    'Program Managers,Legal Counsels,System Owners,' +
    'Line of Defense One Contacts,Vice Presidents';
  }
}
