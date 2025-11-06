<template>
  <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="450px"
    :showCancel="false"
    @close="dialogConfig.show = false"
  >
    <el-form :model="formData" ref="formDataRef" label-width="40px" @submit.prevent>
      <el-form-item label="昵称" prop="nickName">
        {{ formData.nickName }}
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <CoverUpload
          :imageUrlPrefix="proxy.globalInfo.avatarUrl"
          v-model="formData.avatar"
        ></CoverUpload>
      </el-form-item>

      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio :label="0">女</el-radio>
          <el-radio :label="1">男</el-radio>
        </el-radio-group>
      </el-form-item>

      <!--textarea输入-->
      <el-form-item label="简介" prop="desc">
        <el-input
          clearable
          placeholder="请输入简介"
          type="textarea"
          :rows="5"
          :maxlength="100"
          resize="none"
          show-word-limit
          v-model="formData.personDescription"
        ></el-input>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script setup>
import { ref, getCurrentInstance, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const {proxy} = getCurrentInstance()
const api = {
  updataUserInfo: "/ucenter/updateUserInfo"
}


const dialogConfig = ref({
  show: false,
  title: '编辑个人信息',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        updateUserInfoHandler()
      }
    }
  ]
})

const formData = ref({})
const formDataRef = ref()

const emit = defineEmits(["resetUserInfo"])
const updateUserInfoHandler = () => {
  if (!formDataRef.value) {
    console.log('unde')
    return
  }
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    Object.assign(params, formData.value)
    let result = await proxy.Request({
      url: api.updataUserInfo,
      params,
    })
    if (!result) {
      return
    }
    dialogConfig.value.show = false
    emit("resetUserInfo", params)
    if (params.avatar instanceof File) {
      router.go(0)
    }
  }) 
}

const showEditUserInfoDialog = (userInfo) => {
  dialogConfig.value.show = true
  nextTick(() => {
    
    const dataInfo = JSON.parse(JSON.stringify(userInfo))
    dataInfo.avatar = {
      imageUrl: dataInfo.userId,
    }
    formData.value = dataInfo
  })
}

defineExpose({showEditUserInfoDialog})
</script>

<style lang="scss">
</style>
