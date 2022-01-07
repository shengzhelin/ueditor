import React,{useEffect,useState} from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import {chpwdFn} from '@app/api/api';

import {utils} from '@common';
const {sleep}=utils;

import './index.less';

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const loop=async (fn,handle,delay=2000)=>{
  if(!handle(fn())){
    await sleep(delay);
    loop(fn,handle,delay);
  }
};

const Index=props=>{
  const [form] = Form.useForm();
  useEffect(()=>{
    const getUser=()=>props.store.getState('user');
    /* loop(getUser,result=>{
      if(result?.data){
        form.setFieldsValue({name:result.data.username});
        return true;
      }
    },100); */
    props.store.subscribe('user',result=>{
      if(result?.data){
        form.setFieldsValue({name:result.data.username});
      }
    });
  },[]);
  const onFinish = async values => {
    const {password,confirm,...rest}=values;
    const {code,data,message:msg}=await chpwdFn({
      pwd1:password,
      pwd2:confirm,
      ...rest,
    });
    if(code===200){
      message.success(msg);
    }
  };
  return <div className="sys-chpwd">
    <div className="chpwd-card">
      <Form
        name="chpwd"
        className="login-form"
        onFinish={onFinish}
        form={form}
        {...formItemLayout}
      >
        <Form.Item label="當前用戶" name="name">
          <Input disabled prefix={<UserOutlined className="site-form-item-icon" style={{marginRight:'7px',color:'#999'}} />} placeholder="用戶名" />
        </Form.Item>
        <Form.Item label="原密碼" name="oldpwd" rules={[{required: true,message: '請輸入原密碼!'}]}>
          <Input prefix={<LockOutlined className="site-form-item-icon" style={{marginRight:'7px',color:'#999'}} />} type="password" placeholder="原密碼" />
        </Form.Item>
        <Form.Item label="新密碼" name="password" rules={[{required: true,message: '請輸入新密碼!'}]}>
          <Input prefix={<LockOutlined className="site-form-item-icon" style={{marginRight:'7px',color:'#999'}} />} type="password" placeholder="新密碼" />
        </Form.Item>
        <Form.Item label="確認密碼" name="confirm" rules={[{required: true,message: '請確認密碼!'},
          ({getFieldValue})=>({
            validator(rule,value){
              if(!value||getFieldValue('password')===value){
                return Promise.resolve();
              }
              return Promise.reject('兩次輸入的密碼不一致!');
            },
          }),
        ]}>
          <Input prefix={<LockOutlined className="site-form-item-icon" style={{marginRight:'7px',color:'#999'}} />} type="password" placeholder="確認密碼" />
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" className="login-form-button">確認修改</Button>
          {/* <Button style={{marginLeft:'12px'}} onClick={()=>form.resetFields()}>重置</Button> */}
          <Button style={{marginLeft:'12px'}} onClick={()=>form.setFieldsValue({oldpwd:'',password:'',confirm:''})}>重置</Button>
        </Form.Item>
      </Form>
    </div>
  </div>;
};

export default Index;










