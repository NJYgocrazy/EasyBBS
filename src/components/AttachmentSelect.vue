<template>
  <div class="attachment-select">
    <template v-if="modelValue">
      <div class="file-show">
        <div class="file-name" :title="modelValue.name">
          {{ modelValue.name }}
        </div>
        <div class="iconfont icon-del" @click="delFile"></div>
      </div>
    </template>
    <el-upload
      v-else
      name="file"
      :show-file-list="false"
      accept=".zip,.rar"
      :multiple="false"
      :http-request="selectFile"
    >
      <el-button type="primary">选择文件</el-button>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import { ElMessage, emitChangeFn } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
})


const emit = defineEmits()
const selectFile = async (file) => {
  file = file.file
  emit('update:modelValue', file)
}

const delFile = () => {
  emit('update:modelValue', null)
}
</script>

<style lang="scss" scoped>
.attachment-select {
  width: 100%;
  .file-show {
    width: 100%;
    display: flex;
    justify-content: space-around;
    .file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--link);
    }
    .icon-del {
      width: 20px;
      color: var(--link);
      cursor: pointer;
      margin-left: 10px;
    }
  }
}
</style>
