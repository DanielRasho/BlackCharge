<template>
    <div class="field-container">
        <span class="title">{{ props.name }}</span>
        <input
            @blur="updateValue"
            type="text"
            :placeholder="props.placeholder"
            :value="currentValue"
        />
        <span class="unit">{{ props.unit }}</span>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const currentValue = ref('')

const emit = defineEmits(['fieldUpdated'])

const props = defineProps({
    /**
     * Required for v-model behaviour.
     */
    name: {
        required: true,
        type: String,
        default: 'Title'
    },

    initialValue: {
        required: true
    },

    unit: {
        required: true,
        type: String,
        default: '?'
    },
    /**
     * Renders the placeholder value for some input types.
     */
    placeholder: {
        required: false,
        type: String,
        default: '- - -'
    },
    width: {
        required: false,
        type: String,
        default: '20ch'
    },
    titleWidth: {
        required: false,
        type: String,
        default: 'auto'
    }
})

onMounted(() => {
    currentValue.value = props.initialValue
})

function updateValue(event) {
    let futureValue = event.target.value
    if (
        futureValue == '' ||
        futureValue == '-' ||
        isNaN(parseFloat(futureValue))
    ) {
        // Force value update
        currentValue.value = parseFloat(currentValue.value + 1)
        currentValue.value = parseFloat(currentValue.value - 1)
    } else {
        currentValue.value = parseFloat(futureValue)
        emit('fieldUpdated', currentValue.value)
    }
}
</script>

<style scoped>
.field-container {
    display: flex;
    align-items: center;
}

.title {
    font-size: 1.2rem;
    min-width: v-bind(titleWidth);
    margin-right: 2ch;
}

input,
.unit {
    display: inline-block;
    border: 2px solid #ccc;
    height: 2.5rem;
    padding: 1ch 1ch;
    font-family: 'PT Sans', sans-serif;
    font-size: 1rem;
}

input {
    border-right: 0;
    width: v-bind('width');
    color: #666;
    border-radius: 7px 0px 0px 7px;
}
input::placeholder {
    font-style: italic;
}

.unit {
    background-color: #ccc;
    color: var(--background);
    border-radius: 0px 7px 7px 0px;
    font-weight: bold;
}
</style>
