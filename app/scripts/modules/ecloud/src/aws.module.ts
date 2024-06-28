import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

import { AWS_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';
import { ECLOUD_REACT_MODULE } from './reactShims/aws.react.module';
import { AWS_SECURITY_GROUP_MODULE } from './securityGroup/securityGroup.module';
import { AWS_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';
import './validation/ApplicationNameValidator';
import { VPC_MODULE } from './vpc/vpc.module';
import { SUBNET_RENDERER } from './subnet/subnet.renderer';
import { SERVER_GROUP_DETAILS_MODULE } from './serverGroup/details/serverGroupDetails.module';
import { COMMON_MODULE } from './common/common.module';
import './help/amazon.help';

import { AwsImageReader } from './image';
import { AmazonLoadBalancerClusterContainer } from './loadBalancer/AmazonLoadBalancerClusterContainer';
import { AmazonLoadBalancersTag } from './loadBalancer/AmazonLoadBalancersTag';

import './deploymentStrategy/rollingPush.strategy';

import './logo/ecloud.logo.less';
import { AmazonCloneServerGroupModal } from './serverGroup/configure/wizard/AmazonCloneServerGroupModal';
import { CreateApplicationLoadBalancer } from './loadBalancer/configure/application/CreateApplicationLoadBalancer';
import { AmazonServerGroupActions } from './serverGroup/details/AmazonServerGroupActions';
import { amazonServerGroupDetailsGetter } from './serverGroup/details/amazonServerGroupDetailsGetter';

import {
  AdvancedSettingsDetailsSection,
  AmazonInfoDetailsSection,
  CapacityDetailsSection,
  HealthDetailsSection,
  LaunchConfigDetailsSection,
  LogsDetailsSection,
  PackageDetailsSection,
  ScalingPoliciesDetailsSection,
  // ScalingProcessesDetailsSection,
  ScheduledActionsDetailsSection,
  SecurityGroupsDetailsSection,
  TagsDetailsSection,
} from './serverGroup/details/sections';

import { DEPLOY_CLOUDFORMATION_STACK_STAGE } from './pipeline/stages/deployCloudFormation/deployCloudFormationStackStage';
import { CLOUDFORMATION_TEMPLATE_ENTRY } from './pipeline/stages/deployCloudFormation/cloudFormationTemplateEntry.component';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const ECLOUD_MODULE = 'spinnaker.ecloud';
module(ECLOUD_MODULE, [
  ECLOUD_REACT_MODULE,
  require('./pipeline/stages/bake/awsBakeStage').name,
  require('./pipeline/stages/cloneServerGroup/awsCloneServerGroupStage').name,
  require('./pipeline/stages/destroyAsg/awsDestroyAsgStage').name,
  require('./pipeline/stages/disableAsg/awsDisableAsgStage').name,
  require('./pipeline/stages/disableCluster/awsDisableClusterStage').name,
  require('./pipeline/stages/rollbackCluster/awsRollbackClusterStage').name,
  require('./pipeline/stages/enableAsg/awsEnableAsgStage').name,
  require('./pipeline/stages/findAmi/awsFindAmiStage').name,
  require('./pipeline/stages/findImageFromTags/awsFindImageFromTagsStage').name,
  require('./pipeline/stages/findImageFromName/ecloudFindImageFromNameStage').name,
  require('./pipeline/stages/modifyScalingProcess/modifyScalingProcessStage').name,
  require('./pipeline/stages/resizeAsg/awsResizeAsgStage').name,
  require('./pipeline/stages/scaleDownCluster/awsScaleDownClusterStage').name,
  require('./pipeline/stages/shrinkCluster/awsShrinkClusterStage').name,
  SERVER_GROUP_DETAILS_MODULE,
  COMMON_MODULE,
  AWS_SERVER_GROUP_TRANSFORMER,
  require('./instance/awsInstanceType.service').name,
  AWS_LOAD_BALANCER_MODULE,
  require('./instance/details/instance.details.controller').name,
  AWS_SECURITY_GROUP_MODULE,
  SUBNET_RENDERER,
  VPC_MODULE,
  require('./search/searchResultFormatter').name,
  DEPLOY_CLOUDFORMATION_STACK_STAGE,
  CLOUDFORMATION_TEMPLATE_ENTRY,
]).config(() => {
  CloudProviderRegistry.registerProvider('ecloud', {
    name: 'Ecloud',
    logo: {
      path: require('./logo/ecloud.logo.svg'),
    },
    image: {
      reader: AwsImageReader,
    },
    serverGroup: {
      transformer: 'ecloudServerGroupTransformer',
      detailsActions: AmazonServerGroupActions,
      detailsGetter: amazonServerGroupDetailsGetter,
      detailsSections: [
        AmazonInfoDetailsSection,
        CapacityDetailsSection,
        HealthDetailsSection,
        LaunchConfigDetailsSection,
        SecurityGroupsDetailsSection,
        // ScalingProcessesDetailsSection,
        ScalingPoliciesDetailsSection,
        ScheduledActionsDetailsSection,
        TagsDetailsSection,
        PackageDetailsSection,
        AdvancedSettingsDetailsSection,
        LogsDetailsSection,
      ],
      CloneServerGroupModal: AmazonCloneServerGroupModal,
      commandBuilder: 'ecloudServerGroupCommandBuilder',
      configurationService: 'ecloudServerGroupConfigurationService',
      scalingActivitiesEnabled: true,
    },
    instance: {
      instanceTypeService: 'ecloudInstanceTypeService',
      detailsTemplateUrl: require('./instance/details/instanceDetails.html'),
      detailsController: 'ecloudInstanceDetailsCtrl',
    },
    loadBalancer: {
      transformer: 'ecloudLoadBalancerTransformer',
      detailsTemplateUrl: require('./loadBalancer/details/loadBalancerDetails.html'),
      detailsController: 'ecloudLoadBalancerDetailsCtrl',
      CreateLoadBalancerModal: CreateApplicationLoadBalancer,
      targetGroupDetailsTemplateUrl: require('./loadBalancer/details/targetGroupDetails.html'),
      targetGroupDetailsController: 'ecloudTargetGroupDetailsCtrl',
      ClusterContainer: AmazonLoadBalancerClusterContainer,
      LoadBalancersTag: AmazonLoadBalancersTag,
    },
    securityGroup: {
      transformer: 'ecloudSecurityGroupTransformer',
      reader: 'ecloudSecurityGroupReader',
      detailsTemplateUrl: require('./securityGroup/details/securityGroupDetail.html'),
      detailsController: 'ecloudSecurityGroupDetailsCtrl',
      createSecurityGroupTemplateUrl: require('./securityGroup/configure/createSecurityGroup.html'),
      createSecurityGroupController: 'ecloudCreateSecurityGroupCtrl',
    },
    subnet: {
      renderer: 'ecloudSubnetRenderer',
    },
    search: {
      resultFormatter: 'ecloudSearchResultFormatter',
    },
  });
});

DeploymentStrategyRegistry.registerProvider('ecloud', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);

