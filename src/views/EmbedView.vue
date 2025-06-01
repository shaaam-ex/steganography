<template>
  <transition
      appear
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
  >
  <div>
    <div class="main-container-embed-page">
      <form @submit.prevent="embedData" class="inner-main-container-embed-page">
        <div class="content-container-embed-page">
          <h2>Step 1</h2>
          <p>Select the image you want to embed the data in.</p>
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
          <h2>Step 2</h2>
          <p>Type in the data.</p>
          <textarea
              placeholder="The Message"
              v-model="message"
              name="message"
              id="message"
              required
          ></textarea>
        </div>

        <div class="content-container-embed-page">
          <button class="standard-big-button" type="submit" :disabled="isProcessing">
            {{ isProcessing ? 'Processing...' : 'Embed' }}
          </button>
        </div>
      </form>

      <div class="image-preview-container" :class="{ visible: imageUrl || processedImageUrl }">
        <img
            v-if="processedImageUrl"
            :src="processedImageUrl"
            alt="Processed Image"
            class="glow-effect"
        />
        <img
            v-else-if="imageUrl"
            :src="imageUrl"
            alt="Image Preview"
            @load="onImageLoad"
            class="glow-effect"
        />
      </div>
    </div>



    <div v-if="downloadUrl" class="content-container-embed-page-down download-section">
      <a
          :href="downloadUrl"
          download="steganographed-image.png"
          class="standard-big-button download-button"
          @click="showConfetti"
      >
        Download Image
      </a>
    </div>
  </div>
  </transition>
</template>

<script setup>
import { ref, onUnmounted } from "vue";
import confetti from 'canvas-confetti';

const message = ref("");
const file = ref(null);
const imageUrl = ref(null);
const processedImageUrl = ref(null);
const downloadUrl = ref(null);
const isProcessing = ref(false);

const showConfetti = () => {
  confetti({
    particleCount: 300,
    spread: 160,
    ticks: 200,
    gravity: 0.5,
    origin: { y: 0 },
    shapes: ['circle', 'square'],
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
  });

  setTimeout(() => {
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.7 }
    });

    confetti({
      particleCount: 100,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.7 }
    });
  }, 250);

  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 100,
      shapes: ['star'],
      scalar: 1.5,
      origin: { y: 0 }
    });
  }, 500);
};

function handleFileChange(event) {
  const selectedFile = event.target.files[0];
  file.value = selectedFile;

  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  if (processedImageUrl.value) URL.revokeObjectURL(processedImageUrl.value);
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value);

  processedImageUrl.value = null;
  downloadUrl.value = null;

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

async function embedData() {
  if (!file.value || !message.value) return;

  isProcessing.value = true;

  try {
    const canvas = await loadImageToCanvas(imageUrl.value);

    // 2. Get image data
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const binaryMessage = textToBinary(message.value + "[END]");

    if (binaryMessage.length > (data.length / 4) * 3) {
      throw new Error("Message too large for this image");
    }

    // 5. Embed the message in LSB of pixels
    let messageIndex = 0;
    for (let i = 0; i < data.length; i += 4) {
      // Skip alpha channel (i+3)
      for (let j = 0; j < 3; j++) {
        if (messageIndex < binaryMessage.length) {
          // Clear the least significant bit
          data[i + j] = data[i + j] & 0xFE;
          // Set the least significant bit to our message bit
          data[i + j] = data[i + j] | parseInt(binaryMessage[messageIndex]);
          messageIndex++;
        }
      }
    }

    // 6. Put modified data back into canvas
    ctx.putImageData(imageData, 0, 0);

    // 7. Create download link
    processedImageUrl.value = canvas.toDataURL('image/png');
    downloadUrl.value = processedImageUrl.value;

  } catch (error) {
    console.error("Error embedding data:", error);
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

// Helper function to convert text to binary
function textToBinary(text) {
  return text.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join('');
}

// Clean up
onUnmounted(() => {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  if (processedImageUrl.value) URL.revokeObjectURL(processedImageUrl.value);
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value);
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
</style>

<!--I will add confetti too-->