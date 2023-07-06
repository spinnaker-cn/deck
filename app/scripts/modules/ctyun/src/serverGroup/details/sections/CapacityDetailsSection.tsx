import * as React from 'react';

import { CollapsibleSection, Overridable, Application } from '@spinnaker/core';

import { IAmazonServerGroupDetailsSectionProps } from './IAmazonServerGroupDetailsSectionProps';
import { AmazonResizeServerGroupModal } from '../resize/AmazonResizeServerGroupModal';
import { IAmazonServerGroup } from 'ctyun/domain';
import { AwsNgReact } from 'ctyun/reactShims';

@Overridable('amazon.serverGroup.CapacityDetailsSection')
export class CapacityDetailsSection extends React.Component<IAmazonServerGroupDetailsSectionProps> {
  public static resizeServerGroup(serverGroup: IAmazonServerGroup, application: Application): void {
    serverGroup.asg.desiredCapacity = Number(serverGroup.asg.instanceCount);
    serverGroup.asg.minSize = serverGroup.asg.minCount;
    serverGroup.asg.maxSize = serverGroup.asg.maxCount;
    AmazonResizeServerGroupModal.show({ application, serverGroup });
  }

  public render(): JSX.Element {
    const { serverGroup, app } = this.props;
    const { ViewScalingActivitiesLink } = AwsNgReact;
    // const simple = serverGroup.asg.minCount === serverGroup.asg.maxCount;

    return (
      <CollapsibleSection heading="Capacity" defaultExpanded={true}>
        <dl className="dl-horizontal dl-flex">
          {/* {simple && <dt>Min/Max</dt>}
          {simple && <dd>{serverGroup.asg.desiredCapacity}</dd>}

          {!simple && <dt>Min</dt>}
          {!simple && <dd>{serverGroup.asg.minCount}</dd>}
          {!simple && <dt>Desired</dt>}
          {!simple && <dd>{serverGroup.asg.desiredCapacity}</dd>}
          {!simple && <dt>Max</dt>}
          {!simple && <dd>{serverGroup.asg.maxCount}</dd>} */}

          <dt>Min</dt>
          <dd>{serverGroup.asg.minCount}</dd>
          <dt>Max</dt>
          <dd>{serverGroup.asg.maxCount}</dd>

          <dt>Current</dt>
          <dd>{serverGroup.asg.instanceCount}</dd>
        </dl>

        <div>
          <a className="clickable" onClick={() => CapacityDetailsSection.resizeServerGroup(serverGroup, app)}>
            Resize Server Group
          </a>
        </div>

        <div>
          <ViewScalingActivitiesLink serverGroup={serverGroup} />
        </div>
      </CollapsibleSection>
    );
  }
}
