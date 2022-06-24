import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

import { AWS_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';
import { HECLOUD_REACT_MODULE } from './reactShims/hecloud.react.module';
import { HECLOUD_SECURITY_GROUP_MODULE } from './securityGroup/securityGroup.module';
import { AWS_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';
import './validation/ApplicationNameValidator';
import { VPC_MODULE } from './vpc/vpc.module';
import { SUBNET_RENDERER } from './subnet/subnet.renderer';
import { SERVER_GROUP_DETAILS_MODULE } from './serverGroup/details/serverGroupDetails.module';
import { COMMON_MODULE } from './common/common.module';
import './help/hecloud.help';

import { HeImageReader } from './image';
import { HeCloudLoadBalancerClusterContainer } from './loadBalancer/HeCloudLoadBalancerClusterContainer';
import { HeCloudLoadBalancersTag } from './loadBalancer/HeCloudLoadBalancersTag';

import './deploymentStrategy/rollingPush.strategy';

import './logo/hecloud.logo.less';
import { HeCloudCloneServerGroupModal } from './serverGroup/configure/wizard/HeCloudCloneServerGroupModal';
import { CreateApplicationLoadBalancer } from './loadBalancer/configure/application/CreateApplicationLoadBalancer';
import { HeCloudServerGroupActions } from './serverGroup/details/HeCloudServerGroupActions';
import { hecloudServerGroupDetailsGetter } from './serverGroup/details/hecloudServerGroupDetailsGetter';

import {
  AdvancedSettingsDetailsSection,
  HeCloudInfoDetailsSection,
  CapacityDetailsSection,
  HealthDetailsSection,
  LaunchConfigDetailsSection,
  LogsDetailsSection,
  PackageDetailsSection,
  ScalingPoliciesDetailsSection,
  // ScalingProcessesDetailsSection,
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

export const HECLOUD_MODULE = 'spinnaker.hecloud';
module(HECLOUD_MODULE, [
  HECLOUD_REACT_MODULE,
  HECLOUD_SECURITY_GROUP_MODULE,
  require('./pipeline/stages/bake/hecloudBakeStage').name,
  require('./pipeline/stages/cloneServerGroup/hecloudCloneServerGroupStage').name,
  require('./pipeline/stages/destroyAsg/hecloudDestroyAsgStage').name,
  require('./pipeline/stages/disableAsg/hecloudDisableAsgStage').name,
  require('./pipeline/stages/disableCluster/hecloudDisableClusterStage').name,
  require('./pipeline/stages/rollbackCluster/hecloudRollbackClusterStage').name,
  require('./pipeline/stages/enableAsg/hecloudEnableAsgStage').name,
  require('./pipeline/stages/findAmi/hecloudFindAmiStage').name,
  require('./pipeline/stages/findImageFromTags/hecloudFindImageFromTagsStage').name,
  require('./pipeline/stages/findImageFromName/hecloudFindImageFromNameStage').name,
  require('./pipeline/stages/modifyScalingProcess/modifyScalingProcessStage').name,
  require('./pipeline/stages/resizeAsg/hecloudResizeAsgStage').name,
  require('./pipeline/stages/scaleDownCluster/hecloudScaleDownClusterStage').name,
  require('./pipeline/stages/shrinkCluster/hecloudShrinkClusterStage').name,

  SERVER_GROUP_DETAILS_MODULE,
  COMMON_MODULE,
  AWS_SERVER_GROUP_TRANSFORMER,
  require('./instance/hecloudInstanceType.service').name,
  AWS_LOAD_BALANCER_MODULE,
  require('./instance/details/instance.details.controller').name,
  SUBNET_RENDERER,
  VPC_MODULE,
  require('./search/searchResultFormatter').name,
  DEPLOY_CLOUDFORMATION_STACK_STAGE,
  CLOUDFORMATION_TEMPLATE_ENTRY,
]).config(() => {
  CloudProviderRegistry.registerProvider('hecloud', {
    name: 'HeCloud',
    logo: {
      path: require('./logo/hecloud.logo.svg'),
    },
    image: {
      reader: HeImageReader,
    },
    serverGroup: {
      transformer: 'hecloudServerGroupTransformer',
      detailsActions: HeCloudServerGroupActions,
      detailsGetter: hecloudServerGroupDetailsGetter,
      detailsSections: [
        HeCloudInfoDetailsSection,
        CapacityDetailsSection,
        HealthDetailsSection,
        LaunchConfigDetailsSection,
        SecurityGroupsDetailsSection,
        // ScalingProcessesDetailsSection,
        ScalingPoliciesDetailsSection,
        TagsDetailsSection,
        PackageDetailsSection,
        AdvancedSettingsDetailsSection,
        LogsDetailsSection,
      ],
      CloneServerGroupModal: HeCloudCloneServerGroupModal,
      commandBuilder: 'hecloudServerGroupCommandBuilder',
      configurationService: 'hecloudServerGroupConfigurationService',
      scalingActivitiesEnabled: true,
    },
    instance: {
      instanceTypeService: 'hecloudInstanceTypeService',
      detailsTemplateUrl: require('./instance/details/instanceDetails.html'),
      detailsController: 'hecloudInstanceDetailsCtrl',
    },
    loadBalancer: {
      transformer: 'hecloudLoadBalancerTransformer',
      detailsTemplateUrl: require('./loadBalancer/details/loadBalancerDetails.html'),
      detailsController: 'hecloudLoadBalancerDetailsCtrl',
      CreateLoadBalancerModal: CreateApplicationLoadBalancer,
      targetGroupDetailsTemplateUrl: require('./loadBalancer/details/targetGroupDetails.html'),
      targetGroupDetailsController: 'hecloudTargetGroupDetailsCtrl',
      ClusterContainer: HeCloudLoadBalancerClusterContainer,
      LoadBalancersTag: HeCloudLoadBalancersTag,
    },
    securityGroup: {
      transformer: 'hecloudSecurityGroupTransformer',
      reader: 'hecloudSecurityGroupReader',
      detailsTemplateUrl: require('./securityGroup/details/securityGroupDetail.html'),
      detailsController: 'hecloudSecurityGroupDetailsCtrl',
      createSecurityGroupTemplateUrl: require('./securityGroup/configure/createSecurityGroup.html'),
      createSecurityGroupController: 'hecloudCreateSecurityGroupCtrl',
    },
    subnet: {
      renderer: 'hecloudSubnetRenderer',
    },
    search: {
      resultFormatter: 'hecloudSearchResultFormatter',
    },
  });
});

DeploymentStrategyRegistry.registerProvider('hecloud', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);
