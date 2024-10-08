import PropTypes from 'prop-types';
import {createTheme, ThemeProvider} from '@mui/material/styles';

import {inputsCustomizations} from './customizations/inputs';
import {dataDisplayCustomizations} from './customizations/dataDisplay';
import {feedbackCustomizations} from './customizations/feedback';
import {navigationCustomizations} from './customizations/navigation';
import {surfacesCustomizations} from './customizations/surfaces';
import {colorSchemes, shadows, shape, typography} from './themePrimitives';
import {Fragment, useMemo} from "react";

function AppTheme({children, disableCustomTheme, themeComponents}) {
	const theme = useMemo(() => {
		return disableCustomTheme
			? {}
			: createTheme({
				// For more details about CSS variables configuration, see https://mui.com/material-ui/customization/css-theme-variables/configuration/
				cssVariables: {
					colorSchemeSelector: 'data-mui-color-scheme',
					cssVarPrefix: 'template',
				},
				colorSchemes, // Recently added in v6 for building light & dark mode app, see https://mui.com/material-ui/customization/palette/#color-schemes
				typography,
				shadows,
				shape,
				components: {
					...inputsCustomizations,
					...dataDisplayCustomizations,
					...feedbackCustomizations,
					...navigationCustomizations,
					...surfacesCustomizations,
					...themeComponents,
				},
			});
	}, [disableCustomTheme, themeComponents]);
	if (disableCustomTheme) {
		return <Fragment>{children}</Fragment>;
	}
	return (
		<ThemeProvider theme={theme} disableTransitionOnChange>
			{children}
		</ThemeProvider>
	);
}

AppTheme.propTypes = {
	children: PropTypes.node,
	/**
	 * This is for the docs site. You can ignore it or remove it.
	 */
	disableCustomTheme: PropTypes.bool,
	themeComponents: PropTypes.object,
};

export default AppTheme;
