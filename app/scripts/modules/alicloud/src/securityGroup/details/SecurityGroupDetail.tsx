import * as React from 'react';
import {
  ReactModal,
  CollapsibleSection,
  AccountTag,
  Spinner,
  ReactInjector,
} from '@spinnaker/core';
import { AlicloudSecurityGroupWriter } from '../securityGroup.write.service';

const $uibModal = require('@uirouter/angularjs').default;

export class AlicloudSecurityDetail extends React.Component {

  public static show(props: any): Promise<any> {
    const modalProps = {};
    return ReactModal.show(AlicloudSecurityDetail, props, modalProps);
  }

  constructor(props: any) {
      super(props)
      this.state = {
          loading: false,
      }
  }

  private editInboundRules = () =>  {
    const { securityGroup, application }: any = this.props;
    $uibModal.open({
      templateUrl: require('../configure/editSecurityGroup.html'),
      controller: 'alicloudEditSecurityGroupCtrl as ctrl',
      size: 'lg',
      resolve: {
        securityGroup: function() {
          return securityGroup;
        },
        application: function() {
          return application;
        },
      },
    });
  }

  private deleteSecurityGroup = (() => {
    const { securityGroup, application }: any  = this.props;
    const taskMonitor = {
      application: application,
      title: 'Deleting ' + securityGroup.name,
    };
    const { confirmationModalService } = ReactInjector;
    const submitMethod = function() {
      securityGroup.type = 'deleteSecurityGroup';
      return (new AlicloudSecurityGroupWriter).deleteSecurityGroup(securityGroup, application, {
        cloudProvider: 'alicloud',
      });
    }

    confirmationModalService.confirm({
      header: 'Really delete ' + securityGroup.name + '?',
      buttonText: 'Delete ' + securityGroup.name,
      provider: 'alicloud',
      account: securityGroup.accountId,
      applicationName: application.name,
      taskMonitorConfig: taskMonitor,
      submitMethod: submitMethod,
    });
  })

  public render() {
    const { securityGroup }: any = this.props;
    const { loading }: any = this.state;
    return (
        <>
          <div className="details-panel">
            <div className="header">
                <div className="close-button">
                  <a className="btn btn-link" ui-sref="^">
                      <span className="glyphicon glyphicon-remove" />
                  </a>
                </div>
                {!loading && (
                  <div className="horizontal center middle">
                      <Spinner size="small" />
                  </div> )}
                {loading && (
                  <>
                    <div className="header-text horizontal middle">
                      <span className="glyphicon glyphicon-transfer" />
                      <h3 className="horizontal middle space-between flex-1">
                          {securityGroup.name || '(not found)'}
                      </h3>
                    </div>
                    <div className="actions">
                      <div className="dropdown">
                        <button type="button" className="btn btn-sm btn-primary dropdown-toggle">
                           Actions <span className="caret"/>
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                              <a onClick={ this.deleteSecurityGroup }>Delete</a>
                          </li>
                          <li>
                            <a onClick={this.editInboundRules}>Edit Inbound Rules</a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
            </div>
            {loading && (
                <div className="content">
                  <CollapsibleSection heading={`FirewallLabel Details`}>
                    <dl className="dl-horizontal dl-medium">
                      <dt>ID</dt>
                      <dd>{securityGroup.id}}</dd>
                      <dt>Account</dt>
                      <dd><AccountTag account={securityGroup.accountName} /></dd>
                      <dt>Region</dt>
                      <dd>{securityGroup.region}</dd>
                      <dt>Description:</dt>
                      <dd>{securityGroup.application}</dd>
                    </dl>
                  </CollapsibleSection>
                  <CollapsibleSection
                    heading={`Security Rules ({securityGroup.inboundRules.length || 0})`}
                    >
                      {!securityGroup.inboundRules.length && (
                        <div>None</div>
                      )}
                      {securityGroup.inboundRules.length && (
                        <>
                          {securityGroup.inboundRules.map((rule: any) => {
                            return (
                              <>
                                <dl className={'dl-horizontal'}>
                                  <dt>sourceCidrIp</dt>
                                  <dd>{rule.permissions.sourceCidrIp}</dd>
                                  <dt>Protocol</dt>
                                  <dd>{rule.permissions.ipProtocol}</dd>
                                  <dt>portRange</dt>
                                  <dd>{rule.permissions.portRange}</dd>
                                  <hr />
                                </dl>
                              </>
                            )
                          })}
                        </>
                      )}
                  </CollapsibleSection>
                </div>
            )}
        </div>
        </>
      )
  }
}
