<svelte:options tag="svelte-widget"/>
<script>
    import { onMount } from 'svelte';

    export let config = {showButton: true, showDebug: true}
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
                    title: 'Shows the button on a widget (or not)'
                }
            },
             showDebug: {
                type: 'boolean',
                defaultValue: true,
                metadata: {
                    title: 'Shows the debug information inside the widget (or not)'
                }
            }
        }
    };
    let widgetData
    let hostElement;

    $: initWidgetData(useDefaultData !== false ? "This is a default value" : inputData)

    function initWidgetData(data) {
        widgetData = data
    }

    onMount(() => {
        // When the component is first mounted, emit the initial data.
        // This is done in onMount to ensure the hostElement is bound and
        // the event listener on the host page has had a chance to be attached.
        emitWidgetData();
    });

    function emitWidgetData() {
        if (!hostElement) return;
        // Dispatch a standard DOM CustomEvent that can bubble up and cross the shadow DOM boundary.
        hostElement.dispatchEvent(new CustomEvent('message', {
            detail: { widgetData },
            bubbles: true,
            composed: true,
        }));
    }

    function reverseAndEmit() {
        // Ensure widgetData is treated as a string for reversal
        const stringValue = String(widgetData);
        // Reverse the string and update widgetData.
        widgetData = stringValue.split('').reverse().join('');
        // Explicitly emit the change
        emitWidgetData();
    }

</script>

<div bind:this={hostElement}>


{#if config && config.showButton === true}
    <button on:click={() => initWidgetData("Input looks like this after reset")}> reset input data to 500</button>
{/if}
this is a widget template. <br>
here you see basic input that also outputs data:
<input bind:value={widgetData}/> <br>

<button on:click={emitWidgetData}>Emit data</button>
<button on:click={reverseAndEmit}>Reverse and then emit data</button>
{#if config && config.showDebug === true}
<h1>Debug information (inside widget)</h1>
<ul>
    <li>widget data: {widgetData}</li>
    <li>input data: {inputData}</li>
    <li>use default data: {useDefaultData}</li>
    <li>descriptor as JSON: {JSON.stringify(descriptor)}</li>
    <li>widgetData as JSON: {JSON.stringify(widgetData)}</li>
    <li>inputData as JSON: {JSON.stringify(inputData)}</li>
    <li>useDefaultData as JSON: {JSON.stringify(useDefaultData)}</li>
    <li>config as JSON: {JSON.stringify(config)}</li>
</ul>
{/if}
</div>
