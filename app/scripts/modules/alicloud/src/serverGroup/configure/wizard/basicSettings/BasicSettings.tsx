import * as React from 'react';

import {
  AccountSelectInput,
  RegionSelectField,
  HelpField,
  API,
  AccountService,
  DeploymentStrategySelector
} from '@spinnaker/core';
import {Subject} from 'rxjs';
import Select from 'react-select';

export interface ISubnetOption {
  ref?: any,
  formik?: any,
  app?: any,
  command?: any
}

export class BasicSettings extends React.Component<ISubnetOption, {}> {
  constructor(props: ISubnetOption) {
    super(props)
    const {app}: any = this.props
    this.state = ({
      selectedSubnets: [],
      subs: [],
      zoneIds: [],
      accounts: app.accounts,
      regions: [],
      minSizePattern: true,
      maxSizePattern: true,
      desiredCapacityPattern: true
    })
    this.getAsyncData();
  }

  public sub$ = new Subject();

  private getAsyncData = () => {
    const that = this;
    AccountService.listAccounts('alicloud').then(function (account: any) {
      const nregion: any[] = [];
      const Account: any = [];
      account.forEach((item: any) => {
        Account.push(item.name);
      });
      account[0].regions.forEach((item: any) => {
        nregion.push({name: item});
      });
      that.setState({
        regions: nregion,
        accounts: Account,
      })
      that.updateSubnet()
    });
  };
  private updateSubnet = () => {
    const {formik}: any = this.props;
    const {values}: any = formik;
    const that = this
    API.one('subnets/alicloud').getList().then((vnets: any) => {
      const subnets: any[] = [], subn: any[] = [], zone: any[] = [];
      vnets.forEach((vnet: any) => {
        if (vnet.account === values.credentials && vnet.region === values.region) {
          subnets.push(vnet);
        }
      });
      subnets.forEach((vnet: any) => {
        if (vnet.zoneId === values.masterZoneId) {
          subn.push(vnet)
        }
      });
      let zoneId: any = subnets.map((item) => {
        return item.zoneId
      });
      zoneId = Array.from(new Set(zoneId));
      zoneId.forEach((item: any) => {
        const obj: any = {};
        obj.value = item;
        obj.label = item;
        zone.push(obj)
      })
      that.setState({
        selectedSubnets: subnets,
        subs: subn,
        zoneIds: zone
      })
    });
  };
  private accountUpdated = (account: string): void => {
    // this.sub$.next(account)
    const {formik}: any = this.props
    const {setFieldValue}: any = formik;
    setFieldValue('region', null);
    setFieldValue('masterZoneId', null);
    setFieldValue('credentials', account);
    this.updateSubnet();
  };
  private regionUpdated = (region: string): void => {
    // this.sub$.next(region);
    const {formik}: any = this.props
    const {setFieldValue}: any = formik;
    setFieldValue('region', region);
    setFieldValue('masterZoneId', null);
    setFieldValue('vSwitchId', null);
    this.updateSubnet();
  };
  private stackChanged = (event: any): void => {
    // this.sub$.next(event.target.value)
    const {formik}: any = this.props
    const {setFieldValue}: any = formik;
    setFieldValue('stack', event.target.value);
  };
  private detailChanged = (event: any): void => {
    // this.sub$.next(event.target.value)
    const {formik}: any = this.props
    const {setFieldValue}: any = formik;
    setFieldValue('freeFormDetails', event.target.value);
  };
  private getZoneIds = (event: any): void => {
    // this.sub$.next(event.target.value)
    const {formik}: any = this.props
    const {setFieldValue}: any = formik;
    const {selectedSubnets}: any = this.state;
    const subn: any = [];
    selectedSubnets.forEach((vnet: any) => {
      if (vnet.zoneId === event.value) {
        subn.push(vnet)
      }
    });
    this.setState({
      subs: subn
    })
    setFieldValue('masterZoneId', event.value);
    setFieldValue('vSwitchId', null);
    setFieldValue('vSwitchName', null);
  };
  private selectedSubnetChanged = (event: any): void => {
    // this.sub$.next(event.target.value)
    const {formik}: any = this.props
    const {setFieldValue}: any = formik;
    setFieldValue('vSwitchId', event.vswitchId);
    setFieldValue('vSwitchName', event.vswitchName);
    setFieldValue('vpcId', event.vpcId);
  };
  private getDefaultCoolDown = (event: any): void => {
    // this.sub$.next(event.target.value)
    const {formik}: any = this.props
    const {setFieldValue}: any = formik;
    setFieldValue('defaultCooldown', event.target.value);
  };


    private capacityPattern = () => {
      const {formik}: any = this.props
      console.info("max:"+formik.values.maxSize+"; min:"+formik.values.minSize+"; desired:"+formik.values.desiredCapacity)
        if (formik.values.maxSize && formik.values.minSize && formik.values.maxSize < formik.values.minSize) {
            this.setState({
              minSizePattern: false,
            })
          } else {
          this.setState({
            minSizePattern: true,
          });
        }
        if (formik.values.maxSize
            && formik.values.minSize
            && formik.values.desiredCapacity
            && (formik.values.maxSize < formik.values.desiredCapacity || formik.values.minSize > formik.values.desiredCapacity)) {
            this.setState({
              desiredCapacityPattern: false,
            })
          } else {
            this.setState({
              desiredCapacityPattern: true,
            })
          }
        }

        private useSourceCapacityUpdated = (): void => {
            // this.sub$.next(event.target.value)
            const {formik}: any = this.props
            const {setFieldValue, values}: any = formik;
            values.useSourceCapacity = !values.useSourceCapacity;
            setFieldValue('useSourceCapacity', values.useSourceCapacity);
          };
        public  render(): React.ReactElement{
            const {formik}: any = this.props;
            const {values, setFieldValue}: any = formik;
            const {zoneIds, subs, regions, accounts, minSizePattern, maxSizePattern, desiredCapacityPattern}: any = this.state;
            const subId: any = [];
            subs.forEach((item: any) => {
              item.value = item.vswitchId + '/' + item.vswitchName
              item.label = item.vswitchId + '/' + item.vswitchName
              subId.push(item)
            })
            return (
              <>
                <div className="form-group">
                  <div className="col-md-3 sm-label-right">
                    Account
                  </div>
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
                    <HelpField id="alicloud.serverGroup.stack"/>
                  </div>
                  <div className="col-md-3">
                    <input
                      type="text"
                      className="form-control input-sm"
                      name="stack"
                      value={values.stack || ''}
                      onChange={this.stackChanged}
                    />
                  </div>
                  <div className="col-md-6 form-inline">
                    <div className="col-md-4 sm-label-right">
                      Detail
                      <HelpField id="alicloud.serverGroup.detail"/>
                    </div>
                    <input
                      type="text"
                      className="form-control input-sm"
                      name="details"
                      onChange={this.detailChanged}
                      value={values.freeFormDetails || ''}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="col-md-3 sm-label-right">ZoneId</div>
                  {!values.region && (
                    <h5 className="text-center col-md-7">(please select region)</h5>
                  )}
                  {values.region && (
                    <div className="col-md-7">
                      <Select
                        value={values.masterZoneId}
                        onChange={this.getZoneIds}
                        className="form-control input-sm"
                        options={zoneIds}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <div className="col-md-3 sm-label-right">Subnet</div>
                  {values.masterZoneId === null
                    ? <h5 className="text-center col-md-7">(please select zoneId)</h5>
                    : <div className="col-md-7">
                      <Select
                        value={values.vSwitchId + '/' + values.vSwitchName || ''}
                        onChange={this.selectedSubnetChanged}
                        options={subId}
                        className="form-control input-sm"
                      />
                    </div>
                  }
                </div>
                <div class="form-group">
                  <div class="col-md-12" style="display: flex;flex: 1;flex-direction: row">
                    <div class="col-md-3 sm-label-right" style="align-items:center;">
                      capacity
                    </div>
                    <div class="col-md-3" style="flex: 1;flex-direction: column">
                      <div class="col-md-9 sm-label-right">
                        max
                      </div>
                      <div>
                        <input
                          required={true}
                          type="number"
                          min="0"
                          max="1000"
                          className="form-control input-sm"
                          name="MaxSize"
                          value={values.maxSize || ''}
                          onchange={(e: any) => {
                            this.sub$.next(e.target.value)
                            this.setState({
                              maxSize: e.target.value
                            })
                            this.stat.maxSize = e.target.value;
                            this.capacityPattern();
                            // this.maxSizePatterns(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div class="col-md-3" style="flex: 1;flex-direction: column">
                      <div class="col-md-9 sm-label-right">
                        min
                      </div>
                      <div>
                        <input
                          required={true}
                          min="0"
                          max="1000"
                          type="number"
                          className="form-control input-sm"
                          name="MinSize"
                          value={values.minSize || ''}
                          onchange={(e: any) => {
                            this.sub$.next(e.target.value)
                            this.setState({
                              minSize: e.target.value
                            })
                            this.stat.minSize = e.target.value;
                            // this.minSizePatterns(e.target.value);
                            this.capacityPattern();
                          }}
                        />
                      </div>
                    </div>
                    <div class="col-md-3" style="flex: 1;flex-direction: column">
                      <div class="col-md-9 sm-label-right">
                        desired
                      </div>
                      <div>
                        <input
                          required={true}
                          min="0"
                          max="1000"
                          type="number"
                          className="form-control input-sm"
                          name="DesiredCapacity"
                          value={values.desiredCapacity || ''}
                          onchange={(e: any) => {
                            this.sub$.next(e.target.value)
                            this.setState({
                            desiredCapacity: e.target.value
                          })
                            this.stat.desiredCapacity = e.target.value;
                            // this.desiredCapacityPatterns(e.target.value);
                            this.capacityPattern();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {!minSizePattern && (
                  <div className="form-group row slide-in">
                    <div className="col-sm-9 col-sm-offset-2 error-message">
                      <span>MinSize do not large than MaxSize.</span>
                    </div>
                  </div>
                )}
                {!maxSizePattern && (
                  <div className="form-group row slide-in">
                    <div className="col-sm-9 col-sm-offset-2 error-message">
                      <span>MaxSize do not small than MinSize.</span>
                    </div>
                  </div>
                )}
                {!desiredCapacityPattern && (
                  <div className="form-group row slide-in">
                    <div className="col-sm-9 col-sm-offset-2 error-message">
                      <span>DesiredCapacity must between MinSize and MaxSize.</span>
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <div className="col-md-3 sm-label-right">
                    <label className="sm-label-right"> DefaultCooldown </label>
                  </div>
                  <div className="col-md-3">
                    <input
                      type="number"
                      min="0"
                      max="86400"
                      required={true}
                      className="form-control input-sm"
                      value={values.defaultCooldown || ''}
                      name="DefaultCooldown"
                      onChange={this.getDefaultCoolDown}
                    />
                  </div>
                </div>
                {values.viewState.mode !== 'create' && (
                  <>
                    <DeploymentStrategySelector command={values} onStrategyChange={(e: any) => {
                      setFieldValue('strategy', e.strategy);
                    }}/>
                    <div className="form-group">
                      <div className="col-md-3 sm-label-right">Capacity</div>
                      <div className="col-md-7 radio">
                        <label>
                          <input
                            type="radio"
                            checked={values.useSourceCapacity}
                            onChange={this.useSourceCapacityUpdated}
                            onClick={this.useSourceCapacityUpdated}
                          />
                          Copy the capacity from the current server group
                          <HelpField/>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </>
            )
          }
        }
