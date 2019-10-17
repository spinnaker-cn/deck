'use strict';
import * as React from 'react';
import { API } from '@spinnaker/core';
import { Subject } from 'rxjs'

export interface ISubnetOption {
  laybel?: any,
  command?: any,
  require?: any,
  isimage?: any,
  onChange?: any
}
export class ServerGroupImage extends React.Component<ISubnetOption, {}> {
  constructor(props: ISubnetOption) {
    super(props);
    this.state = {
      ImageId: [],
      loading: true,
      inputRef: React.createRef(),
      isimage: false,
      imageName: props.command.scalingConfiguration ? props.command.scalingConfiguration.imageId : props.command.scalingConfigurations.imageId
    };
  };
  private sub$ = new Subject();

  private setfocus = () => {
    setTimeout(() => {
      this.setState({
        isimage: true,
        searchImages: null
      })
    })
  };

  private changeImage = (images: any, e: any) => {
    const { onChange }: any = this.props
    this.setState({
      isimage: false,
      imageName: images.imageName
    });
    onChange(images.attributes.imageId)
    e = e || e.event;
    e.nativeEvent.stopImmediatePropagation()
    e.stopPropagation()
  };

  private getSearchValue = (e: any) => {
    this.sub$.next(e.target.value)
    this.setState({
      searchImages: e.target.value
    })
    this.getDate(e.target.value);
    e = e || e.event;
    e.nativeEvent.stopImmediatePropagation()
    e.stopPropagation()
  }

  public componentWillReceiveProps () {
    this.setState({
      isimage: false
    })
  };

  private getDate = (newVal: any) => {
    const that = this
    that.setState({
      loading: false
    });
    API.one('images/find?provider=alicloud')
      .withParams({ q: newVal })
      .get()
      .then(function(images: any) {
        that.setState({
          loading: true,
          ImageId: Array.from(new Set(images))
        });
      })
      .catch(() => {
        that.setState({
          loading: true,
          ImageId: []
        });
      })
  }

  public render(): React.ReactElement {
    const { laybel, require }: any = this.props;
    const { imageName, searchImages, isimage, loading, ImageId }: any = this.state;
    return (
      <>
          <div className={'row form-group'} id = "enquiry_contact">
            {
              laybel === 3 ? <label className="col-md-3 sm-label-right" >ImageId</label> : <label className="col-md-4 sm-label-right">ImageId</label>
            }
            {!isimage
              ? <div className="col-md-7">
                {laybel === 3
                ? <input
                  type="text"
                  required = { require }
                  placeholder="select a imageId"
                  className="form-control input-sm imageId"
                  value={imageName || ''}
                  name="search1"
                  readOnly={true}
                  onFocus={() => this.setfocus()}
                />
                : <input
                    type="text"
                    required = { require }
                    placeholder="select a imageId"
                    className="form-control input-sm imageId"
                    value={imageName || ''}
                    name="search1"
                    readOnly={true}
                    onFocus={() => this.setfocus()}
                  />
                }
            </div>
            : <div className="col-md-7" style={{ height: '30px', position: 'relative', zIndex: 3 }} >
                <div
                  contentEditable={true}
                  onClick={(e: any) => this.getSearchValue(e)}
                  style={{ height: '0px' }}
                />
                <input
                  placeholder="search"
                  id="imgId"
                  className="form-control input-sm imagesId"
                  value={searchImages || ''}
                  name="searchn"
                  autoFocus={true}
                  onChange={(e: any) => this.getSearchValue(e)}
                />
                {!loading
                ? (
                  <div className="form-control input-sm">searching...</div>
                )
                : (<>{ImageId === [] || !ImageId
                  ? <div className="form-control input-sm">no imageId</div>
                  : <div style={{maxHeight: '120px', overflowY: 'scroll', border: '1px solid #1d8499', background: '#fff',
                  boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, 0.6)' }}>
                    {ImageId.map((images: any, index: number) => {
                      return(
                        <>
                          <div
                            key={index}
                            style={{ lineHeight: '30px', borderBottom: '1px solid #eee', padding: '0 10px', background: (imageName === images.imageName) ? '#1d8499' : '' }}
                            onClick={(e) => this.changeImage(images, e)}
                          >{images.imageName}</div>
                        </>
                      )
                    })}
                  </div>
                  }</>)
                }
            </div>}
          </div>
      </>
    )
  }
}

