<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let chart: any;
	let Highcharts: any;
	let eventSource: EventSource | null = null;

	onMount(async () => {
		if (!browser) return;

		// Dynamic import of Highcharts and its modules
		Highcharts = (await import('highcharts/highstock')).default;
		await import('highcharts/modules/exporting');

		chart = Highcharts.stockChart('container-sse', {
			rangeSelector: {
				enabled: false
			},
			// navigator: {
			// 	enabled: true
			// },
			toolbar: {
				enabled: false
			},
			title: {
				text: 'Server Sent Events (SSE)'
			},
			subtitle: {
				text: 'Mock data from SvelteKit API'
			},
			xAxis: {
				type: 'datetime'
			},
			yAxis: {
				title: {
					text: 'Value'
				}
			},
			series: [
				{
					name: 'Data',
					data: [],
					type: 'spline'
				}
			]
		});

		eventSource = new EventSource('/api/sse');
		eventSource.onmessage = (event) => {
			if (!chart) return;
			const data = JSON.parse(event.data);
			const point = [new Date(data[0].timestamp).getTime(), data[0].value];
			const series = chart.series[0];
			const shift = series.data.length > 20;
			series.addPoint(point, true, shift);
		};
	});

	onDestroy(() => {
		if (eventSource) {
			eventSource.close();
		}
		if (chart) {
			chart.destroy();
		}
	});
</script>

<div id="container-sse"></div>