import { HelpContentsRegistry } from '@spinnaker/core';
import Utility from '../utility';

const helpContents: { [key: string]: string } = {
  'alicloud.securityGroup.ingress.description': 'Friendly description of the rule you want to enable (limit 80 chars.)',
  'alicloud.securityGroup.ingress.priority':
    "Rules are processed in priority order; the lower the number, the higher the priority.  We recommend leaving gaps between rules - 100, 200, 300, etc. - so that it's easier to add new rules without having to edit existing rules.  There are several default rules that can be overridden with priority (65000, 65001 and 65500).  For more information visit http://portal.alicloud.com.",
  'alicloud.securityGroup.ingress.source':
    "The source filter can be Any, an IP address range or a default tag('Internet', 'VirtualNetwork', AliCloudLoadBalancer').  It specifies the incoming traffic from a specific source IP address range (CIDR format) that will be allowed or denied by this rule.",
  'alicloud.securityGroup.ingress.sourcePortRange':
    'The source port range can be a single port, such as 80, or a port range, such as 1024-65535.  This specifies from which ports incoming traffic will be allowed or denied by this rule.  Provide an asterisk (*) to allow traffic from clients connecting from any port.',
  'alicloud.securityGroup.ingress.destination':
    "The destination filter can be Any, an IP address range or a default tag('Internet', 'VirtualNetwork', AliCloudLoadBalancer').  It specifies the outgoing traffic from a specific destination IP address range (CIDR format) that will be allowed or denied by this rule.",
  'alicloud.securityGroup.ingress.destinationPortRange':
    'The destination port range can be a single port, such as 80, or a port range, such as 1024-65535.  This specifies from which destination ports traffic will be allowed or denied by this rule.  Provide an asterisk (*) to allow traffic from clients connecting from any port.',
  'alicloud.securityGroup.ingress.direction': 'Specifies whether the rule is for inbound or outbound traffic.',
  'alicloud.securityGroup.ingress.actions':
    'To adjust the priority of a rule, move it up or down in the list of rules.  Rules at the top of the list have the highest priority.',
  'alicloud.securityGroup.ingress.destPortRanges':
    'Provide a single port, such as 80; a port range, such as 1024-65535; or a comma-separated list of single ports and/or port ranges, such as 80,1024-65535. Provide an asterisk (*) to allow traffic on any port.',
  'alicloud.securityGroup.ingress.sourceIPCIDRRanges':
    'Provide an address range using CIDR notation, such as 192.168.99.0/24; an IP address, such as 192.168.99.0; or a comma-separated list of address ranges or IP addresses, such as 10.0.0.0/24,44.66.0.0/24',
  'alicloud.serverGroup.imageName': '(Required) <b>Image</b> is the deployable AliCloud Machine Image.',
  'alicloud.serverGroup.stack':
    '(Required) <b>Stack</b> is one of the core naming components of a cluster, used to create vertical stacks of dependent services for integration testing.',
  'alicloud.serverGroup.detail':
    '(Required) <b>Detail</b> is a naming component to help distinguish specifics of the server group.',
  'alicloud.serverGroup.Diskcategory':
    '(Required) <b>Diskcategory</b> is SystemDisk.Category.',
  'alicloud.serverGroup.Disksize':
    '(Required) <b>Disksize</b> is SystemDisk.Size.',
  'alicloud.securityGroup.stack':
    '(Required) <b>Stack</b> is one of the core naming components of a securityGroup, used to create vertical stacks of dependent services for integration testing.',
  'alicloud.serverGroup.traffic':
    `<p>Enables the "AddToLoadBalancer" scaling process, which is used by Spinnaker and discovery services to determine if the server group is enabled.</p>
     <p>Will be automatically enabled when any non "custom" deployment strategy is selected.</p>`,
  'alicloud.blockDeviceMappings.useAMI':
    '<p>Spinnaker will use the block device mappings from the selected AMI when deploying a new server group.</p>',
  'alicloud.securityGroup.detail':
    '(Required) <b>Detail</b> is a naming component to help distinguish specifics of the securityGroup.',
  'alicloud.serverGroup.scriptLocation':
    'The location of custom scripts separated by comma or semicolon to be downloaded on to each instance. A single script should be like: fileUri. Multiple scripts should be like fileUri1,fileUri2 or fileUri1;fileUri2',
  'alicloud.serverGroup.commandToExecute':
    'Command(s) to execute custom scripts provided during provisioning of an instance.',
  'alicloud.serverGroup.customData': 'Script or metadata to be injected into each instances.',
  'alicloud.serverGroup.customTags': `Custom tags on Virtual Machine Scale Set. Allow ${Utility.TAG_LIMITATION} tags at most.`,
  'alicloud.loadBalancer.stack':
    '(Required) <b>Detail</b> is a naming component to help distinguish specifics of the server group.',
  'alicloud.serverGroup.enableInboundNAT':
    'An AliCloud load balancer of the basic sku will be created with adding inbound NAT port-forwarding rules to facilitate loggin on VM instances. There is no charge for creating an AliCloud load balancer of the basic sku. This option is disabled if Availability Zones are set which require Standard AliCloud Load Balancer and an extra Network Security Group with correct inbound and outbound rules configured.',
};

Object.keys(helpContents).forEach(key => HelpContentsRegistry.register(key, helpContents[key]));
