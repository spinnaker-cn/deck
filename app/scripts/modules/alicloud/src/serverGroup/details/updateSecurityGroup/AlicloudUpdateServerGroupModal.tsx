import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { Subject } from 'rxjs';
import Select from 'react-select';
import {
  ModalClose,
  NgReact,
  ReactInjector,
  ReactModal,
  TaskMonitor,
  API,
  noop,
} from '@spinnaker/core';
import './index.css'

import { AlicloudFooter } from 'alicloud/common/AlicloudFooter';

export class AlicloudUpdateServerGroupModal extends React.Component {
  public static defaultProps: any = {
    closeModal: noop,
    dismissModal: noop,
  };

  public sub$ = new Subject();

  public static show(props: any): Promise<any> {
    const modalProps = {};
    return ReactModal.show(AlicloudUpdateServerGroupModal, props, modalProps);
  }

  constructor(props: any) {
    super(props);
    const { serverGroup, application } = props;
    this.state = {
      isvalid: false,
      securityGroupId: serverGroup.result.scalingConfiguration.securityGroupId,
      securityGroupName: serverGroup.result.scalingConfiguration.securityGroupName,
      serverGroupId: [],
      taskMonitor: new TaskMonitor({
        application: application,
        title: 'UpdateSecurityGroupsFor' + serverGroup.name,
        modalInstance: TaskMonitor.modalInstanceEmulation(() => props.dismissModal()),
        onTaskComplete: () => application.serverGroups.refresh(),
      }),
      platformHealthOnlyShowOverride: application.platformHealthOnlyShowOverride
    };
    this.isValid()
  }

  public componentDidMount = () => {
    const { serverGroup }: any = this.props;
    API.one(`firewalls/${serverGroup.account}?provider=alicloud`)
    .get()
    .then(function(firwalls: any) {
        const val: any[] = [];
        if (Array.isArray(firwalls)) {
          const index: number = Object.keys(firwalls).indexOf(serverGroup.region)
          Object.values(firwalls)[index].forEach((item: any) => {
              if (serverGroup.result.scalingGroup.vpcId) {
                  if (serverGroup.result.scalingGroup.vpcId === item.vpcId) {
                      val.push({ id: item.id, name: item.name })
                  }
              }
          })
        } else {
          const fvalue: any = serverGroup.result.scalingGroup.regionId
          firwalls[fvalue].forEach((item: any) => {
              if (serverGroup.result.scalingGroup.vpcId) {
                  if (serverGroup.result.scalingGroup.vpcId === item.vpcId) {
                      val.push({ id: item.id, name: item.name })
                  }
              }
          })
        }
        const serverGroupIds: any = [];
        val.forEach((item: any) => {
            const aa: any = {};
            aa.value = item.id + '/' + item.name;
            aa.label = item.id + '/' + item.name;
            aa.name = item.name;
            aa.id = item.id;
            serverGroupIds.push(aa);
        })
        this.setState({
            serverGroupId: serverGroupIds,
        })
    }.bind(this))
  }

  private serverGroups: any = this.props;

  private stat = {
    securityGroupId: this.serverGroups.serverGroup.result.scalingConfiguration.securityGroupId,
    securityGroupName: this.serverGroups.serverGroup.result.scalingConfiguration.securityGroupName
  }

  private isValid = () => {
    const { serverGroup }: any = this.props;
    this.sub$.subscribe(() => {
      this.setState({
          isvalid: true
      })
    })
    if (serverGroup.result.scalingConfiguration.securityGroupId === this.stat.securityGroupId) {
      this.setState({
          isvalid: false
      })
    }
  };

  private close = (args?: any): void => {
    const { dismissModal }: any = this.props;
    dismissModal.apply(null, args);
  };

  private submit = (): void => {
    const { serverGroup, application }: any = this.props;
    const { taskMonitor, securityGroupId }: any = this.state

    const securityGroups = [{
      'id': securityGroupId
    }]
    taskMonitor.submit(() => {
      return ReactInjector.serverGroupWriter.updateSecurityGroups(serverGroup, securityGroups, application);
    });
  };

  private handleChange = (value: any) => {
    this.sub$.next(value);
    this.setState({
      securityGroupId: value.id,
      securityGroupName: value.name
    });
    this.stat.securityGroupId = value.id;
    this.stat.securityGroupName = value.name;
    this.isValid()
  };
  public render() {
    const { serverGroup }: any = this.props;
    const { isvalid , serverGroupId, securityGroupName, securityGroupId }: any = this.state;
    const { taskMonitor }: any = this.state;
    const { TaskMonitorWrapper } = NgReact;
    return (
      <div>
        <TaskMonitorWrapper monitor={taskMonitor} />
        <Modal.Header>
            <Modal.Title>{'UpdateSecurityGroupsFor ' + serverGroup.name}</Modal.Title>
        </Modal.Header>
        <ModalClose dismiss={this.close} />
        <Modal.Body>
        <div className="form-group row" style={{ minHeight: '200px' }}>
            <div className="col-md-3 sm-label-right">
              <label className="sm-label-right"> SecurityGroupId </label>
            </div>
            {serverGroupId !== [] ? (
                <div className="col-md-8">
                    <Select
                      value={securityGroupId + '/' + securityGroupName}
                      onChange={this.handleChange}
                      options={serverGroupId}
                    />
                </div>
            ) : (
                <div>no SecurityGroupId toselect!</div>
            )}
        </div>
        </Modal.Body>
        <AlicloudFooter
            onSubmit={this.submit}
            onCancel={this.close}
            isValid={isvalid}
            account={serverGroup.account}
        />
      </div>
    );
  }
}
