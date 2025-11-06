import axios from 'axios';

import { ElLoading } from 'element-plus';
import Message from './Message';

import { useAllDataStore } from '@/store/index'



let loading = null;

const contentTypeForm = 'application/x-www-form-urlencoded;charset=UTF-8';
const contentTypeJson = 'application/json';

const instance = axios.create({
    baseURL: '/api',
    timeout: 10 * 1000,
})

//请求前过滤器
instance.interceptors.request.use(
  (config) => {
    if (config.showLoading) {
      loading = ElLoading.service({
          lock: true,
          text: '加载中......',
          
          background: 'rgba(0, 0, 0, 0.7)'
      });
      
    }
    return config;
    },
  (error) => {
    if (config.showLoading && loading) {
      loading.close();
    }

    Message.error("请求超时!");
    return Promise.reject(error);
  }
)

//请求后过滤器
instance.interceptors.response.use(
  (response) => {
    const { showLoading, errorCallback, showError } = response.config;
    if(showLoading && loading) {
      loading.close();
    }

    const store = useAllDataStore()
    console.log(response)

    const responsedata = response.data;

    if (responsedata.code == 200) {
      return responsedata;
    } else if (responsedata.code == 901) {
      store.updateshowLogin(true);
      store.updateLoginUserInfo(null);
      return Promise.reject({showError:false,msg:"登录超时"})
    }
    else {
      if (errorCallback) {
        errorCallback(responsedata)
      }
      return Promise.reject({showError:true,msg:responsedata.info})
    }

  },
  (error) => {
    if (error.config.showLoading && loading) {
      loading.close();
    }
    return Promise.reject({showError:true,msg:"网络异常!"});
  },
)

const request = async (config) => {

  const store = useAllDataStore()


  const { url, params, dataType, showLoading = true, errorCallback, showError = true } = config;
  
  let contentType = contentTypeForm;

  let formData = new FormData();

  for (let key in params) { 
    formData.append(key,params[key] == undefined ? '' : params[key])
  }

  if (dataType != null && dataType == 'json') {
    contentType = contentTypeJson;
  }

  let headers = {
    'Content-Type': contentType,
    'X-Requested-With': 'XMLHttpRequest'
  }

  return instance.post(url, formData, {
    headers:headers,
    showLoading: showLoading,
    errorCallback: errorCallback,
    showError: showError
  }).catch((error) => { 
    if (error.showError) {
      Message.error(error.msg);
    }
    return null;
  })
}

export default request;