<script>
    import SvelteWidget from "./SvelteWidget.svelte";

	let defaultData = true;

	function toggleDEfaultData() {
		defaultData = !defaultData
	}

	let whatComesFromChild

	function handleMessage(event) {
		whatComesFromChild = event.detail.widgetData
		console.error(event.detail)
	}
</script>

<SvelteWidget useDefaultData="{defaultData}" inputData="{12}" on:message={handleMessage}/>
<br>
<button on:click={toggleDEfaultData}>toggle default data</button> <br>
this comes from child: {whatComesFromChild}
