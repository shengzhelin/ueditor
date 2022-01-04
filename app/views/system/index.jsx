import React,{useEffect,useCallback,useRef} from 'react';
import {getLicense} from '@app/api/api';
import {use} from '@common';
const {useAsync}=use;

import './index.less';

const lists={
  machineid:'本機機器碼',
  appname:'授權應用',
  phone:'授權用戶',
  endtime:'授權到期時間',
};

const Index=props=>{
  const [list,updateList]=useAsync({});
  const update=useCallback(params=>updateList({license:getLicense(params)}),[]);
  useEffect(()=>{
    update();
  },[]);
  const {items={}}=list.license?.data??{};
  return <div className="sys-license">
    <div className="board-card" style={{width:'50%'}}>
      <div className="card-title">
        <div className="title-left"><h4 style={{margin:0}}>授權訊息</h4></div>
        <div className="title-right"><a onClick={()=>update()}>刷新</a></div>
      </div>
      <div className="card-body">
        <div className="board-list">
          {
            Object.keys(lists).map(v=><div className="board-item">
              <div className="item-left">{lists[v]}</div>
              <div className="item-right">{items[v]}</div>
            </div>)
          }
        </div>
      </div>
    </div>
  </div>;
};

export default Index;

















