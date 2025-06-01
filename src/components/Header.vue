<script setup>
  import {ref} from "vue";

  const options = ref(['Home', 'Embed', 'Extract'])
</script>

<template>
  <div class="header-main-container">
    <div class="inner-header-main-container">
      <h2>EnrypX</h2>

      <div class="clickable-links-container-header">
        <ul>
          <li v-for="option in options" :key="option"><router-link :to="`/${option.toLowerCase() === 'home' ? '' : option.toLowerCase()}`">{{ option }}</router-link></li>
        </ul>
      </div>

      <div class="user-container">
        <p><span>eXton</span></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../styles/header.css';
</style>