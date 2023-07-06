import * as React from 'react';

import { CollapsibleSection } from '@spinnaker/core';

import { IAmazonServerGroupDetailsSectionProps } from './IAmazonServerGroupDetailsSectionProps';
import { AwsNgReact } from 'ctyun/reactShims';

export class LogsDetailsSection extends React.Component<IAmazonServerGroupDetailsSectionProps> {
  public render(): JSX.Element {
    const { ViewScalingActivitiesLink } = AwsNgReact;
    return (
      <CollapsibleSection heading="Logs">
        <ul>
          <li>
            <ViewScalingActivitiesLink serverGroup={this.props.serverGroup} />
          </li>
        </ul>
      </CollapsibleSection>
    );
  }
}
