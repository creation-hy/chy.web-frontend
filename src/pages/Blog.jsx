import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {AppAppBar, AppBarInit} from 'src/components/AppAppBar';
import MainContent from 'src/components/MainContent';
import Latest from 'src/components/Latest';
import Footer from 'src/components/Footer';

import getCustomTheme from 'src/theme/getCustomTheme.jsx';

export default function Blog() {
	document.title = "Blog - chy.web"
	
	const [mode, toggleColorMode] = AppBarInit();
	const theme = createTheme(getCustomTheme(mode));
	
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline enableColorScheme/>
			<AppAppBar mode={mode} toggleColorMode={toggleColorMode}/>
			<Container
				maxWidth="lg"
				component="main"
				sx={{display: 'flex', flexDirection: 'column', my: 16, gap: 4}}
			>
				<MainContent/>
				<Latest/>
			</Container>
			<Footer/>
		</ThemeProvider>
	);
}
