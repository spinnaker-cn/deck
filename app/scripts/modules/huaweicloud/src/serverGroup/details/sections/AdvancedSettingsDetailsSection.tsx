import * as React from 'react';

import { CollapsibleSection } from '@spinnaker/core';

import { IHuaweiCloudServerGroupDetailsSectionProps } from './IHuaweiCloudServerGroupDetailsSectionProps';

export class AdvancedSettingsDetailsSection extends React.Component<IHuaweiCloudServerGroupDetailsSectionProps> {

  public render(): JSX.Element {
    const { serverGroup } = this.props;

    const asg = serverGroup.asg;

    return (
      <CollapsibleSection heading="Advanced Settings">
        <dl className="horizontal-when-filters-collapsed">
          <dt>Cooldown</dt>
          <dd>{asg.defaultCooldown} seconds</dd>
          {asg.enabledMetrics && asg.enabledMetrics.length > 0 && [
            <dt key={'t-metrics'}>Enabled Metrics</dt>,
            <dd key={'d-metrics'}>{asg.enabledMetrics.map(m => m.metric).join(', ')}</dd>,
          ]}
          <dt>Termination Policies</dt>
          <dd>{asg.terminationPolicySet.join(', ')}</dd>
          <dt>Agency</dt>
          <dd>{asg.agency}</dd>
        </dl>
      </CollapsibleSection>
    );
  }
}
