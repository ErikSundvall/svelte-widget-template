<svelte:options tag="svelte-widget"/>
<script>
    import { onMount } from 'svelte';


    export let config = {showButton: true, showDebug: false}

    /**
     * Initial data for the widget.
     * @type {string}
     */
    export let inputData

    /**
     * Whether to use the default data or the inputData.
     * @type {boolean}
     */
    export let useDefaultData = true

    /**
     * Descriptor for the widget's properties and configuration.
     */
    export const descriptor = {
        valueModel: {
            type: 'string',
        },
        configuration: {
            showButton: {
                type: 'boolean',
                defaultValue: true,
                metadata: {
                    title: 'Shows the reset button on the widget (or not)'
                }
            },
             showDebug: {
                type: 'boolean',
                defaultValue: false,
                metadata: {
                    title: 'Shows the debug information inside the widget (or not)'
                }
            }
        }
    };

    /**
     * The data currently held by the widget, which can be modified by the user.
     * @type {string}
     */
    let outputData

    /**
     * The host element of the widget.
     * @type {HTMLElement}
     */
    let hostElement;

    $: outputData = useDefaultData !== false ? "This is a default value" : inputData

    onMount(() => {
        // When the component is first mounted, emit the initial data.
        // This is done in onMount to ensure the hostElement is bound and
        // the event listener on the host page has had a chance to be attached.
        emitOutputData();
    });


    function emitOutputData() {
        if (!hostElement) return;
        // Dispatch a standard DOM CustomEvent that can bubble up and cross the shadow DOM boundary.
        hostElement.dispatchEvent(new CustomEvent('message', {
            detail: { outputData: outputData },
            bubbles: true,
            composed: true,
        }));
    }


    function reverseAndEmit() {
        // Ensure outputData is treated as a string for reversal
        const stringValue = String(outputData);
        // Reverse the string and update outputData.
        outputData = stringValue.split('').reverse().join('');
        // Explicitly emit the change
        emitOutputData();
    }

</script>

<div bind:this={hostElement}>

This is a widget example. <br>
Here you see input data that is also used as output data:<br>
<input bind:value={outputData}> <br>

<button on:click={emitOutputData}>Emit data</button>
<button on:click={reverseAndEmit}>Reverse and then emit data</button>

{#if config && config.showButton === true}
    <button on:click={() => {outputData="Testing 123"}}> Set input data to 'Testing 123'</button>
{/if}

{#if config && config.showDebug === true}
<h1>Debug information (inside widget)</h1>
<ul>
    <li>use default data: {useDefaultData}</li>
    <li>outputData as JSON: {JSON.stringify(outputData)}</li>
    <li>inputData as JSON: {JSON.stringify(inputData, null, 2)}</li>
    <li>config as JSON: <br><pre>{JSON.stringify(config, null, 2)}</pre></li>
    <li>descriptor as JSON: <br><pre>{JSON.stringify(descriptor, null, 2)}</pre></li>
</ul>
{/if}
</div>
