import * as React from 'react';
import { $window } from 'ngimport';

import { IScheduler } from 'core/scheduler/SchedulerFactory';
import { SchedulerFactory } from 'core/scheduler';
import { Tooltip } from 'core/presentation';
import { relativeTime, timestamp } from 'core/utils/timeFormatters';

import './refresher.less';

export interface IRefresherProps {
  refreshing: boolean;
  lastRefresh: number;
  refresh: (e: React.MouseEvent<HTMLElement>) => void;
}

export interface IRefresherState {
  color: string;
  relativeTime: string;
}

export class Refresher extends React.Component<IRefresherProps, IRefresherState> {
  private activeRefresher: IScheduler;
  private yellowAge = 20 * 60 * 1000; // 10 minutes
  private redAge = 30 * 60 * 1000; // 15 minutes

  constructor(props: IRefresherProps) {
    super(props);

    this.state = this.parseState(props);

    // Update the state on an interval to make sure the color and tooltip get updated
    this.activeRefresher = SchedulerFactory.createScheduler(1200000);
    this.activeRefresher.subscribe(() => {
      this.setState(this.parseState(this.props));
    });
  }

  public componentWillReceiveProps(nextProps: IRefresherProps): void {
    if (nextProps.refreshing !== this.props.refreshing || nextProps.lastRefresh !== this.props.lastRefresh) {
      this.setState(this.parseState(nextProps));
    }
  }

  public componentWillUnmount(): void {
    if (this.activeRefresher) {
      this.activeRefresher.unsubscribe();
    }
  }

  private parseState(props: IRefresherProps): IRefresherState {
    const lastRefresh = props.lastRefresh || 0;
    const age = new Date().getTime() - lastRefresh;

    const color = age < this.yellowAge ? 'young' : age < this.redAge ? 'old' : 'ancient';

    return {
      color,
      relativeTime: relativeTime(this.props.lastRefresh),
    };
  }

  public render() {
    const RefresherTooltip = (
      <span>
        {this.props.refreshing && (
          <p>
            Application is <strong>refreshing</strong>.
          </p>
        )}
        {!this.props.refreshing && (
          <p>
            (click <span className="fa fa-sync-alt" /> to refresh)
          </p>
        )}
        <p>
          Last refresh: {timestamp(this.props.lastRefresh)} <br /> ({this.state.relativeTime})
        </p>
        <p className="small">
          <strong>Note:</strong> Due to caching, data may be delayed up to 2 minutes
        </p>
      </span>
    );

    return (
      <Tooltip template={RefresherTooltip} placement={$window.innerWidth < 1100 ? 'right' : 'bottom'}>
        <a className="refresher clickable" onClick={this.props.refresh}>
          <span
            className={`fa fa-xs fa-sync-alt refresh-${this.state.color} ${this.props.refreshing ? 'fa-spin' : ''}`}
          />
        </a>
      </Tooltip>
    );
  }
}
