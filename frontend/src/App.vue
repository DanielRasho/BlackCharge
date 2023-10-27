<script setup>
import buttonImportant from '@/components/atoms/buttonImportant.vue'
import { useRouter, RouterView } from 'vue-router'

import { ref } from 'vue'

const router = useRouter()
const figures = ref([
    {
        name: 'Cone',
        img: 'cone.png',
        view: 'Cone'
    },
    {
        name: 'Truncated Cone',
        img: 'trunk.png',
        view: 'ConeTrunk'
    },
    {
        name: 'Hemisphere',
        img: 'hemisphere.png',
        view: 'Hemisphere'
    }
])

function changeFormView(viewPath) {
    router.push({ name: viewPath })
}
</script>

<template>
    <div class="app">
        <!-- DUMMY DIV -->
        <div></div>
        <!-- SIDE BAR -->
        <nav class="figures-bar">
            <buttonImportant
                class="figures-btn"
                v-for="figure in figures"
                :key="figure.name"
                @click.prevent="changeFormView(figure.view)"
            >
                <div class="figures-btn-content">
                    <img :src="figure.img" alt="circle" />
                    <span>{{ figure.name }}</span>
                </div>
            </buttonImportant>
        </nav>
        <!-- MAIN CONTENT -->
        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
                <component :is="Component" />
            </transition>
        </router-view>
    </div>
</template>

<style scoped>
.app {
    display: grid;
    grid-template-areas: 'sidebar main';
    grid-template-columns: 250px;
    grid-auto-columns: 1fr;
}

.figures-bar {
    position: fixed;

    height: 100vh;
    padding: 0 3ch;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.figures-btn {
    margin: 2ch 0;
}

.figures-btn-content {
    max-width: 9rem;
    min-height: 7rem;
    margin: 0 1ch;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    border-radius: 1rem;
    background-color: var(--primary-button);
}
.figures-btn-content img {
    width: 70%;
}

.figures-btn-content span {
    font-size: 1.2rem;
    color: var(--background);
    font-weight: 700;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease-out;
}
</style>
