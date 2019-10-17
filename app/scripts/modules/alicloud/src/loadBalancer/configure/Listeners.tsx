import * as React from 'react';
import { FormikProps } from 'formik';
import { Application } from '@spinnaker/core';
import './Listeners.less';

export interface IListenersProps {
  formik: FormikProps<any>;
  app: Application;
}

export class ALBListeners extends React.Component<IListenersProps> {
  public protocols = ['HTTP', 'HTTPS', 'TCP'];
  public secureProtocols = ['HTTPS', 'SSL'];

  public state: any = {
    certificates: [],
  };
  constructor(props: any) {
    super(props)
    this.state = ({
      valid: false,
      valids: false,
    })
  }
  public componentDidMount(): void {
    this.loadCertificates();
  }

  private loadCertificates(): void {
    const certificates: any = 'account';
    this.setState({ certificates });
  }

  private updateListeners(): void {
    const { values, setFieldValue } = this.props.formik;
    setFieldValue('listeners', values.listeners);
  }

  private listenerPortChanged(
    listener: any,
    newProtocol: any,
  ): void {
    const { setFieldValue } = this.props.formik;
    if (newProtocol === 'TCP') {
      setFieldValue('listeners.healthCheck', 'on');
      setFieldValue('listeners.healthCheckURI', null);
      setFieldValue('listeners.stickySession', null);
      setFieldValue('listeners.cookie', null);
      setFieldValue('listeners.cookieTimeout', null);
      setFieldValue('listeners.gzip', null);
      setFieldValue('listeners.stickySessionType', null);
      setFieldValue('listeners.requestTimeout', null);
      setFieldValue('listeners.idleTimeout', null);
      setFieldValue('listeners.ServerCertificateId', null);
      setFieldValue('listeners.healthCheck', null);
    } else {
      if (newProtocol === 'HTTPS') {
      } else {
        listener.ServerCertificateId = null;
        setFieldValue('listeners.ServerCertificateId', null);
      }
    }
    setFieldValue('listeners.listenerProtocal', newProtocol);
    this.updateListeners();
  }

  private listenerBandWidthChanged(listener: any, newPort: string): void {
    listener.bandwidth = Number.parseInt(newPort, 10);
    this.updateListeners();
  }

  private listenerExternalPortChanged(listener: any, newPort: string): void {
    listener.backendServerPort = Number.parseInt(newPort, 10);
    this.updateListeners();
  }

  private listenerInternalPortChanged(listener: any, newPort: string): void {
    listener.listenerPort = Number.parseInt(newPort, 10);
    this.updateListeners();
  }

  private healthChange(listener: any, newPort: string): void {
    const { setFieldValue } = this.props.formik;
    if (newPort !== 'on') {
      setFieldValue('listeners.healthCheckInterval', null);
      setFieldValue('listeners.healthCheckURI', null);
      setFieldValue('listeners.unhealthyThreshold', null);
      setFieldValue('listeners.healthyThreshold', null);
      setFieldValue('listeners.healthCheckTimeout', null);
      setFieldValue('listeners.stickySession', null);
      setFieldValue('listeners.cookie', null);
      setFieldValue('listeners.cookieTimeout', null);
      setFieldValue('listeners.gzip', null);
      setFieldValue('listeners.stickySessionType', null);
      setFieldValue('listeners.requestTimeout', null);
      setFieldValue('listeners.idleTimeout', null);
      setFieldValue('listeners.healthCheckHttpCode', null);
      setFieldValue('listeners.scheduler', null);
    }
    listener.healthCheck = newPort;
    setFieldValue('listeners.healthCheck', newPort);
    this.updateListeners();
  }

  private listenerhealthCheckURIChanged(listener: any, newPort: string): void {
    const a = /\/(.*?\.html)?$/;
    if (a.test(newPort)) {
      this.setState({ valid: false });
    } else {
      this.setState({ valid: true });
    }
    listener.healthCheckURI = newPort;
    this.updateListeners();
  }

  private listenerhealthCheckIntervalChanged(listener: any, newPort: string): void {
    listener.healthCheckInterval = Number.parseInt(newPort, 10);
    this.updateListeners();
  }

  private listenerunhealthyThresholdChanged(listener: any, newPort: string): void {
    listener.unhealthyThreshold = Number.parseInt(newPort, 10);
    this.updateListeners();
  }

  private listenerhealthyThresholdChanged(listener: any, newPort: string): void {
    listener.healthyThreshold = Number.parseInt(newPort, 10);
    this.updateListeners();
  }

  private listenerhealthCheckTimeoutChanged(listener: any, newPort: string): void {
    listener.healthCheckTimeout = Number.parseInt(newPort, 10);
    this.updateListeners();
  }

  private stickySessionChange(listener: any, newPort: string): void {
    const { setFieldValue }: any = this.props.formik
    if (newPort === 'off') {
      listener.stickySessionType = '';
      listener.cookie = '';
      listener.cookieTimeout = '';
      setFieldValue('listeners.stickySessionType', '');
      setFieldValue('listeners.cookie', '');
      setFieldValue('listeners.cookieTimeout', '');
    }
    listener.stickySession = newPort;
    this.updateListeners();
  }

  private listenerCookieChanged(listener: any, newPort: string): void {
    const a = /^(?=[^,; ]+$)[^\$][\x00-\x7f]{1,200}/;
    if (a.test(newPort)) {
      this.setState({ valids: false });
    } else {
      this.setState({ valids: true });
    }
    listener.cookie = newPort;
    this.updateListeners();
  }

  private listenerCookieTimeoutChanged(listener: any, newPort: string): void {
    listener.cookieTimeout = Number.parseInt(newPort, 10);
    this.updateListeners();
  }

  private Gzipchange(listener: any, newPort: string): void {
    listener.gzip = newPort;
    this.updateListeners();
  }

  private HealthCheckHttpCodechange(listener: any, newPort: string): void {
    if (newPort !== '') {
      const portArr: any = listener.healthCheckHttpCode.split(',')
      if (newPort === portArr[ portArr.length - 1 ]) {
        return
      } else {
        listener.healthCheckHttpCode = listener.healthCheckHttpCode + ',' + (newPort)
      }
    } else {
      listener.healthCheckHttpCode = ''
    }
    this.updateListeners();
  }

  private idleTimeoutChanged(listener: any, newPort: string): void {
    listener.idleTimeout = Number.parseInt(newPort, 10);
    this.updateListeners();
  }

  private StickySessionTypechange(listener: any, newPort: string): void {
    listener.stickySessionType = newPort;
    this.updateListeners();
  }

  private listenerRequestTimeoutChanged(listener: any, newPort: string): void {
    listener.requestTimeout = Number.parseInt(newPort, 10);
    this.updateListeners();
  }

  private Schedulerchange(listener: any, newPort: string): void {
    listener.scheduler = newPort;
    this.updateListeners();
  }

  private listenerServerCertificateChanged(listener: any, newPort: string): void {
    listener.ServerCertificateId = newPort;
    this.updateListeners();
  }

  private removeListener(index: number): void {
    this.props.formik.values.listeners.splice(index, 1);
    this.updateListeners();
  }

  private addListener = (): void => {
    this.props.formik.values.listeners.push({
      listenerProtocal: 'HTTP',
      listenerPort: 80,
      backendServerPort: 80,
    });
    this.updateListeners();
  };

  public render() {
    const { values } = this.props.formik;
    const { valid, valids }: any = this.state

    return (
      <div className="container-fluid form-horizontal create-classic-load-balancer-wizard-listeners">
        <div className="form-group">
          <div className="col-md-12">
          {values.listeners.map((listener: any, index: number) => (
            <table className="table table-condensed packed">
              <thead>
                <tr>
                  <th>ListenerType</th>
                  <th>External Port</th>
                  <th/>
                  <th>Internal Port</th>
                  <th>Bandwidth</th>
                  <th>HealthCheck</th>
                  <th>
                    <a className="sm-label clickable" onClick={() => this.removeListener(index)}>
                      <span className="glyphicon glyphicon-trash" />
                    </a>
                  </th>
                </tr>
              </thead>
              <tbody>
                  <React.Fragment key={index}>
                    <tr key={index + '-main'}>
                      <td>
                        <select
                          className="form-control input-sm"
                          value={listener.listenerProtocal}
                          onChange={event =>
                            this.listenerPortChanged(listener, event.target
                              .value)
                          }
                        >
                          {this.protocols.map(p => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="form-control input-sm"
                          type="number"
                          min="0"
                          max="65535"
                          value={listener.listenerPort}
                          onChange={event => this.listenerInternalPortChanged(listener, event.target.value)}
                          required={true}
                        />
                      </td>
                      <td className="small" style={{ paddingTop: '10px' }}>
                        &rarr;
                      </td>
                      <td>
                        <input
                          className="form-control input-sm"
                          type="number"
                          min="0"
                          max="65535"
                          value={listener.backendServerPort}
                          onChange={event => this.listenerExternalPortChanged(listener, event.target.value)}
                          required={true}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control input-sm"
                          type="number"
                          max="5120"
                          value={listener.bandwidth}
                          onChange={event => this.listenerBandWidthChanged(listener, event.target.value)}
                          required={true}
                        />
                      </td>
                      <td>
                        <select
                          className="form-control input-sm"
                          value={listener.healthCheck}
                          disabled={listener.listenerProtocal === 'TCP'}
                          required={listener.listenerProtocal !== 'TCP'}
                          onChange={event =>
                            this.healthChange(listener, event.target
                              .value)
                          }
                        >
                          <option key={'on'}>on</option>
                          <option key={'off'}>off</option>
                        </select>
                      </td>
                      <td/>
                    </tr>
                    <tr>
                      <th>HealthCheckURI</th>
                      <td colSpan={3}>
                        <input
                          className="form-control input-sm formuri"
                          required = {listener.healthCheck === 'on'}
                          disabled={listener.healthCheck === 'off' || listener.listenerProtocal === 'TCP'}
                          type="text"
                          onChange={event => this.listenerhealthCheckURIChanged(listener, event.target.value)}
                          value={listener.healthCheckURI}
                        />
                        { valid && <span className="error" style={{ color: 'red' }}>Enter the content in the correct format</span> }
                      </td>
                      <th>Interval</th>
                      <td colSpan={2}>
                        <div className="">
                          <input
                            className="form-control input-sm forminterval"
                            disabled={listener.healthCheck === 'off'}
                            type="number"
                            min="1"
                            max="50"
                            value={listener.healthCheckInterval}
                            onChange={event => this.listenerhealthCheckIntervalChanged(listener, event.target.value)}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>Unhealthy Threshold</th>
                      <td colSpan={2}>
                        <div className="">
                          <input
                            className="form-control input-sm formunthreshold"
                            disabled={listener.healthCheck === 'off'}
                            type="number"
                            min="2"
                            max="10"
                            onChange={event => this.listenerunhealthyThresholdChanged(listener, event.target.value)}
                            value={listener.unhealthyThreshold}
                          />
                        </div>
                      </td>
                      <td/>
                      <th>HealthyThreshold</th>
                      <td colSpan={2}>
                        <div className="">
                          <input
                            className="form-control input-sm formthreshold"
                            disabled={listener.healthCheck === 'off'}
                            type="number"
                            min="2"
                            max="10"
                            onChange={event => this.listenerhealthyThresholdChanged(listener, event.target.value)}
                            value={listener.healthyThreshold}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>HealthCheckTimeout</th>
                      <td colSpan={2}>
                        <div className="">
                          <input
                            className="form-control input-sm formchecktime"
                            disabled={listener.healthCheck === 'off'}
                            type="number"
                            min="1"
                            max="300"
                            value={listener.healthCheckTimeout}
                            onChange={event => this.listenerhealthCheckTimeoutChanged(listener, event.target.value)}
                          />
                        </div>
                      </td>
                      <td />
                      <th>StickySession</th>
                      <td colSpan={2}>
                        <div className="">
                          <select
                            required={listener.listenerProtocal !== 'TCP' && listener.healthCheck !== 'off'}
                            disabled={listener.listenerProtocal === 'TCP' || listener.healthCheck === 'off'}
                            className="form-control input-sm formSticksession"
                            value={listener.stickySession}
                            onChange={event => this.stickySessionChange(listener, event.target
                              .value)}
                          >
                          {['on', 'off'].map( p => (
                            <option key={p}>{p}</option>
                          ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>Cookie</th>
                      <td colSpan={3}>
                        <div className="">
                          <input
                            className="form-control input-sm"
                            type="text"
                            disabled={listener.listenerProtocal === 'TCP' || listener.stickySession === 'off' || listener.healthCheck ===  'off'}
                            required={listener.stickySession === 'on' && listener.stickySessionType === 'server' && listener.listenerProtocal !== 'TCP'}
                            value={listener.cookie}
                            onChange={event => this.listenerCookieChanged(listener, event.target.value)}
                          />
                          {valids && <span className="error" style={{ color: 'red' }}>Enter the content in the correct format</span>}
                        </div>
                      </td>
                      <th>CookieTimeout</th>
                      <td>
                        <div className="">
                          <input
                            className="form-control input-sm"
                            disabled={listener.stickySession === 'off' || listener.healthCheck === 'off' || listener.listenerProtocal === 'TCP'}
                            type="number"
                            min="1"
                            max="86400"
                            value={listener.cookieTimeout}
                            onChange={event => this.listenerCookieTimeoutChanged(listener, event.target.value)}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>Gzip</th>
                      <td colSpan={2}>
                        <select
                          className="form-control input-sm"
                          value={listener.gzip}
                          disabled={listener.healthCheck === 'off' || listener.listenerProtocal === 'TCP'}
                          required={listener.stickySession === 'on' && listener.stickySessionType === 'insert' && listener.listenerProtocal !== 'TCP'}
                          onChange={event => this.Gzipchange(listener, event.target
                            .value)}
                        >
                          {['on', 'off'].map( p => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </td>
                      <th>HealthCheckHttpCode</th>
                      <td colSpan={3}>
                        {listener.healthCheckHttpCode}
                        <select
                          className="form-control input-sm"
                          disabled={listener.healthCheck === 'off'}
                          value={listener.healthCheckHttpCode}
                          onChange={event => this.HealthCheckHttpCodechange(listener, event.target.value)}
                        >
                          {['', 'http_2xx', 'http_3xx', 'http_4xx', 'http_5xx'].map( p => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <th>IdleTimeout</th>
                      <td colSpan={2}>
                        <div>
                          <input
                            className="form-control input-sm"
                            disabled={listener.healthCheck === 'off' || listener.listenerProtocal === 'TCP'}
                            type="number"
                            min="1"
                            max="60"
                            value={listener.idleTimeout}
                            onChange={event => this.idleTimeoutChanged(listener, event.target.value)}
                          />
                        </div>
                      </td>
                      <th>StickySessionType</th>
                      <td colSpan={3}>
                        <select
                          className="form-control input-sm"
                          required={listener.stickySession === 'on'}
                          disabled={listener.stickySession === 'off' || listener.listenerProtocal === 'TCP' || listener.healthCheck === 'off'}
                          value={listener.stickySessionType}
                          onChange={e => this.StickySessionTypechange(listener, e.target.value)}
                        >
                          {['insert', 'server'].map( p => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <th>RequestTimeout</th>
                      <td colSpan={3}>
                        <div className="">
                          <input
                            className="form-control input-sm"
                            disabled={listener.healthCheck === 'off' || listener.listenerProtocal === 'TCP'}
                            type="number"
                            min="1"
                            max="180"
                            value={listener.requestTimeout}
                            onChange={event => this.listenerRequestTimeoutChanged(listener, event.target.value)}
                          />
                        </div>
                      </td>
                      <th>Scheduler</th>
                      <td colSpan={2}>
                        <div>
                          <select
                            className="form-control input-sm"
                            value={listener.scheduler}
                            onChange={e => this.Schedulerchange(listener, e.target.value)}
                            disabled={listener.healthCheck === 'off'}
                          >
                            {['wrr', 'wlc', 'rr'].map( p => (
                              <option key={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>ServerCertificateId</th>
                      <td colSpan={6}>
                        <input
                          className="form-control input-sm"
                          type="text"
                          disabled={listener.listenerProtocal !== 'HTTPS'}
                          value={listener.ServerCertificateId}
                          onChange={event => this.listenerServerCertificateChanged(listener, event.target.value)}
                          />
                      </td>
                    </tr>
                  </React.Fragment>
              </tbody>
              <tfoot>
                <tr />
              </tfoot>
            </table>
            ))}
          </div>
          <div className="col-md-12">
            <button className="add-new col-md-12" onClick={this.addListener} type="button">
              <span className="glyphicon glyphicon-plus-sign" />
              <span> Add new port mapping</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
