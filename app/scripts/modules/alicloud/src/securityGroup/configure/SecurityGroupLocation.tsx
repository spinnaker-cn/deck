import * as React from 'react';
import { Field } from 'formik';
import Select from 'react-select';

import {
  AccountSelectInput,
  HelpField,
  AccountService,
  RegionSelectField,
  Spinner,
  API,
  ValidationMessage,
} from '@spinnaker/core';
import { Subject } from 'rxjs';

export interface ISubnetOption {
  ref?: any,
  formik?: any,
  app?: any
}
export class SecurityGroupLocation extends React.Component<ISubnetOption, {}> {
    constructor(props: ISubnetOption) {
      super(props);
      const { app }: any = props;
      this.state = {
        accounts: app.accounts,
        availabilityZones: [],
        existingLoadBalancerNames: [],
        hideInternalFlag: false,
        internalFlagToggled: false,
        regions: [],
        Vnets: [],
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
          nregion.push({ name: item });
        });
        that.setState({
          regions: nregion,
        })
        that.setState({
          accounts: Account,
        })
      });
    };

    public getRegions = () => {
      const that = this
      const { formik }: any = this.props;
      const { values } = formik;
      AccountService.getRegionsForAccount(values.credentials).then(function(regions: any) {
        const Region: any = [];
        regions.forEach((item: any) => {
          Region.push({ name: item });
        });
        that.setState({
          regions: Region,
        })
      });
    };

    public updateSubnet = (region: string) => {
      const { formik }: any = this.props;
      const { values } = formik;
      const that = this;
      API.one('subnets/alicloud')
        .getList()
        .then((vnets: any) => {
          const subnets: any[] = [];
          vnets.forEach((vnet: any) => {
            if (vnet.account === values.credentials && vnet.region === region) {
                subnets.push({ value: vnet.vpcName + '/' + vnet.vpcId, name: vnet.vpcName, id: vnet.vpcId, label: vnet.vpcName + '/' + vnet.vpcId })
            }
          });
          that.setState({
            Vnets: subnets,
          })
        });
    }

    private handleSubnetUpdated = (subnetType: any) => {
      const { formik }: any = this.props;
      formik.setFieldValue('vpcId', subnetType.id);
      formik.setFieldValue('vpcName', subnetType.name);
    };

    private accountUpdated = (account: string): void => {
      this.sub$.next(account)
      const { formik }: any = this.props;
      formik.setFieldValue('credentials', account);
    };

    private regionUpdated = (region: string): void => {
      this.sub$.next(region)
      const { formik }: any = this.props;
      formik.setFieldValue('region', region);
      this.updateSubnet(region)
    };

    private stackChanged = (event: React.ChangeEvent<HTMLInputElement>): void => {
      this.sub$.next(event.target.value)
      const { formik }: any = this.props;
      formik.setFieldValue('stack', event.target.value);
    };

    private detailChanged = (event: React.ChangeEvent<HTMLInputElement>): void => {
      this.sub$.next(event.target.value);
      const { formik }: any = this.props;
      formik.setFieldValue('detail', event.target.value);
    };

    private addressIPVersionchange = (event: any): void => {
      const { formik }: any = this.props;
      formik.setFieldValue('description', event.target.value);
    };

  public render() {
    const { formik }: any = this.props;
    const { errors, values }: any = formik;
    const { accounts, regions, Vnets }: any = this.state;
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
            <RegionSelectField
              labelColumns={3}
              component={values}
              field="region"
              account={values.credentials}
              onChange={(evt: any) => this.regionUpdated(evt)}
              regions={regions}
            />
            <div className="form-group">
              <div className="col-md-3 sm-label-right">
                Stack
                <HelpField id="alicloud.loadBalancer.stack" />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className={`form-control input-sm no-spel ${errors.stack} ? 'invalid' : ''`}
                  value={values.stack || ''}
                  name="stack"
                  onChange={this.stackChanged}
                />
              </div>
              <div className="col-md-6 form-inline">
                <label className="sm-label-right">
                  <span>
                    Detail
                  </span>
                </label>
                <input
                  type="text"
                  className={`form-control input-sm no-spel ${errors.detail} ? 'invalid' : ''`}
                  value={values.detail || ''}
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
              <div className="col-md-3 sm-label-right">Description</div>
              <div className="col-md-7">
                <input
                  type="text"
                  className="form-control input-sm"
                  value={values.description || ''}
                  onChange={this.addressIPVersionchange}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-3 sm-label-right">VpcId</div>
              <div className="col-md-7">
                <Select
                  value={ values.vpcName + '/' + values.vpcId }
                  options={Vnets}
                  onChange={this.handleSubnetUpdated}
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
