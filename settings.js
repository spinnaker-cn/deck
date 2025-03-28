'use strict';

var apiHost = 'http://spinnaker.imgo.tv:8084';
var artifactsEnabled = process.env.ARTIFACTS_ENABLED === 'true';
var artifactsRewriteEnabled = process.env.ARTIFACTS_REWRITE_ENABLED === 'true';
var atlasWebComponentsUrl = process.env.ATLAS_WEB_COMPONENTS_URL;
var authEndpoint = process.env.AUTH_ENDPOINT || apiHost + '/auth/user';
var authEnabled = true;
var bakeryDetailUrl =
  process.env.BAKERY_DETAIL_URL || apiHost + '/bakery/logs/{{context.region}}/{{context.status.resourceId}}';
var canaryAccount = process.env.CANARY_ACCOUNT || '';
var canaryEnabled = 'true' === 'true';
var canaryFeatureDisabled = 'true' !== 'true';
var canaryStagesEnabled = 'true' === 'true';
var chaosEnabled = process.env.CHAOS_ENABLED === 'true' ? true : false;
var debugEnabled = process.env.DEBUG_ENABLED === 'false' ? false : true;
var defaultMetricStore = process.env.METRIC_STORE || 'atlas';
var displayTimestampsInUserLocalTime = process.env.DISPLAY_TIMESTAMPS_IN_USER_LOCAL_TIME === 'true';
var dryRunEnabled = process.env.DRYRUN_ENABLED === 'true' ? true : false;
var entityTagsEnabled = process.env.ENTITY_TAGS_ENABLED === 'true' ? true : false;
var fiatEnabled = 'true' === 'true';
var gremlinEnabled = process.env.GREMLIN_ENABLED === 'false' ? false : true;
var iapRefresherEnabled = process.env.IAP_REFRESHER_ENABLED === 'true' ? true : false;
var infrastructureEnabled = process.env.INFRA_ENABLED === 'true' ? true : false;
var managedPipelineTemplatesV2UIEnabled = process.env.MANAGED_PIPELINE_TEMPLATES_V2_UI_ENABLED === 'true';
var managedServiceAccountsEnabled = process.env.MANAGED_SERVICE_ACCOUNTS_ENABLED === 'true';
var onDemandClusterThreshold = process.env.ON_DEMAND_CLUSTER_THRESHOLD || '600';
var reduxLoggerEnabled = process.env.REDUX_LOGGER === 'true';
var templatesEnabled = process.env.TEMPLATES_ENABLED === 'true';
var useClassicFirewallLabels = process.env.USE_CLASSIC_FIREWALL_LABELS === 'true';

window.spinnakerSettings = {
  authEnabled: authEnabled,
  authEndpoint: authEndpoint,
  authTtl: 600000,
  bakeryDetailUrl: bakeryDetailUrl,
  canary: {
    atlasWebComponentsUrl: atlasWebComponentsUrl,
    defaultJudge: 'NetflixACAJudge-v1.0',
    featureDisabled: canaryFeatureDisabled,
    metricsAccountName: canaryAccount,
    metricStore: defaultMetricStore,
    reduxLogger: reduxLoggerEnabled,
    showAllConfigs: true,
    stagesEnabled: canaryStagesEnabled,
    storageAccountName: canaryAccount,
    templatesEnabled: templatesEnabled,
  },
  checkForUpdates: true,
  debugEnabled: debugEnabled,
  defaultCategory: 'serverGroup',
  defaultInstancePort: 80,
  defaultProviders: [
    'appengine',
    'aws',
    'azure',
    'alicloud',
    'cloudfoundry',
    'dcos',
    'ecs',
    'gce',
    'huaweicloud',
    'kubernetes',
    'openstack',
    'oracle',
    'tencent',
    'hecloud',
    'ctyun',
    'ecloud'
  ],
  defaultTimeZone: process.env.TIMEZONE || 'Asia/Shanghai', // see http://momentjs.com/timezone/docs/#/data-utilities/
  feature: {
    artifacts: artifactsEnabled,
    artifactsRewrite: artifactsRewriteEnabled,
    canary: canaryEnabled,
    chaosMonkey: chaosEnabled,
    displayTimestampsInUserLocalTime: displayTimestampsInUserLocalTime,
    dryRunEnabled: dryRunEnabled,
    entityTags: entityTagsEnabled,
    fiatEnabled: fiatEnabled,
    gremlinEnabled: gremlinEnabled,
    iapRefresherEnabled: iapRefresherEnabled,
    // whether stages affecting infrastructure (like "Create Load Balancer") should be enabled or not
    infrastructureStages: infrastructureEnabled,
    jobs: false,
    managedPipelineTemplatesV2UI: managedPipelineTemplatesV2UIEnabled,
    managedServiceAccounts: managedServiceAccountsEnabled,
    notifications: false,
    pagerDuty: false,
    pipelineTemplates: false,
    pipelines: true,
    quietPeriod: false,
    roscoMode: true,
    snapshots: false,
    travis: false,
    versionedProviders: true,
    wercker: false,
  },
  gateUrl: apiHost,
  alicloudInstanceTypes: ['ecs.*6[^\\d][\\\\.].*','ecs.*7[^\\d][\\\\.].*'],
  gitSources: ['stash', 'github', 'bitbucket', 'gitlab'],
  maxPipelineAgeDays: 14,
  newApplicationDefaults: {
    chaosMonkey: false,
  },
  notifications: {
    bearychat: {
      enabled: true,
    },
    email: {
      enabled: true,
    },
    githubStatus: {
      enabled: true,
    },
    googlechat: {
      enabled: true,
    },
    hipchat: {
      botName: 'Skynet T-800',
      enabled: true,
    },
    pubsub: {
      enabled: true,
    },
    slack: {
      botName: 'spinnakerbot',
      enabled: true,
    },
    sms: {
      enabled: true,
    },
  },
  onDemandClusterThreshold: Number(onDemandClusterThreshold),
  pollSchedule: 30000,
  providers: {
    appengine: {
      defaults: {
        account: 'my-appengine-account',
      },
    },
    aws: {
      defaults: {
        account: 'test',
        region: 'us-east-1',
        iamRole: 'BaseIAMRole',
      },
      defaultSecurityGroups: [],
      loadBalancers: {
        disableManualOidcDialog: false,
        // if true, VPC load balancers will be created as internal load balancers if the selected subnet has a purpose
        // tag that starts with "internal"
        inferInternalFlagFromSubnet: false,
      },
      useAmiBlockDeviceMappings: false,
    },
    azure: {
      defaults: {
        account: 'azure-test',
        region: 'westus',
      },
    },
    alicloud: {
      defaults: {
        account: 'ali-account',
        region: 'ch-hangzhou',
      },
    },
    cloudfoundry: {
      defaults: {
        account: 'my-cloudfoundry-account',
      },
    },
    dcos: {
      defaults: {
        account: 'my-dcos-account',
      },
    },
    ecs: {
      defaults: {
        account: 'test',
        iamRole: 'BaseIAMRole',
        region: 'us-east-1',
      },
      defaultSecurityGroups: [],
    },
    gce: {
      associatePublicIpAddress: true,
      defaults: {
        account: 'my-google-account',
        instanceTypeStorage: {
          count: 1,
          defaultSettings: {
            disks: [
              {
                sizeGb: 10,
                type: 'pd-ssd',
              },
            ],
          },
          localSSDSupported: false,
          size: 10,
        },
        region: 'us-central1',
        zone: 'us-central1-f',
      },
    },
    hecloud: {
      defaults: {
        account: 'ZXXY2020',
        region: 'cidc-rp-11',
      },
    },
    huaweicloud: {
      defaults: {
        account: 'my-huawei-account',
        region: 'cn-north-4',
      },
    },
    kubernetes: {
      defaults: {
        account: 'my-kubernetes-account',
        apiPrefix: 'api/v1/proxy/namespaces/kube-system/services/kubernetes-dashboard/#',
        instanceLinkTemplate: '{{host}}/api/v1/proxy/namespaces/{{namespace}}/pods/{{name}}',
        internalDNSNameTemplate: '{{name}}.{{namespace}}.svc.cluster.local',
        namespace: 'default',
        proxy: 'localhost:8001',
      },
    },
    oracle: {
      defaults: {
        account: 'DEFAULT',
        bakeryRegions: ['us-phoenix-1'],
        region: 'us-phoenix-1',
      },
    },
    openstack: {
      defaults: {
        account: 'test',
        region: 'us-west-1',
      },
    },
    titus: {
      defaults: {
        account: 'titustestvpc',
        iamProfile: '{{application}}InstanceProfile',
        region: 'us-east-1',
      },
    },
    tencent: {
      defaults: {
        account: 'test',
        region: 'ap-guangzhou',
      },
    },
    ctyun: {
      defaults: {
        account: 'myCtyunName',
        region: 'd8d23b1e44ad11e9accd0242ac110002',
      },
    },
    ecloud: {
      defaults: {
        account: 'test',
        region: 'ap-yidong',
      },
    },
  },
  pagerDuty: {
    required: false,
  },
  pubsubProviders: ['google'], // TODO(joonlim): Add amazon once it is confirmed that amazon pub/sub works.
  searchVersion: 1,
  triggerTypes: [
    'artifactory',
    'concourse',
    'cron',
    'docker',
    'git',
    'jenkins',
    'pipeline',
    'pubsub',
    'travis',
    'webhook',
    'wercker',
  ],
  useClassicFirewallLabels: useClassicFirewallLabels,
  whatsNew: {
    fileName: 'news.md',
    gistId: '32526cd608db3d811b38',
  },
};
