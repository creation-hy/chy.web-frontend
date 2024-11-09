import {alpha, createTheme} from '@mui/material/styles';

const defaultTheme = createTheme();

const customShadows = [...defaultTheme.shadows];

export const gray = {
	50: 'hsl(220, 35%, 97%)',
	100: 'hsl(220, 30%, 94%)',
	200: 'hsl(220, 20%, 88%)',
	300: 'hsl(220, 20%, 80%)',
	400: 'hsl(220, 20%, 65%)',
	500: 'hsl(220, 20%, 42%)',
	600: 'hsl(220, 20%, 35%)',
	700: 'hsl(220, 20%, 25%)',
	800: 'hsl(220, 30%, 6%)',
	900: 'hsl(220, 35%, 3%)',
};

export const green = {
	50: 'hsl(120, 80%, 98%)',
	100: 'hsl(120, 75%, 94%)',
	200: 'hsl(120, 75%, 87%)',
	300: 'hsl(120, 61%, 77%)',
	400: 'hsl(120, 44%, 53%)',
	500: 'hsl(120, 59%, 30%)',
	600: 'hsl(120, 70%, 25%)',
	700: 'hsl(120, 75%, 16%)',
	800: 'hsl(120, 84%, 10%)',
	900: 'hsl(120, 87%, 6%)',
};

export const orange = {
	50: 'hsl(45, 100%, 97%)',
	100: 'hsl(45, 92%, 90%)',
	200: 'hsl(45, 94%, 80%)',
	300: 'hsl(45, 90%, 65%)',
	400: 'hsl(45, 90%, 40%)',
	500: 'hsl(45, 90%, 35%)',
	600: 'hsl(45, 91%, 25%)',
	700: 'hsl(45, 94%, 20%)',
	800: 'hsl(45, 95%, 16%)',
	900: 'hsl(45, 93%, 12%)',
};

export const red = {
	50: 'hsl(0, 100%, 97%)',
	100: 'hsl(0, 92%, 90%)',
	200: 'hsl(0, 94%, 80%)',
	300: 'hsl(0, 90%, 65%)',
	400: 'hsl(0, 90%, 40%)',
	500: 'hsl(0, 90%, 30%)',
	600: 'hsl(0, 91%, 25%)',
	700: 'hsl(0, 94%, 18%)',
	800: 'hsl(0, 95%, 12%)',
	900: 'hsl(0, 93%, 6%)',
};

export const getDesignTokens = (mode) => {
	return {
		palette: {
			mode,
			divider: mode === 'dark' ? alpha(gray[700], 0.6) : alpha(gray[300], 0.4),
			background: {
				default: 'hsl(0, 0%, 99%)',
				paper: 'hsl(220, 35%, 97%)',
				...(mode === 'dark' && {default: gray[900], paper: 'hsl(220, 30%, 7%)'}),
			},
			text: {
				primary: gray[800],
				secondary: gray[600],
				warning: orange[400],
				...(mode === 'dark' && {
					primary: 'hsl(0, 0%, 100%)',
					secondary: gray[400],
				}),
			},
			action: {
				hover: alpha(gray[200], 0.2),
				selected: `${alpha(gray[200], 0.3)}`,
				...(mode === 'dark' && {
					hover: alpha(gray[600], 0.2),
					selected: alpha(gray[600], 0.3),
				}),
			},
		},
		typography: {
			fontFamily: "-apple-system, system-ui, Helvetica, Arial, PingFang SC, sans-serif",
		},
		shape: {
			borderRadius: 8,
		},
		shadows: customShadows,
	};
};