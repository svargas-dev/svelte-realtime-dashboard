<script lang="ts">
	import { onMount } from "svelte";

  // onMount(async () => {
  //   const response = await fetch('/api');
  //   console.log(await response.text());
  // });

  $effect(() => {
    const eventSource = new EventSource("/api");
    
    eventSource.onmessage = (event) => {
      console.log(event.data);
    };

    return () => {
      eventSource.close();
    }
  });
</script>

<h1>Server Sent Events?</h1>