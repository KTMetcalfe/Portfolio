import { vitePreprocess } from '@astrojs/svelte';
import seqPreprocessor from 'svelte-sequential-preprocessor'
import { preprocessThrelte } from '@threlte/preprocess'

export default {
	preprocess: seqPreprocessor([vitePreprocess(), preprocessThrelte()]),
};
