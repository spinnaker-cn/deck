import * as React from 'react';

import { CollapsibleSection } from '@spinnaker/core';

import { IAmazonServerGroupDetailsSectionProps } from './IAmazonServerGroupDetailsSectionProps';

export class TagsDetailsSection extends React.Component<IAmazonServerGroupDetailsSectionProps> {
  public render(): JSX.Element {
    const { serverGroup } = this.props;

    return (
      <CollapsibleSection heading="Tags">
        {serverGroup.launchConfig.tags && serverGroup.launchConfig.tags.length === 0 && (
          <div>No tags associated with this server group</div>
        )}
        {serverGroup.launchConfig.tags && serverGroup.launchConfig.tags.length > 0 && (
          <dl>
            {serverGroup.launchConfig.tags.map((tag: { key: string; value: string }) => [
              <dt key={tag.key}>{tag.key}</dt>,
              <dd key={tag.value}>{tag.value}</dd>,
            ])}
          </dl>
        )}
      </CollapsibleSection>
    );
  }
}
