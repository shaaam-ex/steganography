<template>
  <div class="main-container-home-page">
    <div class="inner-main-container-home-page">
      <div class="first-section-home-page">
        <div class="inner-first-section-home-page">
          <h1>One Click,<br /> Unlimited Possibilities</h1>
          <router-link class="standard-big-button" to="/embed">Embed Image</router-link>
        </div>
        <img :src="lockIcon" alt="lock-icon">
      </div>
    </div>
  </div>
</template>

<style scoped>
  @import "../styles/homeView.css";
</style>
<script setup lang="ts">
  import lockIcon from '@/assets/lock-3d-lock-icon-3d-lock-symbol-3d-lock-image-free-png.png';
</script>