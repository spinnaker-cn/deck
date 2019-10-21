import * as React from 'react'
import { HelpField, API } from '@spinnaker/core';
import { ServerGroupInstance } from './ServerGroupInstance'
import { ServerGroupImage } from './ServerGroupImage'
import Select from 'react-select'
// import { Subject } from 'rxjs'

export interface ISubnetOption {
    ref?: any,
    formik?: any,
    app?: any
}
export class ServerGroupSecurityId extends React.Component<ISubnetOption, {}> {
    constructor(props: ISubnetOption) {
        super(props)
        const { formik }: any = props;
        const { setFieldValue }: any = formik
        this.state = ({
            valids: false,
            serverGroupId: [],
            instanceType: [],
            keyPairs: [],
            isimage: false
        })
        if ( props.formik.values.viewState.mode !== 'editDeploy' ) {
            setFieldValue('scalingConfigurations.securityGroupId', null)
            setFieldValue('scalingConfigurations.keyPairName', null)
            setFieldValue('scalingConfigurations.instanceType', null)
            setFieldValue('scalingConfigurations.spotStrategy', null)
            setFieldValue('scalingConfigurations.imageId', null)
            setFieldValue('scalingConfigurations.password', null)
            setFieldValue('scalingConfigurations.ramRoleName', null)
            setFieldValue('scalingConfigurations.internetMaxBandwidthOut', null)
            setFieldValue('scalingConfigurations.loadBalancerWeight', null)
            setFieldValue('systemDiskCategory', null)
            setFieldValue('systemDiskSize', null)
        }
        if (props.formik.values.vSwitchId) {
            this.getAsyncDate(props);
        }
    };

    private getAsyncDate = (e: any) => {
        const { formik }: any = this.props;
        const { values }: any = formik;
        const that = this;
        API.one(`firewalls/${values.credentials}?provider=alicloud`)
            .get()
            .then(function(firwalls: any) {
              const index = Object.keys(firwalls).indexOf(values.region);
              const val: any[] = [];
              let firevallsValue: any[] = [];
              firevallsValue = firevallsValue.concat(Object.values(firwalls)[index])
              firevallsValue.forEach((item: any) => {
                  if (e.formik.values.vpcId === item.vpcId) {
                    val.push({ 'id': item.id, 'name': item.name })
                  }
              });
              that.setState({
                serverGroupId: val
              })
            });
        API.one('instanceTypes')
            .get()
            .then(function(types: any[]) {
              let typeval: any[] = [];
              types.forEach((item: any) => {
                if (item.account === values.credentials && item.regionId === values.region && item.zoneId === values.masterZoneId) {
                  typeval = typeval.concat(item.instanceTypes)
                }
              });
              that.setState({
                instanceType: typeval
              })
            });
        API.one('keyPairs')
            .get()
            .then(function(pairs: any) {
              const pairval: any[] = [];
              pairs.forEach((item: any) => {
                if (item.account === values.credentials) {
                  pairval.push(item.keyName)
                }
              });
              that.setState({
                keyPairs: pairval
              })
            })
    }

    // public sub$ = new Subject();

    public componentWillReceiveProps = (e: any) => {
        if ( e.formik.values.vSwitchId && this.props.formik.values.vSwitchId !== e.formik.values.vSwitchId) {
            this.getAsyncDate(e);
        }
    };

    private securityGroupChanged = (event: any) => {
        // this.sub$.next(event.target.value)
        const { formik }: any = this.props;
        const { values }: any = formik;
        values.scalingConfigurations.securityGroupId = event.id;
        formik.setFieldValue('scalingConfigurations', values.scalingConfigurations);
    };

    private getKayPairName = (event: any) => {
        // this.sub$.next(event.target.value)
        const { formik }: any = this.props;
        formik.setFieldValue('scalingConfigurations.keyPairName', event.value);
    };

    private getSpotStragy = (event: any) => {
        // this.sub$.next(event.target.value)
        const { formik }: any = this.props;
        const { values }: any = formik;
        values.scalingConfigurations.spotStrategy = event.value;
        formik.setFieldValue('scalingConfigurations', values.scalingConfigurations);
    };

    private getSystemDiskSize = (event: any) => {
        // this.sub$.next(event.target.value)
        const { formik }: any = this.props;
        formik.setFieldValue('systemDiskSize', event.target.value);
    };

    private getPassWord = (event: any) => {
        // this.sub$.next(event.target.value)
        const { formik }: any = this.props;
        formik.setFieldValue('scalingConfigurations.password', event.target.value);
        const a = /^(?!\/)(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:'<>?,.\/]).{8,64}$/;
        if (a.test(event.target.value)) {
            this.setState({ valids: false });
        } else {
            this.setState({ valids: true });
        }
        formik.setFieldValue('scalingConfigurations.password', event.target.value);
    };

    private getSystemDiskCategory = (event: any) => {
        // this.sub$.next(event.target.value)
        const { formik }: any = this.props;
        formik.setFieldValue('systemDiskCategory', event.value);
    };

    private getSpotPriceLimit = (event: any) => {
        // this.sub$.next(event.target.value)
        const { formik }: any = this.props;
        formik.setFieldValue('scalingConfigurations.spotPriceLimits[0].priceLimit', event.target.value);
    };

    private getRamRoleName = (event: any) => {
        // this.sub$.next(event.target.value)
        const { formik }: any = this.props;
        formik.setFieldValue('scalingConfigurations.ramRoleName', event.target.value);
    };

    private getInternetMaxBandwidthOut = (event: any) => {
        // this.sub$.next(event.target.value)
        const { formik }: any = this.props;
        formik.setFieldValue('scalingConfigurations.internetMaxBandwidthOut', event.target.value);
    };

    private getLoadBalancerWeight = (event: any) => {
        // this.sub$.next(event.target.value)
        const { formik }: any = this.props;
        formik.setFieldValue('scalingConfigurations.loadBalancerWeight', event.target.value);
    };

    private handleInstance = (val: any) => {
        const { formik }: any = this.props;
        formik.setFieldValue('scalingConfigurations.instanceType', val);
    };

    private getImage = () => {
        this.setState({
            isimage: false
        })
    };

    private handleImage = (val: any) => {
        const { formik }: any = this.props;
        formik.setFieldValue('scalingConfigurations.imageId', val);
    };

    public render (): React.ReactElement {
        const { formik }: any = this.props
        const { values }: any = formik
        const { serverGroupId, keyPairs, valids, isimage, instanceType }: any = this.state
        const serverGroupIds: any = [], IkeyPairs: any = [];
        serverGroupId.forEach( (item: any) => {
            item.value = item.id;
            item.label = item.id + '/' + item.name;
            serverGroupIds.push(item)
        });
        keyPairs.forEach( (item: any) => {
            const obj: any = {};
            obj.value = item;
            obj.label = item;
            IkeyPairs.push(obj);
        });
        return(
            <>
                {values.region === null
                ? <h5 className="text-center">Please select an account and region.</h5>
                : <div onClick={() => this.getImage()}>
                    <div className="form-group">
                        <div className="col-md-3 sm-label-right">
                            <label className="sm-label-right"> SecurityGroupId </label>
                        </div>
                        {values.vSwitchId === null
                            ? <h5 className="text-center col-md-7">(please select a subnet)</h5>
                            : <div className="col-md-7">
                                <Select
                                    required={true}
                                    value={values.scalingConfigurations.securityGroupId || ''}
                                    className="form-control input-sm"
                                    onChange={this.securityGroupChanged}
                                    options={serverGroupIds}
                                />
                            </div>
                        }
                    </div>
                    <div className="form-group">
                        <label className="col-md-3 sm-label-right">KeyPairName</label>
                        <div className="col-md-7">
                            <Select
                                required={true}
                                value={values.scalingConfigurations.keyPairName || ''}
                                className="form-control input-sm"
                                onChange={this.getKayPairName}
                                options={IkeyPairs}
                            />
                        </div>
                    </div>
                    {values.viewState.mode === 'create' && (
                        <ServerGroupImage
                            laybel={3}
                            command={values}
                            require={true}
                            isimage={isimage}
                            onChange={(value: any) => this.handleImage(value)}
                        />
                    )}
                    <div className="form-group">
                        <div className="col-md-3 sm-label-right">
                        SpotStrategy
                        </div>
                        <div className="col-md-7">
                            <Select
                                className="form-control input-sm"
                                value={values.scalingConfigurations.spotStrategy}
                                onChange={this.getSpotStragy}
                                options={[{
                                    value: 'NoSpot',
                                    label: 'NoSpot'
                                }, {
                                    value: 'SpotWithPriceLimit',
                                    label: 'SpotWithPriceLimit'
                                }, {
                                    value: 'SpotAsPriceGo',
                                    label: 'SpotAsPriceGo'
                                }]}
                            />
                        </div>
                    </div>
                    {values.scalingConfigurations.spotStrategy === 'SpotWithPriceLimit' && (
                        <div className="form-group">
                            <div className="col-md-3 sm-label-right">
                            SpotPriceLimit
                            </div>
                            <div className="col-md-7">
                            <input
                                type="number"
                                className="form-control input-sm"
                                value={values.scalingConfigurations.spotPriceLimits[0].priceLimit || ''}
                                name="SpotPriceLimit"
                                onChange={this.getSpotPriceLimit}
                            />
                            </div>
                        </div>
                    )}

                    <ServerGroupInstance
                        laybel={3}
                        command={values}
                        require={true}
                        instancetype={instanceType}
                        onChange={(value: any) => this.handleInstance(value)}
                    />
                    <div className="form-group">
                        <div className="col-md-3 sm-label-right">
                        Password
                        </div>
                        <div className="col-md-7">
                        <input
                            type="password"
                            className="form-control input-sm"
                            value={values.scalingConfigurations.password || ''}
                            name="password"
                            onChange={this.getPassWord}
                        />
                        {( valids && values.scalingConfigurations.password ) && <span className="error" style={{ color: 'red' }}>Enter the content in the correct format</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-md-3 sm-label-right">
                            DiskCategory
                            <HelpField id="alicloud.serverGroup.Diskcategory"/>
                        </div>
                        <div className="col-md-7">
                            <Select
                                className="form-control input-sm"
                                value={values.systemDiskCategory || ''}
                                onChange={this.getSystemDiskCategory}
                                options={[
                                    {
                                        value: 'cloud_efficiency',
                                        label: 'cloud_efficiency'
                                    },
                                    {
                                        value: 'cloud_ssd',
                                        label: 'cloud_ssd'
                                    },
                                    {
                                        value: 'ephemeral_ssd',
                                        label: 'ephemeral_ssd'
                                    },
                                    {
                                        value: 'cloud_essd',
                                        label: 'cloud_essd'
                                    }
                                ]}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-md-3 sm-label-right">
                            DiskSize
                            <HelpField id="alicloud.serverGroup.Disksize"/>
                        </div>
                        <div className="col-md-7">
                        <input
                            type="number"
                            min="40"
                            max="500"
                            className="form-control input-sm"
                            value={values.systemDiskSize || ''}
                            name="systemDiskSize"
                            onChange={this.getSystemDiskSize}
                        />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-md-3 sm-label-right">
                        RamRoleName
                        </div>
                        <div className="col-md-7">
                        <input
                            className="form-control input-sm"
                            value={values.scalingConfigurations.ramRoleName || ''}
                            onChange={this.getRamRoleName}
                        />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-md-3 sm-label-right">MaxBandwidthOut
                        </div>
                        <div className="col-md-3">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-control input-sm"
                            value={values.scalingConfigurations.internetMaxBandwidthOut || ''}
                            name="InternetMaxBandwidthOut"
                            onChange={this.getInternetMaxBandwidthOut}
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
                            value={values.scalingConfigurations.loadBalancerWeight || ''}
                            name="loadBalancerWeight"
                            onChange={this.getLoadBalancerWeight}
                        />
                        </div>
                    </div>
                </div>
                }
            </>
        )
    }
}
