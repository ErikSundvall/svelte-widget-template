<svelte:options tag="svelte-widget"/>
<script>
    import { onMount } from 'svelte';


    export let config = {showButton: true, showDebug: false}

    /**
     * Whether to use the default data or not.
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
                    title: 'Shows the (p)reset button on the widget (or not)'
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
    export let inputData //Does the naming here make a difference?

    /**
     * The host element of the widget.
     * @type {HTMLElement}
     */
    let hostElement;

    $: inputData = useDefaultData !== false ? "This is a default value" : inputData

    onMount(() => {
        // When the component is first mounted, emit the initial data.
        // This is done in onMount to ensure the hostElement is bound and
        // the event listener on the host page has had a chance to be attached.
        emitData();
    });


    function emitData() {
        if (!hostElement) return;
        // Dispatch a standard DOM CustomEvent that can bubble up and cross the shadow DOM boundary.
        hostElement.dispatchEvent(new CustomEvent('message', {
            detail: { inputData: inputData }, //Does the naming here make a difference?
            bubbles: true,
            composed: true,
        }));
    }


    function reverseAndEmit() {
        // Ensure inputData is treated as a string for reversal
        const stringValue = String(inputData);
        // Reverse the string and update outputData.
        inputData = stringValue.split('').reverse().join('');
        // Explicitly emit the change
        emitData();
    }

</script>

<div bind:this={hostElement}>

This is a widget example. <br>
Here you see input data that is also used as output data:<br>
<input bind:value={inputData}> <br>

<button on:click={emitData}>Emit data</button>
<button on:click={reverseAndEmit}>Reverse and then emit data</button>

{#if config && config.showButton === true}
    <button on:click={() => {inputData="Testing 123"}}> Set data to 'Testing 123'</button>
{/if}

{#if config && config.showDebug === true}
<h1>Debug information (inside widget)</h1>
<ul>
    <li>use default data: {useDefaultData}</li>
    <li>inputData as JSON: {JSON.stringify(inputData)}</li>
    <li>config as JSON: <br><pre>{JSON.stringify(config, null, 2)}</pre></li>
    <li>descriptor as JSON: <br><pre>{JSON.stringify(descriptor, null, 2)}</pre></li>
</ul>
{/if}
</div>
