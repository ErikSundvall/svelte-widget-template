<script>
    import {createEventDispatcher} from 'svelte';

    export let config = {showButton: true}
    export let inputData
    export let useDefaultData = true
    export const descriptor = {
        valueModel: {
            type: 'string',
        },
        configuration: {
            showButton: {
                type: 'boolean',
                defaultValue: true,
                metadata: {
                    title: 'Shows the button on a widget or not'
                }
            }
        }
    };
    const outputData = createEventDispatcher();
    let widgetData

    $: initWidgetData(useDefaultData !== false ? 500 : inputData)
    $: emitWidgetData(widgetData)

    function initWidgetData(data) {
        console.error("happens")
        widgetData = data
    }

    function emitWidgetData() {
        outputData('message', {widgetData});
    }

</script>

<svelte:options tag="svelte-widget"/>

{#if config && config.showButton === true}
    <button on:click={() => initWidgetData(500)}> reset input data to 500</button>
{/if}
this is a widget template. <br>
here you see basic input that also outputs data:
<input bind:value={widgetData}/>
