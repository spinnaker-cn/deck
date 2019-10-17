import * as React from 'react';
import { Field, FormikProps } from 'formik';
import Select from 'react-select';

import {
  AccountSelectInput,
  Application,
  HelpField,
  AccountService,
  Spinner,
  API,
  ValidationMessage,
} from '@spinnaker/core';
import { Subject } from 'rxjs';

export interface ISubnetOption {
  availabilityZones: string[];
  deprecated?: boolean;
  label: string;
  purpose: string;
  vpcIds: string[];
}

export interface ILoadBalancerLocationProps {
  app: Application;
  formik: FormikProps<any>;
  forPipelineConfig?: boolean;
  isNew?: boolean;
  loadBalancer?: any;
}

export class LoadBalancerLocation extends React.Component<ILoadBalancerLocationProps> {
    constructor(props: any) {
      super(props);
      const { app }: any = props;
      this.state = {
        accounts: app.accounts,
        availabilityZones: [],
        existingLoadBalancerNames: [],
        hideInternalFlag: false,
        internalFlagToggled: false,
        regions: [],
        vnets: [],
        zoneId: [],
        subnets: [],
        vSwitchId: '',
        vSwitchName: '',
      };
      this.getAccount();
    }
    public sub$ = new Subject();

    public getAccount = () => {
      const that = this
      AccountService.listAccounts('alicloud').then(function(account: any) {
        const nregion: any[] = [];
        const Account: any = [];
        account.forEach((item: any) => {
          Account.push(item.name);
        });
        account[0].regions.forEach((item: any) => {
          nregion.push({
            value: item,
            label: item
          });
        });
        that.setState({
          regions: nregion,
        })
        that.setState({
          accounts: Account,
        })
      });
    };

    public updateSubnet = (region: any) => {
      const { values } = this.props.formik;
      const { isNew }: any = this.props;
      const that = this;
      API.one('subnets/alicloud')
        .getList()
        .then((vnets: any) => {
          const subnets: any[] = [];
          vnets.forEach((vnet: any) => {
            if (vnet.account === values.credentials && vnet.region === region) {
                subnets.push({ value: vnet.vswitchName + '/' + vnet.vswitchId, name: vnet.vswitchName, zoneId: vnet.zoneId, id: vnet.vswitchId, label: vnet.vswitchName + '/' + vnet.vswitchId })
            }
          });
          that.setState({
            subnets: subnets,
          })
          const zone: any = Array.from(
            new Set(
              subnets.map(item => {
                return item.zoneId;
              }),
            ),
          );
          if (!isNew) {
            vnets.forEach((vnet: any) => {
              if (vnet.account === values.credentials && vnet.region === region && values.vSwitchId === vnet.vswitchId) {
                this.props.formik.setFieldValue('masterZoneId', vnet.zoneId);
                this.props.formik.setFieldValue('vSwitchName', vnet.vswitchName);
                this.getVnets(vnet.zoneId);
              }
            });
          }
          this.setState({
            zoneId: zone
          })
        });
    }

    private handleSubnetUpdated = (subnetType: any) => {
      this.props.formik.setFieldValue('vSwitchId', subnetType.id);
      this.props.formik.setFieldValue('vSwitchName', subnetType.name);
    };

    private accountUpdated = (account: string): void => {
      this.sub$.next(account)
      this.props.formik.setFieldValue('credentials', account);
    };

    private regionUpdated = (region: any): void => {
      this.sub$.next(region)
      this.props.formik.setFieldValue('region', region.value);
      this.updateSubnet(region.value)
    };

    private stackChanged = (event: React.ChangeEvent<HTMLInputElement>): void => {
      this.props.formik.setFieldValue('stack', event.target.value);
    };

    private detailChanged = (event: React.ChangeEvent<HTMLInputElement>): void => {
      this.props.formik.setFieldValue('detail', event.target.value);
    };

    private addresstypechange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (event.target.value === 'internet') {
        this.props.formik.setFieldValue('vSwitchId', null);
        this.props.formik.setFieldValue('vSwitchName', null);
      }
      this.props.formik.setFieldValue('addressType', event.target.value);
    };

    private changeZoneId = (event: any): void => {
      const { values } = this.props.formik;
      this.getVnets(event.value);
      if (values.masterZoneId !== event.value) {
        this.props.formik.setFieldValue('vSwitchId', null);
        this.props.formik.setFieldValue('vSwitchName', null);
        this.props.formik.setFieldValue('masterZoneId', event.value);
      }
    };

    private getVnets = (value: any) => {
      const { subnets }: any = this.state
      const subs: any = [];
      subnets.forEach((item: any) => {
        if (item.zoneId === value) {
          subs.push(item)
        }
      });
      this.setState({
        vnets: subs
      })
    }

    private addressIPVersionchange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      this.props.formik.setFieldValue('addressIPVersion', event.target.value);
    };

    private handleLoadBalancerSpec = (spec: any) => {
      this.props.formik.setFieldValue('loadBalancerSpec', spec);
    }

  public render() {
    const { isNew }: any = this.props
    const { errors, values }: any = this.props.formik;
    const { accounts, regions, vnets, zoneId }: any = this.state;
    const LoadBalancerSpec: any = [
      {
        value: 'slb.s1.small',
        label: 'slb.s1.small'
      },
      {
        value: 'slb.s2.small',
        label: 'slb.s2.small'
      },
      {
        value: 'slb.s3.small',
        label: 'slb.s3.small'
      },
      {
        value: 'slb.s2.medium',
        label: 'slb.s2.medium'
      },
      {
        value: 'slb.s3.medium',
        label: 'slb.s3.medium'
      },
      {
        value: 'slb.s3.large',
        label: 'slb.s3.large'
      },
    ];
    const zoneIds: any = [];
    zoneId.forEach((item: any) => {
      const obj: any = {};
      obj.value = item;
      obj.label = item;
      zoneIds.push(obj)
    })

    return (
      <>
      <div className="container-fluid form-horizontal">
        {!accounts && (
          <div style={{ height: '200px' }}>
            <Spinner size="medium" />
          </div>
        )}
        {accounts && (
          <div className="modal-body">
            <div className="form-group">
              <div className={`col-md-12 well ${errors.name} ? 'alert-danger' : 'alert-info'`}>
                <strong>Your load balancer will be named: </strong>
                <span>{values.name}</span>
                {/* <HelpField id="alicloud.loadBalancer.name" /> */}
                <Field type="text" style={{ display: 'none' }} className="form-control input-sm no-spel" name="name" />
                {errors.name && <ValidationMessage type="error" message={errors.name} />}
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-3 sm-label-right">Account</div>
              <div className="col-md-7">
                <AccountSelectInput
                  value={values.credentials}
                  onChange={(evt: any) => this.accountUpdated(evt.target.value)}
                  accounts={accounts}
                  provider="alicloud"
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-3 sm-label-right">Region</div>
              <div className="col-md-7">
                <Select
                  options={regions}
                  value={values.region}
                  onChange={(evt: any) => this.regionUpdated(evt)}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-3 sm-label-right">
                Stack
                <HelpField id="alicloud.loadBalancer.stack" />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className={`form-control input-sm no-spel ${errors.stack} ? 'invalid' : ''`}
                  value={values.stack}
                  name="stack"
                  onChange={this.stackChanged}
                />
              </div>
              <div className="col-md-6 form-inline">
                <label className="sm-label-right">
                  <span>
                    Detail
                    {/* <HelpField id="alicloud.loadBalancer.detail" />{' '} */}
                  </span>
                </label>
                <input
                  type="text"
                  className={`form-control input-sm no-spel ${errors.detail} ? 'invalid' : ''`}
                  value={values.detail}
                  name="detail"
                  onChange={this.detailChanged}
                />
              </div>
              {errors.stack && (
                <div className="col-md-7 col-md-offset-3">
                  <ValidationMessage type="error" message={errors.stack} />
                </div>
              )}
              {errors.detail && (
                <div className="col-md-7 col-md-offset-3">
                  <ValidationMessage type="error" message={errors.detail} />
                </div>
              )}
            </div>
            <div className="form-group">
              <div className="col-md-3 sm-label-right">
                  AddressIPVersion
                  {/* <HelpField id="alicloud.loadBalancer.AddressIPVersion"/> */}
              </div>
              <div className="col-md-7">
                <select
                  className="form-control input-sm"
                  value={values.addressIPVersion}
                  onChange={() => this.addressIPVersionchange}
                >
                  <option key="ipv4">ipv4</option>
                  <option key="ipv6">ipv6</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="col-md-3 sm-label-right">AddressType</div>
              <div className="col-md-7">
                <select
                  className="form-control input-sm"
                  value={values.addressType}
                  onChange={() => this.addresstypechange}
                >
                  <option key="internet">internet</option>
                  <option key="intranet">intranet</option>
                </select>
              </div>
            </div>

            {isNew ? (
              <div className="form-group">
              <div className="col-md-3 sm-label-right">ZoneId</div>
              <div className="col-md-7">
                <Select
                  required={true}
                  value={values.masterZoneId}
                  options={zoneIds}
                  onChange={this.changeZoneId}
                />
              </div>
            </div>
            ) : null}

            <div className="form-group">
              <div className="col-md-3 sm-label-right">
                Subnet
              </div>
              <div className="col-md-7">
                <Select
                  disabled={values.addressType === 'internet'}
                  value={values.vSwitchName + '/' + values.vSwitchId}
                  options={vnets}
                  onChange={this.handleSubnetUpdated}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-3 sm-label-right">
              LoadBalancerSpec
              </div>
              <div className="col-md-7">
                <Select
                  value={values.loadBalancerSpec}
                  options={LoadBalancerSpec}
                  onChange={this.handleLoadBalancerSpec}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      </>
    )
  }
}
