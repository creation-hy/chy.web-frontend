import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Blog from "src/pages/Blog.jsx";
import SignIn from "src/pages/sign-in/SignIn.jsx";
import SignUp from "src/pages/SignUp.jsx";
import Chat from "src/pages/Chat.jsx";
import User from "src/pages/User.jsx";
import AIArt from "src/pages/AIArt.jsx";
import Container from "@mui/material/Container";
import {AppAppBar} from "src/components/AppAppBar.jsx";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {SnackbarProvider} from "notistack";
import CssBaseline from "@mui/material/CssBaseline";
import Ranking from "src/pages/Ranking.jsx";
import Chybench from "src/pages/chybench/Chybench.jsx";
import ChybenchRanking from "src/pages/chybench/ChybenchRanking.jsx";
import Error from "src/pages/Error.jsx";
import Minesweeper from "src/pages/minesweeper/Minesweeper.jsx";
import Box from "@mui/material/Box";
import getDefaultTheme from "src/theme/getDefaultTheme.jsx";
import {useBinaryColorMode} from "src/components/ColorMode.jsx";
import Start from "src/pages/Start.jsx";
import {Fab, Fade, useScrollTrigger} from "@mui/material";
import {KeyboardArrowUpOutlined} from "@mui/icons-material";
import {isMobile} from "react-device-detect";

export default function App() {
	const [binaryColorMode] = useBinaryColorMode();
	
	const trigger = useScrollTrigger({
		target: window ? window : undefined,
		disableHysteresis: true,
		threshold: 100,
	});
	
	const handleClick = () => {
		window.scrollTo({top: 0, behavior: "smooth"});
	};
	
	return (
		<ThemeProvider theme={createTheme(getDefaultTheme(binaryColorMode))}>
			<SnackbarProvider/>
			<CssBaseline enableColorScheme/>
			<Fade in={trigger}>
				<Box
					onClick={handleClick}
					role="presentation"
					sx={{position: 'fixed', bottom: 25, right: 25, zIndex: 1}}
				>
					<Fab size="small" aria-label="scroll back to top">
						<KeyboardArrowUpOutlined/>
					</Fab>
				</Box>
			</Fade>
			<Box id="page-container" display="flex" flexDirection="column" sx={{minHeight: "100%", pb: isMobile ? 2 : 3}}>
				<AppAppBar/>
				<Container id="page-main" maxWidth="lg" component="main" sx={{display: 'flex', flexDirection: 'column', flex: 1}}>
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<Chat/>}/>
							<Route path="/about" element={<Start/>}/>
							<Route path="/blog" element={<Blog/>}/>
							<Route path="/login" element={<SignIn/>}/>
							<Route path="/register" element={<SignUp/>}/>
							<Route path="/user/:username" element={<User/>}/>
							<Route path="/ranking" element={<Ranking/>}/>
							<Route path="/ai-art" element={<AIArt/>}/>
							<Route path="/chybench" element={<Chybench/>}/>
							<Route path="/chybench/ranking" element={<ChybenchRanking/>}/>
							<Route path="/minesweeper" element={<Minesweeper/>}/>
							<Route path="/chat" element={<Chat/>}/>
							<Route path="/chat/:username" element={<Chat/>}/>
							<Route path="*" element={<Error/>}/>
						</Routes>
					</BrowserRouter>
				</Container>
			</Box>
		</ThemeProvider>
	);
}