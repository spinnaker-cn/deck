import { IPromise } from 'angular';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';

import { AccountService, IServerGroupDetailsProps, ServerGroupReader } from '@spinnaker/core';

import { HeReactInjector } from 'hecloud/reactShims';
import { IHeCloudLoadBalancer, IHeCloudServerGroup, IHeCloudServerGroupView } from 'hecloud/domain';

function extractServerGroupSummary(props: IServerGroupDetailsProps): IPromise<IHeCloudServerGroup> {
  const { app, serverGroup } = props;
  return app.ready().then(() => {
    let summary: IHeCloudServerGroup = app.serverGroups.data.find((toCheck: IHeCloudServerGroup) => {
      return (
        toCheck.name === serverGroup.name &&
        toCheck.account === serverGroup.accountId &&
        toCheck.region === serverGroup.region
      );
    });
    if (!summary) {
      app.loadBalancers.data.some((loadBalancer: IHeCloudLoadBalancer) => {
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

export function hecloudServerGroupDetailsGetter(
  props: IServerGroupDetailsProps,
  autoClose: () => void,
): Observable<IHeCloudServerGroup> {
  const { app, serverGroup: serverGroupInfo } = props;
  return new Observable<IHeCloudServerGroupView>(observer => {
    extractServerGroupSummary(props).then(summary => {
      ServerGroupReader.getServerGroup(
        app.name,
        serverGroupInfo.accountId,
        serverGroupInfo.region,
        serverGroupInfo.name,
      ).then((details: IHeCloudServerGroup) => {
        // it's possible the summary was not found because the clusters are still loading
        Object.assign(details, summary, { account: serverGroupInfo.accountId });

        const serverGroup = HeReactInjector.hecloudServerGroupTransformer.normalizeServerGroupDetails(details);

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
