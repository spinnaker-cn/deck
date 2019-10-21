'use strict';

const angular = require('angular');
import { ALICLOUD_SERVERGROUP_BASICSETTING } from './wizard/basicSettings/ServerGroupBasicSettings.controller';
import { ALICLOUD_SERVERGROUP_LOADBALANCER } from './wizard/loadBalancers/ServerGroupLoadBalancers.controller';
import { ALICLOUD_SERVERGROUP_TRANSFORMER } from '../serverGroup.transformer';
import { ALICLOUD_SERVERGROUP_INSTANCEARCHETYPE } from './wizard/ServerGroupInstanceArchetype.controller';
import { ALICLOUD_SERVERGROUP_INSTANCETYPE } from './wizard/ServerGroupInstanceType.controller';
import { ALICLOUD_SERVERGROUP_SECURITY } from './wizard/securityGroup/ServerGroupSecurityGroups.controller';
import { ALICLOUD_SERVERGROUP_ADVANCEDSETTING } from './wizard/advancedSettings/ServerGroupAdvancedSettings.controller';
import { ALICLOUD_SERVERGROUP_LOADBALACNER_DIRECTIVE } from './wizard/loadBalancers/serverGroupLoadBalancersSelector.directive';
import { ALICLOUD_SERVERGROUP_CAPACITY_DIRECTIVE } from './wizard/capacity/capacitySelector.directive';
import { ALICLOUD_SERVERGROUP_SECURITY_DIRECTIVE } from './wizard/securityGroup/serverGroupSecurityGroupsSelector.directive';
import { ALICLOUD_SERVERGROUP_ADVANCEDSETTING_DIRECTIVE } from './wizard/advancedSettings/advancedSettingsSelector.directive';
import { ALICLOUD_SERVERGROUP_NETWORKSETTING } from './wizard/networkSettings/ServerGroupNetworkSettings.controller';
import { ALICLOUD_SERVERGROUP_NETWORKSETTING_DIRECTIVE } from './wizard/networkSettings/ServerGroupNetworkSettingsSelector.directive';
import { ALICLOUD_SERVERGROUP_TAGS } from './wizard/tags/tagsSelector.directive';
import { ALICLOUD_SERVERGROUP_INSTANCE } from './wizard/securityGroup/securityGroupInstance.directive';
import { ALICLOUD_SERVERGROUP_IMAGEID } from './wizard/securityGroup/securityGroupImageId.directive';
import { ALICLOUD_SERVERGROUP_ZONE_DIRECTIVE } from './wizard/zones/zoneSelector.directive';

export const ALICLOUD_SERVERGROUP_CONFIGURE = 'spinnaker.alicloud.serverGroup.configure';
angular.module(ALICLOUD_SERVERGROUP_CONFIGURE, [
  ALICLOUD_SERVERGROUP_BASICSETTING,
  ALICLOUD_SERVERGROUP_LOADBALANCER,
  ALICLOUD_SERVERGROUP_INSTANCEARCHETYPE,
  ALICLOUD_SERVERGROUP_INSTANCETYPE,
  ALICLOUD_SERVERGROUP_INSTANCE,
  ALICLOUD_SERVERGROUP_IMAGEID,
  ALICLOUD_SERVERGROUP_SECURITY,
  ALICLOUD_SERVERGROUP_ADVANCEDSETTING,
  ALICLOUD_SERVERGROUP_LOADBALACNER_DIRECTIVE,
  ALICLOUD_SERVERGROUP_CAPACITY_DIRECTIVE,
  ALICLOUD_SERVERGROUP_SECURITY_DIRECTIVE,
  ALICLOUD_SERVERGROUP_TRANSFORMER,
  ALICLOUD_SERVERGROUP_ADVANCEDSETTING_DIRECTIVE,
  ALICLOUD_SERVERGROUP_NETWORKSETTING,
  ALICLOUD_SERVERGROUP_NETWORKSETTING_DIRECTIVE,
  ALICLOUD_SERVERGROUP_TAGS,
  ALICLOUD_SERVERGROUP_ZONE_DIRECTIVE
]);
