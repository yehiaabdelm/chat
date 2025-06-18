<script lang="ts">
	import { Spring } from 'svelte/motion';
	import TemporaryChats from './TemporaryChats.svelte';
	import MaxMessagesCount from './MaxMessagesCount.svelte';
	import ApiKeys from './ApiKeys.svelte';
	import Model from '../chat/Model.svelte';
	import type { User, Model as ModelType } from '$lib/types';
	import { PUBLIC_STRIPE_DONATION_LINK } from '$env/static/public';
	let {
		user,
		models,
		endpoints
	}: {
		user: User;
		models: ModelType[];
		endpoints: {
			id: string;
			name: string;
			apiKey: boolean;
		}[];
	} = $props();

	let scale = new Spring(200, {
		stiffness: 0.1,
		damping: 0.8
	});
	let opacity = new Spring(0, {
		stiffness: 0.1,
		damping: 0.8
	});
	let blurValue = new Spring(5, {
		stiffness: 0.1,
		damping: 0.8
	});

	scale.set(0);
	opacity.set(1);
	blurValue.set(0);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	style="will-change: transform, opacity, filter; transform: translateY({scale.current}px); opacity: {opacity.current}; filter: blur({blurValue.current}px) saturate(1.3);"
	class="border-grey-1000 flex h-[29rem] rounded-[1.1rem] border bg-[rgb(var(--settings-background-color))] p-7 shadow-lg *:antialiased max-sm:mx-4 max-sm:p-6 lg:w-[50rem]"
>
	<div class="mr-0 flex w-full flex-col items-center justify-between">
		<div class="flex w-full flex-col gap-3">
			<div class="border-grey-800 flex w-full items-center gap-3 pb-2">
				<img
					src={user.avatarUrl}
					alt="{user.firstName} {user.lastName}'s avatar"
					class="h-10 w-10 self-start rounded-full object-cover"
				/>
				<div class="flex flex-col gap-0.5">
					<h2
						class="text-grey-100 font-public mt-[-2px] self-start text-right text-xl font-medium antialiased"
					>
						{user.firstName}
						{user.lastName}
					</h2>
					{#if user.email}
						<p class="text-grey-400 font-public ml-0.5 text-[0.75rem] antialiased">
							{user.email}
						</p>
					{/if}
				</div>
			</div>
			<div class="w-full">
				<table class="w-full">
					<tbody>
						<tr>
							<td class="w-1/3 p-2">
								<p
									class="font-gill text-grey-100 bg-transparent py-1 text-sm tracking-[2px] uppercase antialiased"
								>
									API Keys
								</p>
							</td>
							<td class="w-2/3 p-2"> <ApiKeys {endpoints} /> </td>
						</tr>
						<!-- <tr>
							<td class="w-1/3 p-2">
								<div class="flex min-w-0 shrink flex-col self-start">
									<p
										class="font-gill text-grey-100 bg-transparent py-1 text-xs tracking-[2px] uppercase antialiased"
									>
										Models
									</p>
									<p
										class="font-public text-grey-425 bg-transparent py-1 text-xs leading-4 antialiased"
									>
										Select the models you want to use.
									</p>
								</div>
							</td>
							<td class="flex flex-wrap gap-2 p-2">
								{#each models as model}
									<Model {model} onclick={() => {}} active={false} />
								{/each}
							</td>
						</tr> -->
						<tr>
							<td class="w-1/3 p-2">
								<div class="flex min-w-0 shrink flex-col self-start">
									<p
										class="font-gill text-grey-100 bg-transparent py-1 text-sm tracking-[2px] uppercase antialiased"
									>
										time to delete
									</p>
									<p
										class="font-public text-grey-425 bg-transparent py-1 text-[0.7rem] leading-4 antialiased"
									>
										Temporary chats will be deleted after this time.
									</p>
								</div>
							</td>
							<td class="w-2/3 p-2">
								<TemporaryChats threshold={user.tempChatDeleteHours} />
							</td>
						</tr>
						<tr>
							<td class="w-1/3 p-2">
								<div class="flex min-w-0 shrink flex-col self-start">
									<p
										class="font-gill text-grey-100 bg-transparent py-1 text-sm tracking-[2px] uppercase antialiased"
									>
										message window limit
									</p>
									<p
										class="font-public text-grey-425 bg-transparent py-1 text-xs leading-4 antialiased"
									>
										Reduce model usage costs by limiting its window to the most recent 10 messages.
										Default: 10
									</p>
								</div>
							</td>
							<td class="w-2/3 p-2">
								<MaxMessagesCount messageWindow={user.messageWindow} />
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div class="flex w-full justify-between">
			<a
				class="font-gill text-grey-400 hover:text-grey-100 self-end text-xs tracking-[2px] uppercase antialiased duration-200 ease-in-out"
				target="_blank"
				href={PUBLIC_STRIPE_DONATION_LINK}>donate</a
			>
			<div class="*:font-gill flex flex-col *:text-xs *:tracking-[2px] *:uppercase *:antialiased">
				<p class="text-grey-400 self-end">contact us</p>
				<p class="text-grey-600">support@teletyped.com</p>
			</div>
		</div>
	</div>
</div>
