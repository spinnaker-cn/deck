import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

import { AWS_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';
import { CTYUN_REACT_MODULE } from './reactShims/aws.react.module';
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

import './logo/ctyun.logo.less';
import './common/main.less';
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

export const CTYUN_MODULE = 'spinnaker.ctyun';
module(CTYUN_MODULE, [
  CTYUN_REACT_MODULE,
  require('./pipeline/stages/bake/awsBakeStage').name,
  require('./pipeline/stages/cloneServerGroup/awsCloneServerGroupStage').name,
  require('./pipeline/stages/destroyAsg/awsDestroyAsgStage').name,
  require('./pipeline/stages/disableAsg/awsDisableAsgStage').name,
  require('./pipeline/stages/disableCluster/awsDisableClusterStage').name,
  require('./pipeline/stages/rollbackCluster/awsRollbackClusterStage').name,
  require('./pipeline/stages/enableAsg/awsEnableAsgStage').name,
  require('./pipeline/stages/findAmi/awsFindAmiStage').name,
  require('./pipeline/stages/findImageFromTags/awsFindImageFromTagsStage').name,
  require('./pipeline/stages/findImageFromName/ctyunFindImageFromNameStage').name,
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
  CloudProviderRegistry.registerProvider('ctyun', {
    name: 'ctyun',
    logo: {
      path: require('./logo/ctyun.logo.svg'),
    },
    image: {
      reader: AwsImageReader,
    },
    serverGroup: {
      transformer: 'ctyunServerGroupTransformer',
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
        // TagsDetailsSection,
        PackageDetailsSection,
        // AdvancedSettingsDetailsSection,
        LogsDetailsSection,
      ],
      CloneServerGroupModal: AmazonCloneServerGroupModal,
      commandBuilder: 'ctyunServerGroupCommandBuilder',
      configurationService: 'ctyunServerGroupConfigurationService',
      scalingActivitiesEnabled: true,
    },
    instance: {
      instanceTypeService: 'ctyunInstanceTypeService',
      detailsTemplateUrl: require('./instance/details/instanceDetails.html'),
      detailsController: 'ctyunInstanceDetailsCtrl',
    },
    loadBalancer: {
      transformer: 'ctyunLoadBalancerTransformer',
      detailsTemplateUrl: require('./loadBalancer/details/loadBalancerDetails.html'),
      detailsController: 'ctyunLoadBalancerDetailsCtrl',
      CreateLoadBalancerModal: CreateApplicationLoadBalancer,
      targetGroupDetailsTemplateUrl: require('./loadBalancer/details/targetGroupDetails.html'),
      targetGroupDetailsController: 'ctyunTargetGroupDetailsCtrl',
      ClusterContainer: AmazonLoadBalancerClusterContainer,
      LoadBalancersTag: AmazonLoadBalancersTag,
    },
    securityGroup: {
      transformer: 'ctyunSecurityGroupTransformer',
      reader: 'ctyunSecurityGroupReader',
      detailsTemplateUrl: require('./securityGroup/details/securityGroupDetail.html'),
      detailsController: 'ctyunSecurityGroupDetailsCtrl',
      createSecurityGroupTemplateUrl: require('./securityGroup/configure/createSecurityGroup.html'),
      createSecurityGroupController: 'ctyunCreateSecurityGroupCtrl',
    },
    subnet: {
      renderer: 'ctyunSubnetRenderer',
    },
    search: {
      resultFormatter: 'ctyunSearchResultFormatter',
    },
  });
});

DeploymentStrategyRegistry.registerProvider('ctyun', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);
