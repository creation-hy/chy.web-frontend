import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Blog from "src/pages/Blog.jsx";
import SignIn from "src/pages/sign-in/SignIn.jsx";
import SignUp from "src/pages/SignUp.jsx";
import Chat from "src/pages/Chat.jsx";
import User from "src/pages/User.jsx";
import AIDraw from "src/pages/AIDraw.jsx";
import Container from "@mui/material/Container";
import {AppAppBar} from "src/components/AppAppBar.jsx";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {SnackbarProvider} from "notistack";
import CssBaseline from "@mui/material/CssBaseline";
import Footer from "src/components/Footer.jsx";
import Ranking from "src/pages/Ranking.jsx";
import AIDrawResult from "src/pages/AIDrawResult.jsx";
import Chybench from "src/pages/chybench/Chybench.jsx";
import ChybenchRanking from "src/pages/chybench/ChybenchRanking.jsx";
import Error from "src/pages/Error.jsx";
import Minesweeper from "src/pages/minesweeper/Minesweeper.jsx";
import Box from "@mui/material/Box";
import getDefaultTheme from "src/theme/getDefaultTheme.jsx";
import {useColorMode} from "src/components/ColorMode.jsx";
import Start from "src/pages/Start.jsx";

export default function App() {
	const [colorMode] = useColorMode();
	
	return (
		<ThemeProvider theme={createTheme(getDefaultTheme(colorMode))}>
			<SnackbarProvider/>
			<CssBaseline enableColorScheme/>
			<Box id="page-container" display="flex" flexDirection="column" sx={{minHeight: "100%"}}>
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
							<Route path="/ai-draw" element={<AIDraw/>}/>
							<Route path="/ai-draw/result" element={<AIDrawResult/>}/>
							<Route path="/chybench" element={<Chybench/>}/>
							<Route path="/chybench/ranking" element={<ChybenchRanking/>}/>
							<Route path="/minesweeper" element={<Minesweeper/>}/>
							<Route path="/chat" element={<Chat/>}/>
							<Route path="/chat/:username" element={<Chat/>}/>
							<Route path="*" element={<Error/>}/>
						</Routes>
					</BrowserRouter>
				</Container>
				<Footer/>
			</Box>
		</ThemeProvider>
	);
}