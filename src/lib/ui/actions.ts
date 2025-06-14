import { spring } from 'svelte/motion';
import { navigating } from '$app/stores';
import { tick, onDestroy, onMount, afterUpdate } from 'svelte';
import { get, type Writable } from 'svelte/store';
import { cubicIn, cubicOut } from 'svelte/easing';
// import { isSnapping } from '$lib/stores';
import { writable } from 'svelte/store';

const detachedOffset = 1;
const scrollY = spring(0, {
	stiffness: 0.1,
	damping: 0.8
});

// // isDetached is true then the user
// export const snapScrollToBottom = (node: HTMLElement, dependency: unknown) => {
// 	let scrollingTimeout: NodeJS.Timeout;
// 	let touchStartY = 0;
// 	let isScrolling = false;
// 	let isDetached = false;

// 	const handleScrollMovement = (scrollTop: number) => {
// 		if (scrollTop >= node.scrollHeight - node.clientHeight - detachedOffset) {
// 			isDetached = false;
// 		} else {
// 			isDetached = true;
// 		}
// 	};

// 	const handleWheel = (event: WheelEvent) => {
// 		const isScrollingUp = event.deltaY < 0;
// 		if (scrollingTimeout) clearTimeout(scrollingTimeout);
// 		isScrolling = true;

// 		if (isScrollingUp) isDetached = true;

// 		handleScrollMovement(node.scrollTop);

// 		scrollingTimeout = setTimeout(() => {
// 			isScrolling = false;
// 		}, 100);
// 	};

// 	const handleTouchStart = (event: TouchEvent) => {
// 		touchStartY = event.touches[0].clientY;
// 	};

// 	const handleTouchMove = (event: TouchEvent) => {
// 		const touchEndY = event.touches[0].clientY;
// 		const isScrollingUp = touchEndY > touchStartY;

// 		if (scrollingTimeout) clearTimeout(scrollingTimeout);
// 		isScrolling = true;

// 		if (isScrollingUp) isDetached = true;

// 		handleScrollMovement(node.scrollTop);

// 		scrollingTimeout = setTimeout(() => {
// 			isScrolling = false;
// 		}, 100);

// 		// Update touch start position for continuous analysis
// 		touchStartY = touchEndY;
// 	};

// 	const updateScroll = async (_options: { force?: boolean } = {}) => {
// 		const defaultOptions = { force: false };
// 		const options = { ...defaultOptions, ..._options };
// 		const { force } = options;

// 		if (!force && isDetached && !get(navigating)) return;

// 		isSnapping.set(true);

// 		await tick();

// 		scrollY.set(node.scrollHeight - node.clientHeight);
// 	};

// 	const unsubscribe = scrollY.subscribe(($scrollY) => {
// 		if (!isDetached) {
// 			if (!isScrolling) {
// 				node.scrollTo({ top: $scrollY });
// 			}
// 		}

// 		isSnapping.set(false);
// 	});

// 	if (dependency) {
// 		updateScroll({ force: true });
// 	}

// 	node.addEventListener('wheel', handleWheel);
// 	node.addEventListener('touchstart', handleTouchStart);
// 	node.addEventListener('touchmove', handleTouchMove);

// 	return {
// 		update: updateScroll,
// 		destroy: () => {
// 			unsubscribe();
// 			clearTimeout(scrollingTimeout);
// 			node.removeEventListener('wheel', handleWheel);
// 			node.removeEventListener('touchstart', handleTouchStart);
// 			node.removeEventListener('touchmove', handleTouchMove);
// 		}
// 	};
// };

export const customCubicBezier = (t: number): number => {
	// Customize the mix between cubicIn and cubicOut to emulate the Bezier control points
	if (t < 0.5) {
		// Start with a slower acceleration (emulating  0.19,  1)
		return 0.5 * cubicIn(t * 2.0); // Modify the factor if needed to match the start point
	} else {
		// End with a slower deceleration (emulating  0.22,  1)
		return 0.5 * cubicOut((t - 0.5) * 2.0) + 0.5; // Modify the factor if needed to match the end point
	}
};

export const sigmoid = (x: number) => {
	return 1 / (1 + Math.exp(-x));
};

export class SpringSolverCustom {
	private m_w0: number;
	private m_zeta: number;
	private m_wd: number;
	private m_A: number;
	private m_B: number;

	constructor({
		mass,
		stiffness,
		damping,
		initialVelocity
	}: {
		mass: number;
		stiffness: number;
		damping: number;
		initialVelocity: number;
	}) {
		this.m_w0 = Math.sqrt(stiffness / mass);
		this.m_zeta = damping / (2 * Math.sqrt(stiffness * mass));
		if (this.m_zeta < 1) {
			// Under-damped.
			this.m_wd = this.m_w0 * Math.sqrt(1 - this.m_zeta * this.m_zeta);
			this.m_A = 1;
			this.m_B = (this.m_zeta * this.m_w0 + -initialVelocity) / this.m_wd;
		} else {
			// Critically damped (ignoring over-damped case for now).
			this.m_wd = 0;
			this.m_A = 1;
			this.m_B = -initialVelocity + this.m_w0;
		}
	}

	public solve(t: number): number {
		if (this.m_zeta < 1) {
			// Under-damped
			t =
				Math.exp(-t * this.m_zeta * this.m_w0) *
				(this.m_A * Math.cos(this.m_wd * t) + this.m_B * Math.sin(this.m_wd * t));
		} else {
			// Critically damped (ignoring over-damped case for now).
			t = (this.m_A + this.m_B * t) * Math.exp(-t * this.m_w0);
		}

		// Map range from [1..0] to [0..1].
		return 1 - t;
	}
}

export class SpringSolverSimple {
	private m_w0: number;
	private m_zeta: number;
	private m_wd: number;
	private m_A: number;
	private m_B: number;

	constructor(duration: number, bounce: number) {
		let mass = 1;
		let stiffness = Math.pow((2 * Math.PI) / duration, 2);
		let damping =
			bounce < 0
				? (4 * Math.PI) / (duration + 4 * Math.PI * bounce)
				: 1 - (4 * Math.PI * bounce) / duration;
		let initialVelocity = 0;

		this.m_w0 = Math.sqrt(stiffness / mass);
		this.m_zeta = damping / (2 * Math.sqrt(stiffness * mass));
		if (this.m_zeta < 1) {
			// Under-damped.
			this.m_wd = this.m_w0 * Math.sqrt(1 - this.m_zeta * this.m_zeta);
			this.m_A = 1;
			this.m_B = (this.m_zeta * this.m_w0 + -initialVelocity) / this.m_wd;
		} else {
			// Critically damped (ignoring over-damped case for now).
			this.m_wd = 0;
			this.m_A = 1;
			this.m_B = -initialVelocity + this.m_w0;
		}
	}

	public solve(t: number): number {
		if (this.m_zeta < 1) {
			// Under-damped
			t =
				Math.exp(-t * this.m_zeta * this.m_w0) *
				(this.m_A * Math.cos(this.m_wd * t) + this.m_B * Math.sin(this.m_wd * t));
		} else {
			// Critically damped (ignoring over-damped case for now).
			t = (this.m_A + this.m_B * t) * Math.exp(-t * this.m_w0);
		}

		// Map range from [1..0] to [0..1].
		return 1 - t;
	}
}

interface SpringOptions {
	mass: number;
	stiffness: number;
	damping: number;
	initialVelocity: number;
}

export class SpringSolverCustom2 {
	private m_w0: number;
	private m_zeta: number;
	private m_wd: number;
	private m_A: number;
	private m_B: number;
	private initialValue: number = 0;
	private targetValue: number = 0;
	private startTime: number = performance.now(); // Initialize to ensure it's always defined

	constructor({
		mass,
		stiffness,
		damping,
		initialVelocity
	}: {
		mass: number;
		stiffness: number;
		damping: number;
		initialVelocity: number;
	}) {
		this.m_w0 = Math.sqrt(stiffness / mass);
		this.m_zeta = damping / (2 * Math.sqrt(stiffness * mass));

		if (this.m_zeta < 1) {
			this.m_wd = this.m_w0 * Math.sqrt(1 - this.m_zeta ** 2);
			this.m_A = 1;
			this.m_B = initialVelocity / this.m_wd;
		} else {
			this.m_wd = 0;
			this.m_A = 1;
			this.m_B = initialVelocity + this.m_w0;
		}
	}

	public setTarget(target: number, initial: number) {
		this.targetValue = target;
		this.initialValue = initial;
		this.startTime = performance.now();
	}

	public getCurrentValue(): number {
		// Method to safely access the target value
		return this.targetValue;
	}

	public solve(): number {
		const t = (performance.now() - this.startTime) / 1000;
		if (this.m_zeta < 1) {
			return (
				(1 -
					Math.exp(-t * this.m_zeta * this.m_w0) *
						(this.m_A * Math.cos(this.m_wd * t) + this.m_B * Math.sin(this.m_wd * t))) *
					(this.targetValue - this.initialValue) +
				this.initialValue
			);
		} else {
			return (
				(1 - (this.m_A + this.m_B * t) * Math.exp(-t * this.m_w0)) *
					(this.targetValue - this.initialValue) +
				this.initialValue
			);
		}
	}
}

export function customSpring(
	initialValue: number,
	opts: { mass: number; stiffness: number; damping: number; initialVelocity: number }
): {
	subscribe: Writable<number>['subscribe'];
	set: (value: number) => void;
} {
	const springSolver = new SpringSolverCustom2(opts);
	const store = writable<number>(initialValue);

	let lastValue = initialValue; // Track the last value for initializing new animations

	function animate() {
		const currentValue = springSolver.solve();
		lastValue = currentValue; // Update last value
		store.set(currentValue);
		if (Math.abs(currentValue - springSolver.getCurrentValue()) > 1) {
			requestAnimationFrame(animate);
		}
	}

	function set(newValue: number): void {
		springSolver.setTarget(newValue, lastValue);
		requestAnimationFrame(animate);
	}

	return {
		subscribe: store.subscribe,
		set
	};
}

const springSolver = new SpringSolverCustom({
	mass: 0.4,
	stiffness: 30,
	damping: 300,
	initialVelocity: 1
});

export const springEasingFunction = (t: number) => springSolver.solve(t);
