import { IPromise } from 'angular';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';

import { AccountService, IServerGroupDetailsProps, ServerGroupReader } from '@spinnaker/core';

import { HuaweiReactInjector } from 'huaweicloud/reactShims';
import { IHuaweiCloudLoadBalancer, IHuaweiCloudServerGroup, IHuaweiCloudServerGroupView } from 'huaweicloud/domain';

function extractServerGroupSummary(props: IServerGroupDetailsProps): IPromise<IHuaweiCloudServerGroup> {
  const { app, serverGroup } = props;
  return app.ready().then(() => {
    let summary: IHuaweiCloudServerGroup = app.serverGroups.data.find((toCheck: IHuaweiCloudServerGroup) => {
      return (
        toCheck.name === serverGroup.name &&
        toCheck.account === serverGroup.accountId &&
        toCheck.region === serverGroup.region
      );
    });
    if (!summary) {
      app.loadBalancers.data.some((loadBalancer: IHuaweiCloudLoadBalancer) => {
        if (loadBalancer.account === serverGroup.accountId && loadBalancer.region === serverGroup.region) {
          return loadBalancer.serverGroups.some(possibleServerGroup => {
            if (possibleServerGroup.name === serverGroup.name) {
              summary = possibleServerGroup;
              return true;
            }
            return false;
          });
        }
        return false;
      });
    }
    return summary;
  });
}

export function huaweicloudServerGroupDetailsGetter(
  props: IServerGroupDetailsProps,
  autoClose: () => void,
): Observable<IHuaweiCloudServerGroup> {
  const { app, serverGroup: serverGroupInfo } = props;
  return new Observable<IHuaweiCloudServerGroupView>(observer => {
    extractServerGroupSummary(props).then(summary => {
      ServerGroupReader.getServerGroup(
        app.name,
        serverGroupInfo.accountId,
        serverGroupInfo.region,
        serverGroupInfo.name,
      ).then((details: IHuaweiCloudServerGroup) => {
        // it's possible the summary was not found because the clusters are still loading
        Object.assign(details, summary, { account: serverGroupInfo.accountId });

        const serverGroup = HuaweiReactInjector.huaweicloudServerGroupTransformer.normalizeServerGroupDetails(details);

        AccountService.getAccountDetails(serverGroup.account).then(accountDetails => {
          serverGroup.accountDetails = accountDetails;
          observer.next(serverGroup);
        });

        if (!isEmpty(serverGroup)) {
          observer.next(serverGroup);
        } else {
          autoClose();
        }
      }, autoClose);
    }, autoClose);
  });
}
