import * as React from 'react';

import { CollapsibleSection, Overridable, Tooltip } from '@spinnaker/core';

import { IAmazonServerGroupView, IScalingProcess } from 'ecloud/domain';
import { AwsNgReact } from 'ecloud/reactShims';
import { AutoScalingProcessService } from '../scalingProcesses/AutoScalingProcessService';

import { IAmazonServerGroupDetailsSectionProps } from './IAmazonServerGroupDetailsSectionProps';
import { CreateScalingPolicyButton } from '../scalingPolicy/CreateScalingPolicyButton';

@Overridable('aws.serverGroup.ScalingPoliciesDetailsSection')
export class ScalingPoliciesDetailsSection extends React.Component<IAmazonServerGroupDetailsSectionProps> {
  constructor(props: IAmazonServerGroupDetailsSectionProps) {
    super(props);
  }

  public static arePoliciesDisabled(serverGroup: IAmazonServerGroupView): boolean {
    const autoScalingProcesses: IScalingProcess[] = AutoScalingProcessService.normalizeScalingProcesses(serverGroup);
    return (
      serverGroup.scalingPolicies.length > 0 &&
      autoScalingProcesses
        .filter(p => !p.enabled)
        .some(p => ['Launch', 'Terminate', 'AlarmNotification'].includes(p.name))
    );
  }

  public render(): JSX.Element {
    const { app, serverGroup } = this.props;
    const scalingPoliciesDisabled = ScalingPoliciesDetailsSection.arePoliciesDisabled(serverGroup);

    const { ScalingPolicySummary } = AwsNgReact;

    return (
      <CollapsibleSection
        cacheKey="Scaling Policies"
        heading={({ chevron }) => (
          <h4 className="collapsible-heading">
            {chevron}
            <span>
              {scalingPoliciesDisabled && (
                <Tooltip value="Some scaling processes are disabled that may prevent scaling policies from working">
                  <span className="fa fa-exclamation-circle warning-text" />
                </Tooltip>
              )}
              Scaling Policies
            </span>
          </h4>
        )}
      >
        {scalingPoliciesDisabled && (
          <div className="band band-warning">
            Some scaling processes are disabled that may prevent scaling policies from working.
          </div>
        )}
        {serverGroup.scalingPolicies.map(policy =>{
          const newPolicy = {...policy};
          const val = Math.abs(newPolicy.adjustmentValue);
          const unit = newPolicy.adjustmentType === 'QUANTITY_CHANGE_IN_CAPACITY' ? '台' : newPolicy.adjustmentType === 'PERCENT_CHANGE_IN_CAPACITY'? '%' : '';
          newPolicy.des = '';
          if(newPolicy.adjustmentType === 'TOTAL_CAPACITY'){
            newPolicy.des = '调整至' + val + '台'
          }else if(newPolicy.adjustmentValue > 0){
            newPolicy.des = '增加' + val + unit;
          }else if(newPolicy.adjustmentValue < 0){
            newPolicy.des = '减少' + val + unit;
          }
          return (
            <ScalingPolicySummary key={policy.autoScalingPolicyId} policy={newPolicy} serverGroup={serverGroup} application={app} />
          )
        }
        
        
        
        )}
        <CreateScalingPolicyButton serverGroup={serverGroup} application={app} />
      </CollapsibleSection>
    );
  }
}
