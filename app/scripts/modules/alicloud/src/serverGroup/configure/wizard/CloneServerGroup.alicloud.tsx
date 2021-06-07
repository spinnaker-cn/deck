import * as React from 'react';

import {
  Application,
  IModalComponentProps,
  ReactModal,
  TaskMonitor,
  WizardModal,
  WizardPage,
  ReactInjector,
} from '@spinnaker/core';

import { AdvancedSettings } from './advancedSettings/AdvancedSettings';
import { BasicSettings } from './basicSettings/BasicSettings';
import { LoadBalancers } from './loadBalancers/LoadBalancers'
import { TagsSelectors } from './tags/TagsSelectors';
import { ServerGroupSecurityId } from './securityGroup/ServerGroupSecurityId';

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

export class CloneServerGroupAlicloud extends React.Component {

  public static show(props: any) {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(CloneServerGroupAlicloud, props, modalProps);
  }

  constructor(props: any) {
    super(props);

    this.state = {
      loaded: false,
      requiresTemplateSelection: false,
      taskMonitor: new TaskMonitor({
        application: props.application,
        title: 'Creating your server group',
        modalInstance: TaskMonitor.modalInstanceEmulation(() => props.dismissModal()),
      }),
    };
  }

  private submit = (values: any): void => {
    const { application, closeModal }: any = this.props;
    values.serverGroupName = application.applicationName + '-' + values.stack + '-' + values.freeFormDetails;
    if (values.scalingConfigurations.spotStrategy !== 'SpotWithPriceLimit') {
        delete values.scalingConfigurations.spotPriceLimits[0]
        delete values.scalingConfigurations.spotPriceLimits
    } else {
      values.scalingConfigurations.spotPriceLimits[0].instanceType = values.scalingConfigurations.instanceType;
    }
    values.capacity = {};
    values.capacity = {
      'max': values.maxSize,
      'min': values.minSize,
      'desired': values.desiredCapacity,
    };
    const { taskMonitor }: any = this.state;
    if ( values.viewState.mode !== 'create' ) {
      const command: any = values
      command.selectedProvider = 'alicloud'
      closeModal && closeModal(command);
    } else {
      taskMonitor.submit(() =>
        ReactInjector.serverGroupWriter.cloneServerGroup(values, application),
      );
    }
  };
  public render() {
    const { command, application, title, forPipelineConfig, dismissModal, isNew }: any = this.props;
    const { taskMonitor }: any = this.state;
    return (
      <WizardModal
        heading={title}
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
              render={({ innerRef }: any) => <BasicSettings ref={innerRef} formik={formik} app={application} />}
            />
            <WizardPage
              label="LoadBalancers"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }: any) => <LoadBalancers ref={innerRef} formik={formik} app={application} />}
            />
            <WizardPage
                label="SecurityGroupSettings"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }: any) => <ServerGroupSecurityId ref={innerRef} formik={formik} app={application} />}
            />
            <WizardPage
                label="Tags Settings"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }: any) => <TagsSelectors ref={innerRef} app={application} formik={formik} />}
            />
            <WizardPage
              label="AdvancedSettings"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }: any) => <AdvancedSettings ref={innerRef} formik={formik} command={command} />}
            />
          </>
        )}
      />
    )
  }
}
