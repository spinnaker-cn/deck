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
  noop,
} from '@spinnaker/core';

import { AlicloudFooter } from 'alicloud/common/AlicloudFooter';

export class AlicloudRollbackServerGroupModal extends React.Component {
  public static defaultProps: any = {
    closeModal: noop,
    dismissModal: noop,
  };

  public sub$ = new Subject();

  public static show(props: any): Promise<any> {
    const modalProps = {};
    return ReactModal.show(AlicloudRollbackServerGroupModal, props, modalProps);
  }

  constructor(props: any) {
    super(props);
    const { serverGroup, application, dismissModal } = props;
    let healthyPercent = 100;
      if (serverGroup.capacity.min < 10) {
        healthyPercent = 100;
      } else if (serverGroup.capacity.min  < 20) {
        healthyPercent = 90;
      } else {
        healthyPercent = 95;
      }
    this.state = {
      isvalid: false,
      selectedOption: serverGroup.name,
      rollbackType: 'EXPLICIT',
      rollbackContext: {
        rollbackServerGroupName: serverGroup.name,
        enableAndDisableOnly: false,
        targetHealthyRollbackPercentage: healthyPercent,
        delayBeforeDisableSeconds: 0,
      },
      taskMonitor: new TaskMonitor({
        application: application,
        title: 'Resizing' + serverGroup.name,
        modalInstance: TaskMonitor.modalInstanceEmulation(() => dismissModal),
        onTaskComplete: () => application.serverGroups.refresh(),
      }),
      platformHealthOnlyShowOverride: application.platformHealthOnlyShowOverride
    };
    this.isValid()
  }

  private serverGroups: any = this.props;

  private stat = {
    selectedOption: this.serverGroups.serverGroup.name
  }

  private isValid = () => {
    const { serverGroup }: any = this.props;
    this.sub$.subscribe(() => {
        this.setState({
            isvalid: true
        })
    })
    if (serverGroup.name === this.stat.selectedOption) {
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
    const { serverGroup, application, disabledServerGroups }: any = this.props;
    const { taskMonitor }: any = this.state;
    const restoreServerGroup: any = disabledServerGroups.find(function(disabledServerGroup: any) {
        return disabledServerGroup.name === this.state.rollbackContext.restoreServerGroupName;
    });
    taskMonitor.submit(() => {
      return ReactInjector.serverGroupWriter.rollbackServerGroup(serverGroup, application, {
        interestingHealthProviderNames: [],
        targetSize: restoreServerGroup.capacity.max,
      });
    });
  };

  private handleChange = (value: any) => {
    this.sub$.next(value);
    this.setState({ selectedOption: value });
    this.stat.selectedOption = value;
    this.isValid()
  };
  public render() {
    const { serverGroup, disabledServerGroups }: any = this.props;
    const { selectedOption, isvalid }: any = this.state;
    const a: any = disabledServerGroups
        .sort((aa: any, b: any) => b.name.localeCompare(aa.name));
        a.forEach((item: any) => {
            item.value = item.name;
            item.label = item.name;
        })
    const { taskMonitor }: any = this.state;
    const { TaskMonitorWrapper } = NgReact;
    return (
      <div>
        <TaskMonitorWrapper monitor={taskMonitor} />
        <Modal.Header>
            <Modal.Title>{'Rollback ' + serverGroup.name}</Modal.Title>
        </Modal.Header>
        <ModalClose dismiss={this.close} />
        <Modal.Body>
        <form role="form">
            <div className="modal-body confirmation-modal">
                <div className="row">
                    <div className="col-sm-3 sm-label-right">
                    Restore to
                    </div>
                    <div className="col-sm-6">
                        <Select
                            value={selectedOption}
                            onChange={this.handleChange}
                            options={a}
                        />
                    </div>
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
    );
  }
}
