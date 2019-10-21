'use strict';

const angular = require('angular');
import * as _ from 'lodash';

import { InfrastructureCaches, TaskExecutor, FirewallLabels } from '@spinnaker/core';

export class AlicloudSecurityGroupWriter {
  public upsertSecurityGroup(securityGroup: any, application: any, descriptor: any, params: any= {}) {
    params.securityGroupName = securityGroup.name;

    // We want to extend params with all attributes from securityGroup, but only if they don't already exist.
    _.assignWith(params, securityGroup, function(value: any, other: any) {
      return _.isUndefined(value) ? other : value;
    });

    const operation = TaskExecutor.executeTask({
      job: [params],
      application: application,
      description: `${descriptor} ${FirewallLabels.get('Firewall')}: ${securityGroup.name}`,
    });

    InfrastructureCaches.clearCache('securityGroup');

    return operation;
  }

  public deleteSecurityGroup(securityGroup: any, application: any, params: any = {}) {
    params.type = 'deleteSecurityGroup';
    params.securityGroupName = securityGroup.name;
    params.regions = [securityGroup.region];
    params.credentials = securityGroup.accountId;
    params.appName = application.name;

    const operation = TaskExecutor.executeTask({
      job: [params],
      application: application,
      description: `Delete ${FirewallLabels.get('Firewalls')}: ${securityGroup.name}`,
    });

    InfrastructureCaches.clearCache('securityGroup');

    return operation;
  }
}

export const ALICLOUD_SECURITY_WRITE_SERVICE = 'spinnaker.alicloud.securityGroup.write.service';
angular
  .module(ALICLOUD_SECURITY_WRITE_SERVICE , [require('@uirouter/angularjs').default])
  .service('alicloudSecurityGroupWriter', AlicloudSecurityGroupWriter);
