import * as React from 'react';

import { CollapsibleSection, ShowUserData } from '@spinnaker/core';

import { IAmazonServerGroupView } from 'ecloud/domain';

import { IAmazonServerGroupDetailsSectionProps } from './IAmazonServerGroupDetailsSectionProps';

export interface ILaunchConfigDetailsSectionState {
  image: any;
}

export class LaunchConfigDetailsSection extends React.Component<
  IAmazonServerGroupDetailsSectionProps,
  ILaunchConfigDetailsSectionState
> {
  constructor(props: IAmazonServerGroupDetailsSectionProps) {
    super(props);

    this.state = { image: this.getImage(props.serverGroup) };
  }

  private getImage(serverGroup: IAmazonServerGroupView): any {
    const image = serverGroup.image ? serverGroup.image : undefined;
    if (serverGroup.image && serverGroup.image.description) {
      const tags: string[] = serverGroup.image.description.split(', ');
      tags.forEach(tag => {
        const keyVal = tag.split('=');
        if (keyVal.length === 2 && keyVal[0] === 'ancestor_name') {
          serverGroup.image.baseImage = keyVal[1];
        }
      });
    }
    return image;
  }

  public componentWillReceiveProps(nextProps: IAmazonServerGroupDetailsSectionProps): void {
    this.setState({ image: this.getImage(nextProps.serverGroup) });
  }

  public render(): JSX.Element {
    const { name, launchConfig } = this.props.serverGroup;
    const { image } = this.state;
    if (launchConfig) {
      return (
        <CollapsibleSection heading="Launch Configuration">
          <dl className="horizontal-when-filters-collapsed">
            <dt>Name</dt>
            <dd>{launchConfig.launchConfigurationName}</dd>

            <dt>Image ID</dt>
            <dd>{launchConfig.imageId}</dd>

            {image && image.imageLocation && <dt>Image Name</dt>}
            {image && image.imageLocation && <dd>{image.imageLocation}</dd>}

            {image && image.baseImage && <dt>Base Image Name</dt>}
            {image && image.baseImage && <dd>{image.baseImage}</dd>}

            <dt>Instance Type</dt>
            <dd>{launchConfig.instanceType}</dd>

            <dt>Security Service</dt>
            <dd>{launchConfig.enhancedService && launchConfig.enhancedService.securityService && launchConfig.enhancedService.securityService.enabled ? 'enabled' : 'disabled'}</dd>

            <dt>Instance Monitoring</dt>
            <dd>{launchConfig.enhancedService && launchConfig.enhancedService.monitorService && launchConfig.enhancedService.monitorService.enabled ? 'enabled' : 'disabled'}</dd>


            {launchConfig.keyName && <dt>Key Name</dt>}
            {launchConfig.keyName && <dd>{launchConfig.keyName}</dd>}

            
          </dl>
        </CollapsibleSection>
      );
    }
    return null;
  }
}
