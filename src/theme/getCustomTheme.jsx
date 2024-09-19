import {getDesignTokens} from './themePrimitives';
import {dataDisplayCustomizations, feedbackCustomizations, inputsCustomizations, navigationCustomizations, surfacesCustomizations,} from './customizations';

export default function getCustomTheme(mode) {
	return {
		...getDesignTokens(mode),
		components: {
			...inputsCustomizations,
			...dataDisplayCustomizations,
			...feedbackCustomizations,
			...navigationCustomizations,
			...surfacesCustomizations,
		},
	};
}
