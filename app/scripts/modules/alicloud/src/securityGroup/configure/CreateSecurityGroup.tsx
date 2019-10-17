import * as React from 'react';

import {
  Application,
  IModalComponentProps,
  ReactModal,
  TaskMonitor,
  WizardModal,
  WizardPage,
  // ReactInjector,
} from '@spinnaker/core';

import { SecurityGroupLocation } from './SecurityGroupLocation';
import { SecurityGroupIngress } from './SecurityGroupIngress';
import { AlicloudSecurityGroupWriter } from '../securityGroup.write.service';

export interface IAlicloudCloneServerGroupModalProps extends IModalComponentProps {
  title: string;
  application: Application;
  command: any;
}

export interface IAlicloudCloneServerGroupModalState {
  firewallsLabel: string;
  loaded: boolean;
  requiresTemplateSelection: boolean;
  taskMonitor: TaskMonitor;
}

export class CreateSecurityGroup extends React.Component {

  public static show(props: any) {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(CreateSecurityGroup, props, modalProps);
  }

  constructor(props: any) {
    super(props);

    this.state = {
      loaded: false,
      requiresTemplateSelection: false,
      taskMonitor: new TaskMonitor({
        application: props.application,
        title: 'Creating your security group',
        modalInstance: TaskMonitor.modalInstanceEmulation(() => props.dismissModal()),
      }),
    };
  }
  private submit = (command: any): void => {
    const { application }: any = this.props;
    const { taskMonitor }: any = this.state;
    command.type = 'upsertSecurityGroup';
    if (command.region) {
      command.regions = command.region.split(' ');
      delete command.region;
    };
    command.name = application.name + '-' + command.stack + '-' + command.detail;
    command.securityGroupIngress.forEach((item: any, index: number) => {
      item.portRange = item.startPortRange + '/' + item.endPortRange
      item.name = command.name + '-' + 'Rule' + index
      item.priority = 100
    });
    const params: any = {
      cloudProvider: 'alicloud',
      appName: application.name,
      vpcId: command.vpcId.vpcId || null,
      subnet: command.vpcId.vswitchId || null
    };
    taskMonitor.submit(() =>
      (new AlicloudSecurityGroupWriter()).upsertSecurityGroup(command, application, 'Create', params),
    );
  };
  public render() {
    const { application, forPipelineConfig, dismissModal, isNew }: any = this.props;
    const command: any = {
      'securityGroupIngress': [
        {
          ipProtocol: 'tcp',
          sourceCidrIp: '10.0.0.0/8',
          startPortRange: 10,
          endPortRange: 12,
        }
      ]
    }
    const { taskMonitor }: any = this.state;
    let heading = forPipelineConfig ? 'Configure Application ServerGroup' : 'Create New Application ServerGroup';
    if (!isNew) {
      heading = `Edit ${command.name}: ${command.region}: ${command.credentials}`;
    }
    return (
      <WizardModal
        heading={heading}
        initialValues={command}
        dismissModal={dismissModal}
        taskMonitor={taskMonitor}
        closeModal={this.submit}
        submitButtonLabel={forPipelineConfig ? (isNew ? 'Add' : 'Done') : isNew ? 'Create' : 'Update'}
        render={({ formik, nextIdx, wizard }: any) => (
          <>
            <WizardPage
              label="Basic Settings"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }: any) => <SecurityGroupLocation ref={innerRef} formik={formik} app={application} />}
            />
            <WizardPage
              label="LoadBalancers"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }: any) => <SecurityGroupIngress ref={innerRef} formik={formik} app={application} />}
            />
          </>
        )}
      />
    )
  }
}
