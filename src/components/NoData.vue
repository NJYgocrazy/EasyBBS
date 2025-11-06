<template>
  <div class="no-data">
    <div class="iconfont icon-empty"></div>
    <div class="msg">{{ msg }}</div>
  </div>
</template>

<script setup>

const props = defineProps({
  msg: {
    type: String,
    default: '暂无数据',
  },
})

</script>

<style lang="scss" scoped>

.no-data{
  text-align: center;
  padding: 10px 0px;
  .iconfont{
    font-size: 50px;
    color: #ccc;
  }
  .msg{
    margin-top: 10px;
    color: #999;
    font-size: 14px;
  }
}

</style>
