<template>
    <div>
        <h3>{{ title }}</h3>
        <slot></slot>
    </div>
</template>

<script setup>
const props = defineProps({
    title: {
        required: true,
        type: String,
        default: 'Title'
    }
})
</script>

<style scoped>
h3 {
    font-size: 1.8rem;
    font-family: 'Cairo', sans-serif;
    font-weight: bold;
    text-align: center;
    color: #b1b1b1;
}
</style>
