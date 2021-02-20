import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

import { AWS_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';
import { HUAWEICLOUD_REACT_MODULE } from './reactShims/huaweicloud.react.module';
import { HUAWEICLOUD_SECURITY_GROUP_MODULE } from './securityGroup/securityGroup.module';
import { AWS_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';
import './validation/ApplicationNameValidator';
import { VPC_MODULE } from './vpc/vpc.module';
import { SUBNET_RENDERER } from './subnet/subnet.renderer';
import { SERVER_GROUP_DETAILS_MODULE } from './serverGroup/details/serverGroupDetails.module';
import { COMMON_MODULE } from './common/common.module';
import './help/huaweicloud.help';

import { HuaweiImageReader } from './image';
import { HuaweiCloudLoadBalancerClusterContainer } from './loadBalancer/HuaweiCloudLoadBalancerClusterContainer';
import { HuaweiCloudLoadBalancersTag } from './loadBalancer/HuaweiCloudLoadBalancersTag';

import './deploymentStrategy/rollingPush.strategy';

import './logo/huaweicloud.logo.less';
import { HuaweiCloudCloneServerGroupModal } from './serverGroup/configure/wizard/HuaweiCloudCloneServerGroupModal';
import { CreateApplicationLoadBalancer } from './loadBalancer/configure/application/CreateApplicationLoadBalancer';
import { HuaweiCloudServerGroupActions } from './serverGroup/details/HuaweiCloudServerGroupActions';
import { huaweicloudServerGroupDetailsGetter } from './serverGroup/details/huaweicloudServerGroupDetailsGetter';

import {
  AdvancedSettingsDetailsSection,
  HuaweiCloudInfoDetailsSection,
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

export const HUAWEICLOUD_MODULE = 'spinnaker.huaweicloud';
module(HUAWEICLOUD_MODULE, [
  HUAWEICLOUD_REACT_MODULE,
  require('./pipeline/stages/bake/huaweicloudBakeStage').name,
  require('./pipeline/stages/cloneServerGroup/huaweicloudCloneServerGroupStage').name,
  require('./pipeline/stages/destroyAsg/huaweicloudDestroyAsgStage').name,
  require('./pipeline/stages/disableAsg/huaweicloudDisableAsgStage').name,
  require('./pipeline/stages/disableCluster/huaweicloudDisableClusterStage').name,
  require('./pipeline/stages/rollbackCluster/huaweicloudRollbackClusterStage').name,
  require('./pipeline/stages/enableAsg/huaweicloudEnableAsgStage').name,
  require('./pipeline/stages/findAmi/huaweicloudFindAmiStage').name,
  require('./pipeline/stages/findImageFromTags/huaweicloudFindImageFromTagsStage').name,
  require('./pipeline/stages/findImageFromName/huaweicloudFindImageFromNameStage').name,
  require('./pipeline/stages/modifyScalingProcess/modifyScalingProcessStage').name,
  require('./pipeline/stages/resizeAsg/huaweicloudResizeAsgStage').name,
  require('./pipeline/stages/scaleDownCluster/huaweicloudScaleDownClusterStage').name,
  require('./pipeline/stages/shrinkCluster/huaweicloudShrinkClusterStage').name,

  SERVER_GROUP_DETAILS_MODULE,
  COMMON_MODULE,
  AWS_SERVER_GROUP_TRANSFORMER,
  require('./instance/huaweicloudInstanceType.service').name,
  AWS_LOAD_BALANCER_MODULE,
  require('./instance/details/instance.details.controller').name,
  HUAWEICLOUD_SECURITY_GROUP_MODULE,
  SUBNET_RENDERER,
  VPC_MODULE,
  require('./search/searchResultFormatter').name,
  DEPLOY_CLOUDFORMATION_STACK_STAGE,
  CLOUDFORMATION_TEMPLATE_ENTRY,
]).config(() => {
  CloudProviderRegistry.registerProvider('huaweicloud', {
    name: 'HuaweiCloud',
    logo: {
      path: require('./logo/huaweicloud.logo.svg'),
    },
    image: {
      reader: HuaweiImageReader,
    },
    serverGroup: {
      transformer: 'huaweicloudServerGroupTransformer',
      detailsActions: HuaweiCloudServerGroupActions,
      detailsGetter: huaweicloudServerGroupDetailsGetter,
      detailsSections: [
        HuaweiCloudInfoDetailsSection,
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
      CloneServerGroupModal: HuaweiCloudCloneServerGroupModal,
      commandBuilder: 'huaweicloudServerGroupCommandBuilder',
      configurationService: 'huaweicloudServerGroupConfigurationService',
      scalingActivitiesEnabled: true,
    },
    instance: {
      instanceTypeService: 'huaweicloudInstanceTypeService',
      detailsTemplateUrl: require('./instance/details/instanceDetails.html'),
      detailsController: 'huaweicloudInstanceDetailsCtrl',
    },
    loadBalancer: {
      transformer: 'huaweicloudLoadBalancerTransformer',
      detailsTemplateUrl: require('./loadBalancer/details/loadBalancerDetails.html'),
      detailsController: 'huaweicloudLoadBalancerDetailsCtrl',
      CreateLoadBalancerModal: CreateApplicationLoadBalancer,
      targetGroupDetailsTemplateUrl: require('./loadBalancer/details/targetGroupDetails.html'),
      targetGroupDetailsController: 'huaweicloudTargetGroupDetailsCtrl',
      ClusterContainer: HuaweiCloudLoadBalancerClusterContainer,
      LoadBalancersTag: HuaweiCloudLoadBalancersTag,
    },
    securityGroup: {
      transformer: 'huaweicloudSecurityGroupTransformer',
      reader: 'huaweicloudSecurityGroupReader',
      detailsTemplateUrl: require('./securityGroup/details/securityGroupDetail.html'),
      detailsController: 'huaweicloudSecurityGroupDetailsCtrl',
      createSecurityGroupTemplateUrl: require('./securityGroup/configure/createSecurityGroup.html'),
      createSecurityGroupController: 'huaweicloudCreateSecurityGroupCtrl',
    },
    subnet: {
      renderer: 'huaweicloudSubnetRenderer',
    },
    search: {
      resultFormatter: 'huaweicloudSearchResultFormatter',
    },
  });
});

DeploymentStrategyRegistry.registerProvider('huaweicloud', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);

