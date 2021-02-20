import { module } from 'angular';

import { HUAWEICLOUD_SECURITY_GROUP_READER } from './securityGroup.reader';
import { INGRESS_RULE_GROUP_SELECTOR_COMPONENT } from './configure/ingressRuleGroupSelector.component';

export const HUAWEICLOUD_SECURITY_GROUP_MODULE = 'spinnaker.huaweicloud.securityGroup';
module(HUAWEICLOUD_SECURITY_GROUP_MODULE, [
  HUAWEICLOUD_SECURITY_GROUP_READER,
  require('./clone/cloneSecurityGroup.controller').name,
  INGRESS_RULE_GROUP_SELECTOR_COMPONENT,
  require('./configure/configSecurityGroup.mixin.controller').name,
  require('./configure/CreateSecurityGroupCtrl').name,
  require('./configure/EditSecurityGroupCtrl').name,
  require('./details/securityGroupDetail.controller').name,
  require('./securityGroup.transformer').name,
]);
