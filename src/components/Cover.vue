<template>
  <div class="Cover" :style="{ width: width + 'px', height: width + 'px' }">
    <el-image :style="{ wdith: width + 'px', height: width + 'px' }" fit="scale-down" :src="imgUrl">
      <template #error>
        <div class="image-slot">
          <img
            src="@/assets/file/images/202301/default_avatar.jpg"
            :style="{ width: width + 'px', height: width + 'px' }"
          />
        </div>
      </template>
    </el-image>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const props = defineProps({
  cover: {
    type: String,
    default: '',
  },
  width: {
    type: Number,
    default: 60,
  },
})

const imgUrl = computed(() => {
  if (props.cover) {
    return proxy.globalInfo.imageUrl + props.cover
  }
  return ''
})
</script>

<style lang="scss">
.Cover {
  border-radius: 5px;
  background: #ddd;
  overflow: hidden;
}
</style>
