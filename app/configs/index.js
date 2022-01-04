import {utils} from '@common';

const {storage}=utils;

// const browserRouter=!process.env.isDev;
export const title='ZbxTable';
// const theme='dark';

export const baseUrl='';//'riskWarning';

const beforeRender=input=>{
  const token=storage.get('token');
  if(!token){
    return {path:'/user/login'};
  }
};

export const routerCfg={
  browserRouter:true,
  // title,
  // errorBoundary:false,
  beforeRender,
};

export const themeList=[
  {
    name:'深暗色',
    key:'dark',
  },
  {
    name:'淺亮色',
    key:'light',
  },
  {
    name:'深暗色0',
    key:'dark0',
  },
  {
    name:'深暗色1',
    key:'dark1',
  },
  {
    name:'深暗色2',
    key:'dark2',
  },
  {
    name:'淺亮色1',
    key:'light1',
  },
];

export const color=[
  {
    value:'#ff4d4f',
    key:'danger',
    label:'高風險',
  },

  {
    value:'#fa8c16',
    key:'warning',
    label:'較高風險',
  },

  {
    value:'#faad14',
    key:'alert',
    label:'中風險',
  },

  {
    value:'#1890ff',
    key:'low',
    label:'低風險',
  },
];












































