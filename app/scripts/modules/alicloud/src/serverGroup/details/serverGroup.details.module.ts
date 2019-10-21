'use strict';

const angular = require('angular');
import { ALICLOUD_SERVERGROUP_DETAILSCTRL } from './serverGroupDetails.alicloud.controller'

export const ALICLOUD_SERVERGROUP_DETAILS = 'spinnaker.alicloud.serverGroup.details.alicloud';
angular.module(ALICLOUD_SERVERGROUP_DETAILS, [
  ALICLOUD_SERVERGROUP_DETAILSCTRL,
]);
