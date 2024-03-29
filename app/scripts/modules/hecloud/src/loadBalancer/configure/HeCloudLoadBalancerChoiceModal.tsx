import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';

import { ILoadBalancerModalProps, ModalClose, ReactModal, noop } from '@spinnaker/core';

import { IHeCloudLoadBalancerConfig, LoadBalancerTypes } from './LoadBalancerTypes';

export interface IHeCloudLoadBalancerChoiceModalState {
  choices: IHeCloudLoadBalancerConfig[];
  selectedChoice: IHeCloudLoadBalancerConfig;
}

export class HeCloudLoadBalancerChoiceModal extends React.Component<
  ILoadBalancerModalProps,
  IHeCloudLoadBalancerChoiceModalState
> {
  public static defaultProps: Partial<ILoadBalancerModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  public static show(props: ILoadBalancerModalProps): Promise<void> {
    return ReactModal.show(HeCloudLoadBalancerChoiceModal, {
      ...props,
      className: 'create-pipeline-modal-overflow-visible',
    });
  }

  constructor(props: ILoadBalancerModalProps) {
    super(props);
    this.state = {
      choices: LoadBalancerTypes,
      selectedChoice: LoadBalancerTypes[0],
    };
  }

  public choiceSelected(choice: IHeCloudLoadBalancerConfig): void {
    this.setState({ selectedChoice: choice });
  }

  private choose = (): void => {
    const { children, ...loadBalancerProps } = this.props;
    this.close();
    this.state.selectedChoice.component
      .show(loadBalancerProps)
      .then(loadBalancer => {
        this.props.closeModal(loadBalancer);
      })
      .catch(() => {});
  };

  public close = (reason?: any): void => {
    this.props.dismissModal(reason);
  };

  public render() {
    const { choices, selectedChoice } = this.state;

    return (
      <>
        <ModalClose dismiss={this.close} />
        <Modal.Header>
          <Modal.Title>Select Type of Load Balancer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-body">
            <div className="card-choices">
              {choices.map(choice => (
                <div
                  key={choice.type}
                  className={`card ${selectedChoice === choice ? 'active' : ''}`}
                  onClick={() => this.choiceSelected(choice)}
                >
                  <h3 className="load-balancer-label">{choice.label}</h3>
                  <h3>({choice.sublabel})</h3>
                  <div>{choice.description}</div>
                </div>
              ))}
            </div>
            <div className="load-balancer-description" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.choose}>
            Configure Load Balancer <span className="glyphicon glyphicon-chevron-right" />
          </Button>
        </Modal.Footer>
      </>
    );
  }
}
