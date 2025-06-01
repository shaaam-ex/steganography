<template>
  <transition
      appear
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
  >
  <div>
    <div class="main-container-embed-page">
      <form @submit.prevent="extractData" class="inner-main-container-embed-page">
        <div class="content-container-embed-page">
          <h2>Step 1</h2>
          <p>Select the image you want to extract the data from.</p>
          <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              name="img"
              id="img"
              accept="image/*"
              required
          >
        </div>

        <div class="content-container-embed-page">
          <button class="standard-big-button" type="submit" :disabled="isProcessing">
            {{ isProcessing ? 'Processing...' : 'Extract' }}
          </button>
        </div>
      </form>

      <div class="image-preview-container" :class="{ visible: imageUrl }">
        <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Image Preview"
            @load="onImageLoad"
            class="glow-effect"
        />
      </div>
    </div>

    <div v-if="extractedMessage" class="content-container-embed-page-down extracted-message-section">
      <h2>Extracted Message</h2>
      <p class="extracted-message">{{ extractedMessage }}</p>
    </div>
  </div>
  </transition>
</template>

<script setup>
import { ref, onUnmounted } from "vue";

const file = ref(null);
const imageUrl = ref(null);
const extractedMessage = ref("");
const isProcessing = ref(false);

function handleFileChange(event) {
  const selectedFile = event.target.files[0];
  file.value = selectedFile;

  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  extractedMessage.value = "";

  if (selectedFile) {
    imageUrl.value = URL.createObjectURL(selectedFile);
  } else {
    imageUrl.value = null;
  }
}

function onImageLoad(event) {
  const img = event.target;
  img.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = img.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    img.style.transform = `
      perspective(1000px)
      rotateX(${y * 10}deg)
      rotateY(${-x * 10}deg)
      scale(1.03)
    `;
  });

  img.addEventListener('mouseleave', () => {
    img.style.transform = 'none';
  });
}

async function extractData() {
  if (!file.value) return;

  isProcessing.value = true;

  try {
    const canvas = await loadImageToCanvas(imageUrl.value);

    // 2. Get image data
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 3. Extract bits from LSB
    let binaryMessage = '';
    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        binaryMessage += (data[i + j] & 1).toString();
      }
    }

    // 4. Convert binary to text until [END] marker
    let message = '';
    for (let i = 0; i < binaryMessage.length; i += 8) {
      const byte = binaryMessage.substr(i, 8);
      if (byte.length < 8) break;
      const char = String.fromCharCode(parseInt(byte, 2));
      message += char;
      if (message.endsWith('[END]')) {
        message = message.slice(0, -5); // Remove [END]
        break;
      }
    }

    extractedMessage.value = message || "No hidden message found.";
  } catch (error) {
    console.error("Error extracting data:", error);
    alert("Error: " + error.message);
  } finally {
    isProcessing.value = false;
  }
}

// Helper function to load image to canvas
function loadImageToCanvas(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

// Clean up
onUnmounted(() => {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
});

import { gsap } from 'gsap'

function beforeEnter(el) {
  el.style.opacity = 0
  el.style.transform = 'translateY(20px)'
}

function enter(el, done) {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
    onComplete: done
  })
}

function afterEnter(el) {
}
</script>

<style scoped>
@import '@/styles/embedView.css';

.extracted-message-section {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeIn 0.5s ease-in-out;
}

.extracted-message-section h2 {
  margin-bottom: 1rem;
  font-size: 1.8rem;
  color: #333;
  font-weight: 600;
}

.extracted-message {
  font-size: 1.1rem;
  background: linear-gradient(135deg, #f9f9f9 0%, #e3e3e3 100%);
  color: #222;
  padding: 1.2rem 1.6rem;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 80%;
  word-break: break-word;
  line-height: 1.5;
  position: relative;
  overflow-wrap: break-word;
  transition: transform 0.2s ease;
}

.extracted-message::before {
  content: "💬";
  position: absolute;
  top: -10px;
  left: -10px;
  font-size: 1.5rem;
}

.extracted-message:hover {
  transform: scale(1.03);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

