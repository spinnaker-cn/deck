import * as React from 'react';
import Select, { Option } from 'react-select';
import { FormikProps } from 'formik';

import { IWizardPageComponent, ReactInjector } from '@spinnaker/core';

import {
  IAmazonServerGroupCommand,
  IEcloudForwardLoadBalancer,
  IEcloudLbListenerMap,
} from '../../serverGroupConfiguration.service';

import { IALBListener } from 'ecloud/domain';
import { any, string } from 'prop-types';

export interface IServerGroupLoadBalancersProps {
  formik: FormikProps<IAmazonServerGroupCommand>;
}
interface IEcloudLocation {
  isL7: boolean;
  domain: string;
  domainList: string[];
  url: string;
  urlList: string[];
  poolList: string[];
  selectedListener: IALBListener;
}
interface IEcloudLocationMap {
  [key: string]: IEcloudLocation;
}
export interface IServerGroupLoadBalancersState {
  refreshing: boolean;
  listenerLocationMap: IEcloudLocationMap;
}

export class ServerGroupLoadBalancers
  extends React.Component<IServerGroupLoadBalancersProps, IServerGroupLoadBalancersState>
  implements IWizardPageComponent<IAmazonServerGroupCommand> {
  public state = {
    refreshing: false,
    listenerLocationMap: {} as IEcloudLocationMap,
    poolList: [],
  };

  public validate(values: IAmazonServerGroupCommand) {
    const errors = {} as any;
    if (values.viewState.dirty.loadBalancers) {
      errors.loadBalancers = 'You must confirm the removed load balancers.';
    }

    if (values.forwardLoadBalancers.length) {
      if (values.forwardLoadBalancers.some(flb => !flb.loadBalancerId)) {
        errors.loadBalancers = 'Load Balancer required.';
      }else if (
        values.forwardLoadBalancers.some(
          flb => !flb.port || !flb.weight || !flb.subnetId || !flb.poolId,
        )
      ) {
        errors.loadBalancers = 'Port 、Weight 、 可用区 、 后端服务器 必填';
      }
    }
    return errors;
  }

  private updateLoadBalancers(): void {
    this.props.formik.setFieldValue('forwardLoadBalancers', this.props.formik.values.forwardLoadBalancers);
  }

  private addLoadBalancer(): void {
    const { values } = this.props.formik;
      values.forwardLoadBalancers.push({
        loadBalancerId: '',
        listenerId: '',
        locationId: '',
        port:null,
        weight:null,
        subnetId:'',
        zone:'',
        poolId:''
      });
      this.updateLoadBalancers();
    
  }

  private removeLoadBalancer(index: number): void {
    this.props.formik.values.forwardLoadBalancers.splice(index, 1);
    this.updateLoadBalancers();
  }

  private loadBalancerChanged(forwardLoadBalancer: IEcloudForwardLoadBalancer, option: any, index: number): void {
    forwardLoadBalancer.loadBalancerId = option.value;
    forwardLoadBalancer.listenerId = '';
    forwardLoadBalancer.locationId = '';
    forwardLoadBalancer.subnetId = '';
    forwardLoadBalancer.zone = '';
    this.updateLoadBalancers();
    this.setState({
      listenerLocationMap: {
        ...this.state.listenerLocationMap,
        [index]: {
          // domain: '',
          // url: '',
          // urlList: this.getUrlList(selectedListener),
          // selectedListener,
          // isL7: this.isL7(selectedListener.protocol),
          poolList: this.getPoolList(forwardLoadBalancer.loadBalancerId),
          subnetId:'',
          zone:'',
          poolId:''
          port:null,
        weight:null,
          // domainList: this.getDomainList(selectedListener),
        },
      },
    });
    // this.refreshLBListenerMap();

  }

  private refreshLBListenerMap = (): void => {
    const { values } = this.props.formik;
    this.setState({ refreshing: true });
    const configurationService: any = ReactInjector.providerServiceDelegate.getDelegate(
      values.cloudProvider || values.selectedProvider,
      'serverGroup.configurationService',
    );
    configurationService.refreshLoadBalancerListenerMap(values).then(() => {
      this.setState({
        refreshing: false,
        listenerLocationMap: {
        },
      });
    });
  };

  // private listenerChanged(forwardLoadBalancer: IEcloudForwardLoadBalancer, listenerId: string, index: number) {
    
  //   forwardLoadBalancer.listenerId = listenerId;
  //   forwardLoadBalancer.locationId = '';
  //   this.updateLoadBalancers();
  //   const selectedListener = this.props.formik.values.backingData.filtered.lbListenerMap[
  //     forwardLoadBalancer.loadBalancerId
  //   ].find(item => item.listenerId === listenerId);
  //   // console.log(selectedListener)
  //   // console.log(this.props.formik.values.backingData.appLoadBalancers.find(item => item.loadBalancerId === forwardLoadBalancer.loadBalancerId))

  //   this.setState({
  //     listenerLocationMap: {
  //       ...this.state.listenerLocationMap,
  //       [index]: {
  //         // domain: '',
  //         url: '',
  //         urlList: this.getUrlList(selectedListener),
  //         selectedListener,
  //         isL7: this.isL7(selectedListener.protocol),
  //         poolList: this.getPoolList(forwardLoadBalancer.loadBalancerId),
  //         subnetId:'',
  //         zone:'',
  //         poolId:''
  //         port:null,
  //       weight:null,
  //         // domainList: this.getDomainList(selectedListener),
  //       },
  //     },
  //   });
  // }

  private portChanged(forwardLoadBalancer: IEcloudForwardLoadBalancer, port: number) {
    forwardLoadBalancer.port = port;
    this.updateLoadBalancers();
  }

  private weightChanged(forwardLoadBalancer: IEcloudForwardLoadBalancer, weight: number) {
    forwardLoadBalancer.weight = weight;
    this.updateLoadBalancers();
  }

  public clearWarnings(key: 'loadBalancers'): void {
    this.props.formik.values.viewState.dirty[key] = null;
    this.props.formik.validateForm();
  }

  private isL7 = (protocol: string): boolean => {
    return protocol === 'HTTP' || protocol === 'HTTPS';
  };

  // private domainChanged = (forwardLoadBalancer: IEcloudForwardLoadBalancer, domain: string, index: number) => {
  //   const { listenerLocationMap } = this.state;
  //   forwardLoadBalancer.locationId = '';
  //   const listenerLocation = listenerLocationMap[index];
  //   this.setState({
  //     listenerLocationMap: {
  //       ...listenerLocationMap,
  //       [index]: {
  //         ...listenerLocation,
  //         domain: domain,
  //         url: '',
  //         urlList: this.getUrlList(listenerLocation.selectedListener),
  //       },
  //     },
  //   });
  // };

  private urlChanged = (forwardLoadBalancer: IEcloudForwardLoadBalancer, url: string, index: number) => {
    const { listenerLocationMap } = this.state;
    const listenerLocation = listenerLocationMap[index];
    const rule = listenerLocation.selectedListener.rules.find(
      r => r.url === url,
    );
    forwardLoadBalancer.locationId = rule.locationId;
    this.updateLoadBalancers();
    this.setState({
      listenerLocationMap: {
        ...listenerLocationMap,
        [index]: {
          ...listenerLocation,
          url,
        },
      },
    });
  };

  // private getDomainList = (selectedListener: IALBListener): string[] => {
  //   return selectedListener.rules && selectedListener.rules.length
  //     ? [...new Set(selectedListener.rules.map(rule => rule.domain))]
  //     : [];
  // };
  private getUrlList = (selectedListener: IALBListener): string[] => {
    return selectedListener.rules && selectedListener.rules.length
      ? [...new Set(selectedListener.rules.map(rule => rule.url))]
      : [];
  };

  private getPoolList = (loadBalancerId: string) => {
    const { values:{backingData} } = this.props.formik;
    if(backingData && backingData.appLoadBalancers && loadBalancerId){
      return backingData.appLoadBalancers.find(item => item.loadBalancerId === loadBalancerId).serverGroups;
    }
    return [];
  };
  // private getUrlList = (selectedListener: IALBListener, domain: string): string[] => {
  //   return selectedListener && selectedListener.rules && selectedListener.rules.length && domain
  //     ? selectedListener.rules.filter(r => r.domain === domain).map(r => r.url)
  //     : [];
  // };

  public componentWillReceiveProps(nextProps: IServerGroupLoadBalancersProps): void {
    const {
      values: {
        forwardLoadBalancers = [],
        backingData: {
          filtered: { lbListenerMap = {} as IEcloudLbListenerMap },
        },
        viewState: { submitButtonLabel },
      },
    } = nextProps.formik;
    if (
      submitButtonLabel !== 'Create' &&
      forwardLoadBalancers.length &&
      forwardLoadBalancers.every(flb => !!flb.loadBalancerId)
    ) {
      this.setState({
        listenerLocationMap: Object.assign(
          {},
          this.state.listenerLocationMap,
          forwardLoadBalancers.reduce((p: IEcloudLocationMap, c, index) => {
            // const listenerList = lbListenerMap[c.loadBalancerId] || [];
            // const selectedListener = listenerList.find(l => l.listenerId === c.listenerId);
            // const rule = selectedListener && selectedListener.rules.find(r => r.locationId === c.locationId);
            // if (selectedListener) {
              p[index] = {
                // domain: (rule && rule.domain) || '',
                // url: (rule && rule.url) || '',
                // isL7: this.isL7(selectedListener.protocol),
                // domainList: this.getDomainList(selectedListener),
                // urlList: this.getUrlList(selectedListener),
                // selectedListener: selectedListener,
                poolList: this.getPoolList(c.loadBalancerId),
                subnetId:'',
                zone:'',
                poolId:''
                port:null,
                weight:null,
              };
            // }
            return p;
          }, {}),
        ),
      });
    }
  }

  public render() {
    const { values } = this.props.formik;
    const { refreshing, listenerLocationMap } = this.state;

    const loadBalancerOptions: Option[] = [];

    (values.backingData.filtered.lbList || []).map(lb => {
      if(lb.vpcId === values.vpcId){
        loadBalancerOptions.push({
          label: `${lb.name}(${lb.id})`,
          subnetId:lb.subnetId,
          value: lb.id,
        })
      }
    });
    const subnetsList = (values.backingData.filtered.subnetsList || []).map(lb => ({
      label: `${lb.name}(${lb.id})`,
      value: lb.id,
      zone:lb.zone
    }));
    const subnetsZoneName = (values.backingData.filtered.subnetsList || []).map(lb => ({
      label: `${lb.zoneName}`,
      value: lb.id,
    }));
    return (
      <div className="container-fluid form-horizontal">
        <div className="form-group">
          {values.forwardLoadBalancers.map((forwardLoadBalancer, index) => (
            <div key={index} className="col-md-12">
              <div className="wizard-pod">
                <div className="wizard-pod-row header">
                  <div className="wizard-pod-row-title">Load Balancer</div>
                  <div className="wizard-pod-row-contents spread">
                    <div className="col-md-10">
                      <Select
                        value={forwardLoadBalancer.loadBalancerId}
                        required={true}
                        clearable={false}
                        options={loadBalancerOptions}
                        onChange={(option: Option<string>) =>{
                          this.loadBalancerChanged(forwardLoadBalancer,option, index)
                        }}
                      />
                    </div>
                    <div className="col-md-2">
                      <a className="sm-label clickable" onClick={() => this.removeLoadBalancer(index)}>
                        <span className="glyphicon glyphicon-trash" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* {forwardLoadBalancer.loadBalancerId ? (
                  <div className="wizard-pod-row">
                    <div className="wizard-pod-row-title">Listener</div>
                    <div className="wizard-pod-row-contents">
                      <div className="wizard-pod-row-data">
                        <div className="col-md-10">
                          {values.backingData.filtered.lbListenerMap[forwardLoadBalancer.loadBalancerId] ? (
                            <Select
                              isLoading={refreshing}
                              value={forwardLoadBalancer.listenerId}
                              required={true}
                              clearable={false}
                              options={values.backingData.filtered.lbListenerMap[
                                forwardLoadBalancer.loadBalancerId
                              ].map(lb => ({ label: `${lb.listenerName}(${lb.listenerId})`, value: lb.listenerId }))}
                              onChange={(option: Option<string>) =>
                                this.listenerChanged(forwardLoadBalancer, option.value, index)
                              }
                            />
                          ) : (
                            'No listeners found in the selected LoadBalancer'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null} */}
                {forwardLoadBalancer.loadBalancerId && listenerLocationMap[index] && listenerLocationMap[index].poolList &&  listenerLocationMap[index].poolList.length? (
                  <div className="wizard-pod-row">
                    <div className="wizard-pod-row-title">后端服务器</div>
                    <div className="wizard-pod-row-contents">
                      <div className="wizard-pod-row-data">
                        <div className="col-md-10">
                          {values.backingData.filtered.lbListenerMap[forwardLoadBalancer.loadBalancerId] ? (
                            <Select
                              isLoading={refreshing}
                              value={forwardLoadBalancer.poolId}
                              required={true}
                              clearable={false}
                              // options={poolList}
                              options={listenerLocationMap[index].poolList.map(lb => ({ label: `${lb.poolName}(${lb.poolId})`, value: lb.poolId }))}
                              onChange={(option: Option<string>) =>{
                                // this.listenerChanged(forwardLoadBalancer, option.value, index)
                                forwardLoadBalancer.poolId = option.value;
                                this.updateLoadBalancers();
                              }}
                            />
                          ) : (
                            'No servers found in the selected LoadBalancer'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {forwardLoadBalancer.loadBalancerId && listenerLocationMap[index] ? (
                  <div className="wizard-pod-row">
                    <div className="wizard-pod-row-title">可用区/子网</div>
                    <div className="wizard-pod-row-contents">
                      <div className="wizard-pod-row-data">
                        <div className="col-md-5">
                            <Select
                              // isLoading={refreshing}
                              value={forwardLoadBalancer.subnetId}
                              required={true}
                              clearable={false}
                              disabled
                              options={subnetsZoneName}
                              // onChange={(option: Option<string>) =>{
                                // this.listenerChanged(forwardLoadBalancer, option.value, index)
                                // forwardLoadBalancer.subnetId = option.value;
                                // this.updateLoadBalancers();

                                // "subnetId":"subnetId",
                                // "zone":"BJJD"


                              // }}
                            />
                        </div>
                        <div className="col-md-5">
                            <Select
                              isLoading={refreshing}
                              value={forwardLoadBalancer.subnetId}
                              // value={forwardLoadBalancer.poolId}
                              required={true}
                              // disabled
                              clearable={false}
                              options={subnetsList}
                              onChange={(option: Option<string>) =>{
                                // console.log(option)
                              //   // this.listenerChanged(forwardLoadBalancer, option.value, index)
                              //   forwardLoadBalancer.poolId = option.value;
                                // this.updateLoadBalancers();
                              forwardLoadBalancer.subnetId = option.value;
                              forwardLoadBalancer.zone= option.zone;

                              this.updateLoadBalancers();
                              }}
                            />
                        </div>
                      </div>
                    </div>
                  </div>
                ): null}
                
                
                {/* {forwardLoadBalancer.listenerId &&
                listenerLocationMap[index] &&
                listenerLocationMap[index].isL7?(
                  <div className="wizard-pod-row">
                    <div className="wizard-pod-row-title">URL</div>
                    <div className="wizard-pod-row-contents">
                      <div className="wizard-pod-row-data">
                        <div className="col-md-10">
                          {listenerLocationMap[index].urlList && listenerLocationMap[index].urlList.length ? (
                            <Select
                              value={listenerLocationMap[index].url}
                              required={true}
                              clearable={false}
                              options={listenerLocationMap[index].urlList.map(d => ({
                                label: d,
                                value: d,
                              }))}
                              onChange={(option: Option<string>) =>
                                this.urlChanged(forwardLoadBalancer, option.value, index)
                              }
                            />
                          ) : (
                            'No url found in the selected URL'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null} */}
                <div className="wizard-pod-row">
                  <div className="wizard-pod-row-title">Target Attributes</div>
                  <div className="wizard-pod-row-contents">
                    <div className="wizard-pod-row-data">
                      <div className="col-md-5">
                        <label>Port </label>
                        <input
                          type="number"
                          className="form-control input-sm inline-number"
                          style={{ width: '80%' }}
                          value={
                            forwardLoadBalancer.port
                          }
                          min={1}
                          max={65535}
                          placeholder="1~65535"
                          onChange={e => this.portChanged(forwardLoadBalancer, parseInt(e.target.value, 10))}
                          required={true}
                        />
                      </div>
                      <div className="col-md-5">
                        <label>Weight </label>
                        <input
                          type="number"
                          className="form-control input-sm inline-number"
                          style={{ width: '70%' }}
                          value={
                            forwardLoadBalancer.weight
                          }
                          min={1}
                          max={100}
                          placeholder="1~100"
                          onChange={e => this.weightChanged(forwardLoadBalancer, parseInt(e.target.value, 10))}
                          required={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loadBalancerOptions.length === 0 ? (
            <div className="form-control-static text-center">
              No load balancers found in the selected account/region/VPC
            </div>
          ) : values.forwardLoadBalancers.length < 20 ? (
            <div className="col-md-12">
              <table className="table table-condensed packed">
                <tbody>
                  <tr>
                    <td>
                      <button type="button" className="add-new col-md-12" onClick={() => this.addLoadBalancer()}>
                        <span className="glyphicon glyphicon-plus-sign" />
                        Add New Load Balancer
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="form-control-static text-center">
              Up to 20 Load Balancers can be added for a server group
            </div>
          )}
        </div>
      </div>
    );
  }
}

