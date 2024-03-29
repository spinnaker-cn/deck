import * as React from 'react';
import { cloneDeep, get } from 'lodash';
import { FormikErrors, FormikValues } from 'formik';
import { IPromise } from 'angular';

import {
  AccountService,
  LoadBalancerWriter,
  FirewallLabels,
  ReactInjector,
  TaskMonitor,
  WizardModal,
  WizardPage,
  ILoadBalancerModalProps,
  noop,
  ReactModal,
} from '@spinnaker/core';

import { HeProviderSettings } from 'hecloud/hecloud.settings';
import { IHeCloudClassicLoadBalancer, IHeCloudClassicLoadBalancerUpsertCommand } from 'hecloud/domain';
import { HeReactInjector } from 'hecloud/reactShims';

import { AdvancedSettings } from './AdvancedSettings';
import { HealthCheck } from './HealthCheck';
import { Listeners } from './Listeners';
import { SecurityGroups } from '../common/SecurityGroups';
import { LoadBalancerLocation } from '../common/LoadBalancerLocation';

import '../common/configure.less';

export interface ICreateClassicLoadBalancerProps extends ILoadBalancerModalProps {
  loadBalancer: IHeCloudClassicLoadBalancer;
}

export interface ICreateClassicLoadBalancerState {
  isNew: boolean;
  loadBalancerCommand: IHeCloudClassicLoadBalancerUpsertCommand;
  taskMonitor: TaskMonitor;
}

export class CreateClassicLoadBalancer extends React.Component<
  ICreateClassicLoadBalancerProps,
  ICreateClassicLoadBalancerState
> {
  public static defaultProps: Partial<ICreateClassicLoadBalancerProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  private _isUnmounted = false;
  private refreshUnsubscribe: () => void;
  private certificateTypes = get(HeProviderSettings, 'loadBalancers.certificateTypes', ['iam', 'acm']);

  public static show(props: ICreateClassicLoadBalancerProps): Promise<IHeCloudClassicLoadBalancerUpsertCommand> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(CreateClassicLoadBalancer, props, modalProps);
  }

  constructor(props: ICreateClassicLoadBalancerProps) {
    super(props);

    const loadBalancerCommand = props.loadBalancer
      ? HeReactInjector.hecloudLoadBalancerTransformer.convertClassicLoadBalancerForEditing(props.loadBalancer)
      : HeReactInjector.hecloudLoadBalancerTransformer.constructNewClassicLoadBalancerTemplate(props.app);

    this.state = {
      isNew: !props.loadBalancer,
      loadBalancerCommand,
      taskMonitor: null,
    };
  }

  protected certificateIdAsARN(
    accountId: string,
    certificateId: string,
    region: string,
    certificateType: string,
  ): string {
    if (
      certificateId &&
      (certificateId.indexOf('arn:hecloud:iam::') !== 0 || certificateId.indexOf('arn:hecloud:acm:') !== 0)
    ) {
      // If they really want to enter the ARN...
      if (certificateType === 'iam') {
        return `arn:hecloud:iam::${accountId}:server-certificate/${certificateId}`;
      }
      if (certificateType === 'acm') {
        return `arn:hecloud:acm:${region}:${accountId}:certificate/${certificateId}`;
      }
    }
    return certificateId;
  }

  protected formatListeners(command: IHeCloudClassicLoadBalancerUpsertCommand): IPromise<void> {
    return AccountService.getAccountDetails(command.credentials).then(account => {
      command.listeners.forEach(listener => {
        listener.sslCertificateId = this.certificateIdAsARN(
          account.accountId,
          listener.sslCertificateName,
          command.region,
          listener.sslCertificateType || this.certificateTypes[0],
        );
      });
    });
  }

  private clearSecurityGroupsIfNotInVpc(loadBalancer: IHeCloudClassicLoadBalancerUpsertCommand): void {
    if (!loadBalancer.vpcId && !loadBalancer.subnetType) {
      loadBalancer.securityGroups = null;
    }
  }

  private addHealthCheckToCommand(loadBalancer: IHeCloudClassicLoadBalancerUpsertCommand): void {
    let healthCheck = null;
    const protocol = loadBalancer.healthCheckProtocol || '';
    if (protocol.startsWith('HTTP')) {
      healthCheck = `${protocol}:${loadBalancer.healthCheckPort}${loadBalancer.healthCheckPath}`;
    } else {
      healthCheck = `${protocol}:${loadBalancer.healthCheckPort}`;
    }
    loadBalancer.healthCheck = healthCheck;
  }

  public setAvailabilityZones(loadBalancerCommand: IHeCloudClassicLoadBalancerUpsertCommand): void {
    const availabilityZones: { [region: string]: string[] } = {};
    availabilityZones[loadBalancerCommand.region] = loadBalancerCommand.regionZones || [];
    loadBalancerCommand.availabilityZones = availabilityZones;
  }

  protected formatCommand(command: IHeCloudClassicLoadBalancerUpsertCommand): void {
    this.setAvailabilityZones(command);
    this.clearSecurityGroupsIfNotInVpc(command);
    this.addHealthCheckToCommand(command);
  }

  protected onApplicationRefresh(values: IHeCloudClassicLoadBalancerUpsertCommand): void {
    if (this._isUnmounted) {
      return;
    }

    this.refreshUnsubscribe = undefined;
    this.props.dismissModal();
    this.setState({ taskMonitor: undefined });
    const newStateParams = {
      name: values.name,
      accountId: values.credentials,
      region: values.region,
      vpcId: values.vpcId,
      provider: 'hecloud',
    };

    if (!ReactInjector.$state.includes('**.loadBalancerDetails')) {
      ReactInjector.$state.go('.loadBalancerDetails', newStateParams);
    } else {
      ReactInjector.$state.go('^.loadBalancerDetails', newStateParams);
    }
  }

  public componentWillUnmount(): void {
    this._isUnmounted = true;
    if (this.refreshUnsubscribe) {
      this.refreshUnsubscribe();
    }
  }

  private onTaskComplete(values: IHeCloudClassicLoadBalancerUpsertCommand): void {
    this.props.app.loadBalancers.refresh();
    this.refreshUnsubscribe = this.props.app.loadBalancers.onNextRefresh(null, () => this.onApplicationRefresh(values));
  }

  private submit = (values: IHeCloudClassicLoadBalancerUpsertCommand): void => {
    const { app, forPipelineConfig, closeModal } = this.props;
    const { isNew } = this.state;

    const descriptor = isNew ? 'Create' : 'Update';
    const loadBalancerCommandFormatted = cloneDeep(values);
    if (forPipelineConfig) {
      // don't submit to backend for creation. Just return the loadBalancerCommand object
      this.formatListeners(loadBalancerCommandFormatted).then(() => {
        closeModal && closeModal(loadBalancerCommandFormatted);
      });
    } else {
      const taskMonitor = new TaskMonitor({
        application: app,
        title: `${isNew ? 'Creating' : 'Updating'} your load balancer`,
        modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
        onTaskComplete: () => this.onTaskComplete(loadBalancerCommandFormatted),
      });

      taskMonitor.submit(() => {
        return this.formatListeners(loadBalancerCommandFormatted).then(() => {
          this.formatCommand(loadBalancerCommandFormatted);
          return LoadBalancerWriter.upsertLoadBalancer(loadBalancerCommandFormatted, app, descriptor);
        });
      });

      this.setState({ taskMonitor });
    }
  };

  private validate = (_values: FormikValues): FormikErrors<IHeCloudClassicLoadBalancerUpsertCommand> => {
    const errors = {} as FormikErrors<IHeCloudClassicLoadBalancerUpsertCommand>;
    return errors;
  };

  public render(): React.ReactElement<CreateClassicLoadBalancer> {
    const { app, dismissModal, forPipelineConfig, loadBalancer } = this.props;
    const { isNew, loadBalancerCommand, taskMonitor } = this.state;

    const showLocationSection = isNew || forPipelineConfig;

    let heading = forPipelineConfig ? 'Configure Classic Load Balancer' : 'Create New Classic Load Balancer';
    if (!isNew) {
      heading = `Edit ${loadBalancerCommand.name}: ${loadBalancerCommand.region}: ${loadBalancerCommand.credentials}`;
    }

    return (
      <WizardModal<IHeCloudClassicLoadBalancerUpsertCommand>
        heading={heading}
        initialValues={loadBalancerCommand}
        taskMonitor={taskMonitor}
        dismissModal={dismissModal}
        closeModal={this.submit}
        submitButtonLabel={forPipelineConfig ? (isNew ? 'Add' : 'Done') : isNew ? 'Create' : 'Update'}
        validate={this.validate}
        render={({ formik, nextIdx, wizard }) => (
          <>
            {showLocationSection && (
              <WizardPage
                label="Location"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => (
                  <LoadBalancerLocation
                    app={app}
                    formik={formik}
                    isNew={isNew}
                    forPipelineConfig={forPipelineConfig}
                    loadBalancer={loadBalancer}
                    ref={innerRef}
                  />
                )}
              />
            )}

            {!!formik.values.vpcId && (
              <WizardPage
                label={FirewallLabels.get('Firewall')}
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef, onLoadingChanged }) => (
                  <SecurityGroups formik={formik} isNew={isNew} onLoadingChanged={onLoadingChanged} ref={innerRef} />
                )}
              />
            )}

            <WizardPage
              label="Listeners"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => <Listeners ref={innerRef} formik={formik} app={app} />}
            />

            <WizardPage
              label="Health Check"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => <HealthCheck ref={innerRef} formik={formik} />}
            />

            <WizardPage
              label="Advanced Settings"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => <AdvancedSettings ref={innerRef} formik={formik} />}
            />
          </>
        )}
      />
    );
  }
}
