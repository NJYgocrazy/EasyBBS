<template>
  <div class="image-viewer">
    <el-image-viewer
      :initial-index="previewImageIndex"
      hide-on-click-modal
      :url-list="imageList"
      @close="closeImageViewer"
      v-if="previewImageIndex != null"
    >
    </el-image-viewer>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const props = defineProps({
  imageList: {
    type: Array,
  },
})

const closeImageViewer = () => {
    startScroll()
    previewImageIndex.value = null
}

const stopScroll = () => {
document.body.style.overflow = 'hidden'
}

const startScroll = () => {
document.body.style.overflow = 'auto'
}

const previewImageIndex = ref(null)

const show = (index) => {
    previewImageIndex.value = index
}

defineExpose({
  show,
})


</script>

<style lang="scss" scoped>
</style>
