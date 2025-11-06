<template>
  <div>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="400px"
      :showCancel="false"
      @close="dialogConfig.show = false"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        class="login-register"
        @submit.prevent
      >
        <!--邮箱-->
        <el-form-item prop="email">
          <el-input size="large" placeholder="请输入邮箱" v-model.trim="formData.email">
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>

        <!--登录密码-->
        <el-form-item prop="password" v-if="opType === 1">
          <el-input
            :type="passwordEyeType.passwordEyeOpen ? 'text' : 'password'"
            size="large"
            placeholder="请输入密码"
            v-model.trim="formData.password"
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
            <template #suffix>
              <span
                @click="eyeChange('passwordEyeOpen')"
                :class="[
                  'iconfont',
                  passwordEyeType.passwordEyeOpen ? 'icon-eye' : 'icon-close-eye',
                ]"
              >
              </span>
            </template>
          </el-input>
        </el-form-item>

        <!--注册-->
        <div v-if="opType === 0 || opType === 2">
          <!-- 邮箱验证码 -->
          <el-form-item prop="emailCode">
            <div class="send-emai-panel">
              <el-input
                size="large"
                placeholder="请输入邮箱验证码"
                v-model.trim="formData.emailCode"
              >
                <template #prefix>
                  <span class="iconfont icon-checkcode"></span>
                </template>
              </el-input>
              <el-button
                class="sent-mail-btn"
                type="primary"
                size="large"
                @click="showSendEmainCode"
                >获取验证码</el-button
              >
            </div>

            <el-popover placement="left" :width="450" trigger="click">
              <div>
                <p>1、在垃圾箱中查找邮箱验证码</p>
                <p>2、在邮箱中头像->设置->反垃圾->白名单->设置邮件地址白名单</p>
                <p>3、将邮箱【3312584336@qq.com】添加到白名单不知道怎么设置？</p>
                <a href="" target="_blank" class="a-link">不知道怎么设置？</a>
              </div>
              <template #reference>
                <span class="a-link" style="font-size: 14px">未收到邮箱验证码？</span>
              </template>
            </el-popover>
          </el-form-item>

          <!-- 昵称 -->
          <el-form-item prop="nickName" v-if="opType === 0">
            <el-input
              size="large"
              placeholder="请输入昵称"
              v-model.trim="formData.nickName"
              maxlength="10"
            >
              <template #prefix>
                <span class="iconfont icon-account"></span>
              </template>
            </el-input>
          </el-form-item>

          <!--注册密码-->
          <el-form-item prop="registerPassword">
            <el-input
              :type="passwordEyeType.registerPasswordEyeOpen ? 'text' : 'password'"
              size="large"
              placeholder="请输入密码"
              v-model.trim="formData.registerPassword"
            >
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
              <template #suffix>
                <span
                  @click="eyeChange('registerPasswordEyeOpen')"
                  :class="[
                    'iconfont',
                    passwordEyeType.registerPasswordEyeOpen ? 'icon-eye' : 'icon-close-eye',
                  ]"
                >
                </span>
              </template>
            </el-input>
          </el-form-item>

          <!-- 重复密码 -->
          <el-form-item prop="reRegisterPassword">
            <el-input
              :type="passwordEyeType.reRegisterPasswordEyeOpen ? 'text' : 'password'"
              size="large"
              placeholder="请再次输入密码"
              v-model.trim="formData.reRegisterPassword"
            >
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>

              <template #suffix>
                <span
                  @click="eyeChange('reRegisterPasswordEyeOpen')"
                  :class="[
                    'iconfont',
                    passwordEyeType.reRegisterPasswordEyeOpen ? 'icon-eye' : 'icon-close-eye',
                  ]"
                >
                </span>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <!--验证码-->
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input size="large" placeholder="请输入验证码" v-model.trim="formData.checkCode">
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img :src="checkCodeUrl" class="check-code" @click="changeCheckCode(0)" />
          </div>
        </el-form-item>

        <!-- 记住我 忘记密码 没有账号 -->
        <el-form-item v-if="opType === 1">
          <div class="rememberme-panel">
            <el-checkbox v-model="formData.rememberMe">记住我</el-checkbox>
          </div>
          <div class="no-account">
            <a href="javascript:void(0)" class="a-link" @click="showPanel(2)">忘记密码？</a>
            <a href="javascript:void(0)" class="a-link" @click="showPanel(0)">没有账号？</a>
          </div>
        </el-form-item>

        <!-- 已有账号 -->
        <el-form-item v-if="opType === 0">
          <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">已有账号？</a>
        </el-form-item>

        <!-- 去登录 -->
        <el-form-item v-if="opType === 2">
          <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">去登录?</a>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button type="primary" class="op-btn" @click="doSubmit">
            <span v-if="opType == 0">注册</span>
            <span v-if="opType == 1">登录</span>
            <span v-if="opType == 2">重置密码</span>
          </el-button>
        </el-form-item>
      </el-form>
    </Dialog>
    <!-- 发送邮箱验证码 -->
    <Dialog
      :show="dialogConfigSendMailCode.show"
      :title="dialogConfigSendMailCode.title"
      :buttons="dialogConfigSendMailCode.buttons"
      width="500px"
      :showCancel="false"
      @close="dialogConfigSendMailCode.show = false"
    >
      <el-form
        :model="formDataSendMailCode"
        :rules="rules"
        ref="formDataSendMailCodeRef"
        label-width="80px"
        @submit.prevent
      >
        <el-form-item label="邮箱">
          {{ formData.email }}
        </el-form-item>

        <el-form-item label="验证码" prop="checkCode">
          <!--input输入-->
          <div class="check-code-panel">
            <el-input
              size="large"
              placeholder="请输入验证码"
              v-model.trim="formDataSendMailCode.checkCode"
              @keyup.enter="doSubmit"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img :src="checkCodeUrlSendMailCode" class="check-code" @click="changeCheckCode(1)" />
          </div>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import Message from '../utils/Message'
import { useRouter, useRoute } from 'vue-router'
import md5 from 'js-md5'
import { useAllDataStore } from '@/store/index'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const store = useAllDataStore()

const api = {
  checkCode: '/api/checkCode',
  sendMailCode: '/sendEmailCode',
  register: '/register',
  login: '/login',
  resetPwd: '/resetPwd',
}

//对再次输入密码的校验
const checkRePassWord = (rule, value, callback) => {
  if (value !== formData.value.registerPassword) {
    return callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

//表单基本数据与配置
const formData = ref({})
const formDataRef = ref()
const rules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { max: 150, message: '邮箱长度不能超过150个字符' },
    { validator: proxy.Vertify.email, message: '请输入正确的邮箱' },
  ],
  password: [{ required: true, message: '请输入密码' }],
  emailCode: [{ required: true, message: '请输入邮箱验证码' }],
  nickName: [{ required: true, message: '请输入昵称' }],
  registerPassword: [
    { required: true, message: '请输入密码' },
    { validator: proxy.Vertify.password, message: '请输入8-18位仅由数字字符特殊字符构成的密码' },
  ],
  reRegisterPassword: [
    { required: true, message: '请再次输入密码' },
    { validator: checkRePassWord, message: '两次输入的密码不一致' },
  ],
  checkCode: [{ required: true, message: '请输入图片验证码' }],
}

//用户操作状态
const opType = ref()
//0注册 1登录 2找回密码
const showPanel = (type) => {
  opType.value = type

  dialogConfig.show = true

  resetForm()
}

defineExpose({ showPanel })

const dialogConfig = reactive({
  show: false, // false
  title: '标题',
})

//发送邮箱验证码弹窗
const formDataSendMailCode = ref({})
const formDataSendMailCodeRef = ref()
const dialogConfigSendMailCode = reactive({
  show: false, // false
  title: '发送邮箱验证码',
  buttons: [
    {
      type: 'primary',
      text: '发送验证码',
      click: () => {
        sendEmailCode()
      },
    },
  ],
})
const showSendEmainCode = () => {
  formDataRef.value.validateField('email', (msg) => {
    if (!msg) {
      return
    }
    dialogConfigSendMailCode.show = true

    nextTick(() => {
      changeCheckCode(1)
      formDataSendMailCodeRef.value.resetFields()
      formDataSendMailCode.value = {
        email: formData.value.email,
      }
    })
  })
}
//发送邮件
const sendEmailCode = () => {
  formDataSendMailCodeRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    const params = Object.assign({}, formDataSendMailCode.value)
    params.type = opType.value == 0 ? 0 : 1

    let result = await proxy.Request({
      url: api.sendMailCode,
      params: params,
      errorCallback: () => {
        changeCheckCode(1)
      },
    })

    if (result.status == 'error') {
      return
    } else {
      proxy.Message.success('验证码发送成功，请前往邮箱查收')
      dialogConfigSendMailCode.show = false
    }
  })
}

//验证码
const checkCodeUrl = ref(api.checkCode)
const checkCodeUrlSendMailCode = ref(api.checkCode)
const changeCheckCode = (type) => {
  if (type == 0) {
    checkCodeUrl.value = api.checkCode + '?type=' + type + '&time=' + new Date().getTime()
  } else {
    checkCodeUrlSendMailCode.value =
      api.checkCode + '?type=' + type + '&time=' + new Date().getTime()
  }
}

//控制密码可视化
const passwordEyeType = reactive({
  passwordEyeOpen: false,
  registerPasswordEyeOpen: false,
  reRegisterPasswordEyeOpen: false,
})

const eyeChange = (type) => {
  passwordEyeType[type] = !passwordEyeType[type]
}

//重置表单
const resetForm = () => {
  dialogConfig.show = true
  if (opType.value === 0) dialogConfig.title = '注册'
  else if (opType.value === 1) dialogConfig.title = '登录'
  else if (opType.value === 2) dialogConfig.title = '找回密码'

  nextTick(() => {
    changeCheckCode(0)
    formDataRef.value.resetFields()
    formData.value = {}

    //登录
    if (opType.value === 1) {
      const cookieLoginInfo = proxy.VueCookies.get('loginInfo')
      if (cookieLoginInfo) {
        formData.value = cookieLoginInfo
      }
    }
  })
}

const doSubmit = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = Object.assign({}, formData.value)

    //注册
    if (opType.value === 0 || opType.value === 2) {
      params.password = params.registerPassword
    }

    if (opType.value === 1) {
      let cookieLoginInfo = proxy.VueCookies.get('loginInfo')
      let cookiePassword = cookieLoginInfo ? cookieLoginInfo.password : null
      if (params.password !== cookiePassword) {
        params.password = md5(params.password)
      }
    }

    let url = null
    if (opType.value === 0) url = api.register
    else if (opType.value === 1) url = api.login
    else if (opType.value === 2) {
      url = api.resetPwd
    }

    let result = await proxy.Request({
      url: url,
      params: params,
      errorCallback: () => {
        changeCheckCode(0)
      },
    })

    if (!result) return

    if (opType.value === 0) {
      proxy.Message.success('注册成功，请前往登录')
      showPanel(1)
    } else if (opType.value === 1) {
      if (params.rememberMe) {
        const loginInfo = {
          email: params.email,
          password: params.password,
          rememberMe: params.rememberMe,
        }
        proxy.VueCookies.set('loginInfo', loginInfo, '7d')
      } else proxy.VueCookies.remove('loginInfo')
      dialogConfig.show = false
      proxy.Message.success('登录成功')
      store.updateLoginUserInfo(result.data)
    } else if (opType.value === 2) {
      proxy.Message.success('密码重置成功，请前往登录')
      proxy.VueCookies.remove('loginInfo')
      showPanel(1)
    }
  })
}
</script>

<style lang="scss" scoped>
.login-register {
  //   .el-form-item__content {
  //     width: 100%;
  //   }
  .iconfont {
    &.icon-eye,
    &.icon-close-eye {
      cursor: pointer;
    }
  }

  .send-emai-panel {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .sent-mail-btn {
      margin-left: 10px;
    }
  }

  .rememberme-panel {
    width: 100%;
  }
  .no-account {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .op-btn {
    width: 100%;
  }
}

.check-code-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .check-code {
    margin-left: 5px;
    cursor: pointer;
  }
}
</style>
