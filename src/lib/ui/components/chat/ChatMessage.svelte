<script lang="ts">
	import type { MessageWithChildren } from '$lib/types';

	let { message, onNavigate }: { message: MessageWithChildren; onNavigate: (id: string) => void } =
		$props();
</script>

<div>
	<div>
		<p>{message.contents}</p>
	</div>
</div>
