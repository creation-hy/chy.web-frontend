import {getDesignTokens} from './themePrimitives';

export default function getDefaultTheme(mode) {
	return {
		...getDesignTokens(mode)
	};
}
