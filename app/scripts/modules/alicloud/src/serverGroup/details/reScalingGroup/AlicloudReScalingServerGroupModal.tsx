import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { Subject } from 'rxjs';
import {
  ModalClose,
  NgReact,
  ReactModal,
  TaskMonitor,
  noop,
} from '@spinnaker/core';

import { AlicloudFooter } from 'alicloud/common/AlicloudFooter';
import { AlicloudServerGroupTransformer } from '../../serverGroup.transformer';
import { ServerGroupWriters } from '../serverGroupWirter';

export class AlicloudReScalingServerGroupModal extends React.Component {
  public static defaultProps: any = {
    closeModal: noop,
    dismissModal: noop,
  };

  public static sub$ = new Subject();

  public static show(props: any): Promise<any> {
    const modalProps = {};
    return ReactModal.show(AlicloudReScalingServerGroupModal, props, modalProps);
  }

  constructor(props: any) {
    super(props);
    const { serverGroup, application, dismissModal } = props
    this.state = {
      initialValues: {
        defaultCooldown: serverGroup.result.scalingGroup.defaultCooldown,
      },
      isvalid: false,
      taskMonitor: new TaskMonitor({
        application: application,
        title: 'edit ' + serverGroup.name,
        modalInstance: TaskMonitor.modalInstanceEmulation(() => dismissModal)
      }),
      platformHealthOnlyShowOverride: application.platformHealthOnlyShowOverride
    };
    this.isValid()
  }
  private serverGroups: any = this.props;

  private stat = {
    initialValues: {
      defaultCooldown: this.serverGroups.serverGroup.result.scalingGroup.defaultCooldown,
    }
  }

  private isValid = () => {
    const { serverGroup }: any = this.props;
    if (serverGroup.result.scalingGroup.defaultCooldown !== this.stat.initialValues.defaultCooldown) {
      this.setState({
        isvalid: true
      })
    } else {
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
    const { taskMonitor, initialValues }: any = this.state;
    serverGroup.result.scalingGroup.defaultCooldown = initialValues.defaultCooldown

   taskMonitor.submit(() => {
     const serverGroupWriters: any = new ServerGroupWriters(AlicloudServerGroupTransformer);
      return serverGroupWriters.editServerGroups(serverGroup, application);
    });
  };
  public render() {
    const { serverGroup }: any = this.props;
    const { initialValues, taskMonitor, isvalid }: any = this.state;
    const { TaskMonitorWrapper } = NgReact;
    return (
      <div>
        <TaskMonitorWrapper monitor={taskMonitor} />
        <Modal.Header>
            <Modal.Title>{'Edit ' + serverGroup.name}</Modal.Title>
        </Modal.Header>
        <ModalClose dismiss={this.close} />
        <Modal.Body>
            <form role="form">
                <div className="modal-body confirmation-modal">
                    <div className="form-group row">
                        <div className="col-md-3 sm-label-right">
                        <label className="sm-label-right"> DefaultCooldown </label>
                        </div>
                        <div className="col-md-3">
                            <input
                                type="number"
                                min="0"
                                max="86400"
                                required={ true }
                                className="form-control input-sm"
                                value={initialValues.defaultCooldown}
                                name="DefaultCooldown"
                                onChange={(e: any) => {
                                  this.setState({
                                    initialValues: {
                                      defaultCooldown: e.target.value
                                    }
                                  })
                                  this.stat.initialValues.defaultCooldown = e.target.value;
                                  this.isValid()
                                }}
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
