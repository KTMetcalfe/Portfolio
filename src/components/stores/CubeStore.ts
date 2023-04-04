import { writable } from 'svelte/store';

const createCubeStore = () => {
	const { subscribe, set, update } = writable<
		Set<{ x: number; y: number; z: number; color?: string }>
	>(new Set());

	return {
		subscribe,
		add: (x: number, y: number, z: number, color?: string) =>
			update((state) => {
				state.add({ x, y, z, color});
				return state;
			}),
		remove: (x: number, y: number, z: number) =>
			update((state) => {
				state = new Set([...state].filter((cube) => cube.x !== x || cube.y !== y || cube.z !== z));
				return state;
			}),
		clear: () => set(new Set())
	};
};

export const CubeStore = createCubeStore();
