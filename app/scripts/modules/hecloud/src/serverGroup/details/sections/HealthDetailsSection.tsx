import * as React from 'react';

import { CollapsibleSection, HealthCounts } from '@spinnaker/core';

import { IHeCloudServerGroupDetailsSectionProps } from './IHeCloudServerGroupDetailsSectionProps';

export class HealthDetailsSection extends React.Component<IHeCloudServerGroupDetailsSectionProps> {
  public render(): JSX.Element {
    const { serverGroup } = this.props;

    if (serverGroup.instanceCounts.total > 0) {
      return (
        <CollapsibleSection heading="Health" defaultExpanded={true}>
          <dl className="dl-horizontal dl-flex">
            <dt>Instances</dt>
            <dd>
              <HealthCounts container={serverGroup.instanceCounts} className="pull-left" />
            </dd>
          </dl>
        </CollapsibleSection>
      );
    }
    return null;
  }
}
