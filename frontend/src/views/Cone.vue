<template>
    <main>
        <div class="canvas" id="canvas"></div>
    </main>
</template>

<script setup>
import { onMounted, ref, toRaw } from 'vue'

let two

onMounted(async () => {})

</script>

<style scoped>
main {
    grid-area: 'main';
    padding: 3ch;
}
.canvas {
    display: block;
    background-color: white;
    border-radius: 7px;
    min-height: 55vh;
    margin-bottom: 1ch;
}
</style>
