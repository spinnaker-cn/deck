import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { Subject } from 'rxjs';
import {
    ModalClose,
    NgReact,
    ReactModal,
    TaskMonitor,
    API,
  } from '@spinnaker/core';
  import { ServerGroupWriters } from '../serverGroupWirter';
  import { AlicloudFooter } from 'alicloud/common/AlicloudFooter';
  import { ServerGroupInstance } from '../../configure/wizard/securityGroup/ServerGroupInstance'
  import { ServerGroupImage } from '../../configure/wizard/securityGroup/ServerGroupImage'
  import { TagsSelector } from '../../configure/wizard/tags/TagsSelector'
  import { AlicloudServerGroupTransformer } from '../../serverGroup.transformer';

export class UpdateLaunchConfigServerGroup extends React.Component {
    constructor(props: any) {
        super(props)
        const { serverGroup, application, dismissModal } = props;
        this.state = {
            isvalid: false,
            keyPairs: [],
            tags: serverGroup.launchConfig.tags,
            instanceType: [],
            ServerGroup: {},
            instancetype: serverGroup.launchConfig.instanceType,
            imageId: serverGroup.launchConfig.imageId,
            isimage: false,
            systemDiskCategory: serverGroup.launchConfig.systemDiskCategory,
            systemDiskSize: serverGroup.launchConfig.systemDiskSize,
            spotStrategy: serverGroup.launchConfig.spotStrategy,
            loadBalancerWeight: serverGroup.launchConfig.loadBalancerWeight,
            priceLimit: serverGroup.launchConfig.spotPriceLimit.length > 1 ? serverGroup.launchConfig.spotPriceLimit[0].priceLimit : null,
            internetMaxBandwidthOut: serverGroup.launchConfig.internetMaxBandwidthOut,
            keyPairName: serverGroup.launchConfig.keyPairName,
            taskMonitor: new TaskMonitor({
                application: application,
                title: 'UpdateSecurityGroupsFor' + serverGroup.name,
                modalInstance: TaskMonitor.modalInstanceEmulation(() => dismissModal),
                onTaskComplete: () => application.serverGroups.refresh(),
            }),
        };
        this.getAsyncData()
        this.isValid()
    }

    private getAsyncData = () => {
        const { serverGroup }: any = this.props
        const that = this
        API.one('keyPairs')
        .get()
        .then(function(pairs: any) {
          const pairval: any[] = [];
          pairs.forEach((item: any) => {
            if (item.account === serverGroup.account) {
              pairval.push(item.keyName)
            }
          });
          that.setState({
            keyPairs: Array.from(new Set(pairval))
          })
        });

      API.one('instanceTypes')
        .get()
        .then(function(types: any) {
          API.one('subnets/alicloud').getList().then((vnets: any) => {
            const subnets: any[] = [];
            vnets.forEach((vnet: any) => {
              if (vnet.account === serverGroup.account && vnet.region === serverGroup.region) {
                subnets.push(vnet);
              }
            });
            let zoneIds = '';
            subnets.forEach((item: any) => {
              if (item.vswitchId === serverGroup.result.scalingGroup.vswitchId) {
                return zoneIds = item.zoneId
              }
            });
            let typeval: any[] = [];
            types.forEach((item: any) => {
              if (item.account === serverGroup.account && item.regionId === serverGroup.region && item.zoneId === zoneIds) {
                typeval = typeval.concat(item.instanceTypes)
              }
            });
            that.setState({
                instanceType: typeval
            })
          });
        });
    }

    public sub$ = new Subject();

    private isValid = () => {
        // const { serverGroup }: any = this.props;
        this.sub$.subscribe(() => {
            this.setState({
                isvalid: true
            })
        })
        // if (serverGroup.name === this.stat.selectedOption) {
        //     this.setState({
        //         isvalid: false
        //     })
        // }
    };
    public static show(props: any): Promise<any> {
        const modalProps = {};
        return ReactModal.show(UpdateLaunchConfigServerGroup, props, modalProps);
    }
    private close = (args?: any): void => {
        const { dismissModal }: any = this.props;
        dismissModal.apply(null, args);
    };

    private handleChange = (e: any) => {
        this.sub$.next(e)
        const obj: any = {}
        obj[e.target.name] = e.target.value;
        this.setState(obj)
        this.isValid()
    }

    private handleInstance = (val: any) => {
        this.sub$.next(val)
        this.setState({
            instancetype: val
        })
        this.isValid()
    }

    private handleImage = (val: any) => {
        this.sub$.next(val)
        this.setState({
            imageId: val
        })
        this.isValid()
    }

    private handleTags = (val: any) => {
        this.sub$.next(val)
        this.setState({
            tags: val
        })
        this.isValid()
    }
    private submit = (): void => {
        const { serverGroup, application }: any = this.props;
        const {
            systemDiskCategory,
            systemDiskSize,
            spotStrategy,
            loadBalancerWeight,
            internetMaxBandwidthOut,
            keyPairName,
            instancetype,
            priceLimit,
            taskMonitor,
            imageId,
            tags
        }: any = this.state;
        serverGroup.result.scalingConfiguration.systemDiskCategory = systemDiskCategory;
        serverGroup.result.scalingConfiguration.systemDiskSize = systemDiskSize;
        serverGroup.result.scalingConfiguration.tags = JSON.stringify(tags);
        serverGroup.result.scalingConfiguration.loadBalancerWeight = loadBalancerWeight;
        serverGroup.result.scalingConfiguration.internetMaxBandwidthOut = internetMaxBandwidthOut;
        serverGroup.result.scalingConfiguration.spotStrategy = spotStrategy;
        serverGroup.result.scalingConfiguration.instanceType = instancetype;
        serverGroup.result.scalingConfiguration.keyPairName = keyPairName;
        serverGroup.result.scalingConfiguration.imageId = imageId;
        if ( serverGroup.result.scalingConfiguration.spotStrategy === 'SpotWithPriceLimit') {
            serverGroup.result.scalingConfiguration.spotPriceLimit = [];
            if ( priceLimit ) {
                const a: any = {
                    'priceLimit': priceLimit
                }
                serverGroup.result.scalingConfiguration.spotPriceLimit.push(a)
            }
        }
        taskMonitor.submit(() => {
            return new ServerGroupWriters(AlicloudServerGroupTransformer).updateLaunchConfigs(serverGroup, application);
        });
    };
    private getImage = () => {
        this.setState({
            isimage: false
        })
    }
    public render(): React.ReactElement {
        const { serverGroup }: any = this.props;
        const {
            isvalid,
            systemDiskCategory,
            systemDiskSize,
            spotStrategy,
            loadBalancerWeight,
            priceLimit,
            internetMaxBandwidthOut,
            keyPairName,
            keyPairs,
            instanceType,
            taskMonitor,
            isimage
        }: any = this.state;
        const { TaskMonitorWrapper } = NgReact;
        return (
            <div className="confirmation-modal" onClick={() => this.getImage()}>
                <TaskMonitorWrapper monitor={taskMonitor} />
                <Modal.Header>
                    <Modal.Title>{'UpdateLaunchConfigure' + serverGroup.name}</Modal.Title>
                </Modal.Header>
                <ModalClose dismiss={this.close} />
                <Modal.Body>
                <form role="form" name="UpdateLaunchConfig">
                    <div className="form-group row">
                        <div className="col-md-4 sm-label-right">
                        SystemDisk.Category
                        </div>
                        <div className="col-md-7">
                            <select
                                className="form-control input-sm"
                                value={systemDiskCategory}
                                onChange={(e) => this.handleChange(e)}
                                name="systemDiskCategory"
                            >
                                {['cloud', 'cloud_efficiency', 'cloud_ssd', 'ephemeral_ssd', 'cloud_essd'].map( (q: any) => {
                                    return(
                                        <>
                                        <option key={q}>{q}</option>
                                        </>
                                    )
                                })}
                            </select>
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="col-md-4 sm-label-right">
                        SystemDisk.Size
                        </div>
                        <div className="col-md-7">
                            <input
                                type="number"
                                min="40"
                                max="500"
                                className="form-control input-sm"
                                value={systemDiskSize}
                                name="systemDiskSize"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="col-md-4 sm-label-right">
                        SpotStrategy
                        </div>
                        <div className="col-md-7">
                            <select
                                className="form-control input-sm"
                                onChange={(e) => this.handleChange(e)}
                                name="spotStrategy"
                                value={spotStrategy}
                            >
                                {['NoSpot', 'SpotWithPriceLimit', 'SpotAsPriceGo'].map( (q: any) => {
                                    return(
                                        <>
                                        <option key={q}>{q}</option>
                                        </>
                                    )
                                })}
                            </select>
                        </div>
                    </div>
                    {spotStrategy === 'SpotWithPriceLimit' && (
                        <div className="form-group row">
                            <div className="col-md-4 sm-label-right">
                            SpotPriceLimit
                            </div>
                            <div className="col-md-7">
                                <input
                                    className="form-control input-sm"
                                    value={priceLimit}
                                    type="number"
                                    onChange={(e) => this.handleChange(e)}
                                    name="priceLimit"
                                />
                            </div>
                        </div>
                    )}
                    <div className="form-group row">
                        <div className="col-md-4 sm-label-right">MaxBandwidthOut
                        </div>
                        <div className="col-md-2">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="form-control input-sm"
                                value={internetMaxBandwidthOut}
                                name="internetMaxBandwidthOut"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </div>
                        <div className="col-md-6 form-inline">
                            <label className="sm-label-right">
                                LoadBalancerWeight
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="form-control input-sm"
                                value={loadBalancerWeight}
                                name="loadBalancerWeight"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </div>
                    </div>

                    <div className="form-group row">
                        <label className="col-md-4 sm-label-right">KeyPairName</label>
                        <div className="col-md-7">
                            <select
                            className="form-control input-sm"
                            value={keyPairName}
                            onChange={(e) => this.handleChange(e)}
                            name="keyPairName"
                            >
                                {keyPairs.map( (q: any) => {
                                    return (
                                        <>
                                            <option key={q}>{q}</option>
                                        </>
                                    )
                                })}
                            </select>
                        </div>
                    </div>

                    <ServerGroupInstance
                        laybel={4}
                        command={serverGroup.result}
                        require={false}
                        instancetype={instanceType}
                        onChange={(value: any) => this.handleInstance(value)}
                    />

                    <ServerGroupImage
                        laybel={4}
                        command={serverGroup.result}
                        require={false}
                        isimage={isimage}
                        onChange={(value: any) => this.handleImage(value)}
                    />

                    <div className="form-group row">
                        <div className="container-fluid form-horizontal col-md-10 col-md-offset-1">
                            <TagsSelector
                                command={serverGroup.result}
                                onChange={(e: any) => this.handleTags(e)}
                            />
                        </div>
                    </div>
                </form>
                </Modal.Body>
                <AlicloudFooter
                    onSubmit={this.submit}
                    onCancel={this.close}
                    isValid={isvalid}
                    account={serverGroup.account}
                />
            </div>
        )
    }
}
