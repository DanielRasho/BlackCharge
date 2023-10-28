<template>
    <div class="container">
        <fieldSection title="Axes" class="common-box">
            <h4>X axis</h4>
            <div class="wrapper-container">
                <numberField
                    name="Min"
                    placeholder="- - -"
                    unit="m"
                    width="7ch"
                    :initialValue="props.fields.x_axis.min"
                    @field-updated="fields.x_axis.min = $event"
                />
                <numberField
                    name="Max"
                    placeholder="- - -"
                    unit="m"
                    width="7ch"
                    :initialValue="props.fields.x_axis.max"
                    @field-updated="fields.x_axis.max = $event"
                />
            </div>

            <h4>Y axis</h4>
            <div class="wrapper-container">
                <numberField
                    name="Min"
                    placeholder="- - -"
                    unit="m"
                    width="7ch"
                    :initialValue="props.fields.y_axis.min"
                    @field-updated="fields.y_axis.min = $event"
                />
                <numberField
                    name="Max"
                    placeholder="- - -"
                    unit="m"
                    width="7ch"
                    :initialValue="props.fields.y_axis.max"
                    @field-updated="fields.y_axis.max = $event"
                />
            </div>
        </fieldSection>

        <fieldSection title="Figure" class="specific-box">
            <div class="wrapper-container">
                <numberField
                    v-for="field in fields.figure"
                    :key="field.name"
                    class="specific-field"
                    :name="field.name"
                    :unit="field.unit"
                    :titleWidth="calculateFieldNameWidth(props.fields)"
                    :initialValue="field.value"
                    @field-updated="field.value = $event"
                />
                <slot></slot>
            </div>
        </fieldSection>

        <fieldSection title="Point" class="submit-box">
            <!-- <numberField
                name="Position"
                unit="m"
                width="10ch"
                :initialValue="props.fields.points.length"
                @field-updated="newPoint = $event"
            /> -->
            <div class="wrapper-container-center">
                <buttonImportant class="submit-btn" @click="submitPoint">
                    Submit <i class="fa-solid fa-arrow-right"></i>
                </buttonImportant>
            </div>
        </fieldSection>
    </div>
</template>

<script setup>
import buttonImportant from '@/components/atoms/buttonImportant.vue'
import numberField from '@/components/atoms/numberField.vue'
import fieldSection from '@/components/molecules/fieldSection.vue'
import { reactive, ref, watch, toRaw } from 'vue'
import { ELECTRON } from '../../lib/particles'
import { SimulationContext } from '../../lib/main'

const emit = defineEmits(['changesSubmited', 'clear', 'startSimulation'])
const props = defineProps({
    fields: { type: SimulationContext, required: true }
})

let fields = reactive(JSON.parse(JSON.stringify(props.fields)))
const particle = ref(ELECTRON)

function calculateFieldNameWidth(names) {
    let maxLen = 0
    for (let proxy of Object.values(names.figure)) {
        let proxyLen = proxy.name.length
        if (proxyLen > maxLen) maxLen = proxyLen
    }
    return maxLen + 'ch'
}

// Emits hotReload signal when a value from the fields mutate.
watch(fields, (newFields) => {
    let newValue = toRaw(newFields)
    emit('changesSubmited', newValue)
})

function submitPoint() {
    // fields.points.push(newPoint.value)
    emit('startSimulation', particle.value)
}
</script>

<style scoped>
h4 {
    font-size: 1.5rem;
    color: #b1b1b1;
    margin: 1ch 0;
}
.container {
    width: 100%;
    display: flex;
    justify-content: space-around;
    margin-top: 2rem;
}

.container > .common-box {
    border-right: 1px solid #ccc;
    width: 25%;
    padding-right: 2ch;
}
.container > .specific-box {
    width: 50%;
    padding: 0 2ch;
}
.container > .submit-box {
    border-left: 1px solid #ccc;
    width: 25%;
    padding-left: 2ch;
}

.specific-field {
    margin-top: 2ch;
}
.wrapper-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.wrapper-container-center {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.submit-btn,
.clear-btn {
    display: block;
    margin: 2rem auto 0;
}

.submit-btn :deep(.front) {
    background-color: rgb(117, 208, 117);
    border: 7px solid rgb(60, 106, 60);
    color: rgb(35, 60, 35);
    width: 10ch;
    font-size: 1.5rem;
}
.submit-btn :deep(.front) i {
    color: rgb(35, 60, 35);
}
.submit-btn :deep(.edge) {
    background-color: rgb(35, 60, 35);
}
.clear-btn :deep(.front) {
    background-color: rgb(208, 137, 117);
    border: 7px solid rgb(131, 35, 9);
    color: rgb(131, 35, 9);
    width: 10ch;
    font-size: 1.5rem;
}
.clear-btn :deep(.front) i {
    color: rgb(131, 35, 9);
}
.clear-btn :deep(.edge) {
    background-color: rgb(78, 24, 1);
}
</style>
