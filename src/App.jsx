import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Blog from "src/pages/Blog.jsx";
import SignIn from "src/pages/sign-in/SignIn.jsx";
import SignUp from "src/pages/SignUp.jsx";
import Chat, {ChatNotificationClient} from "src/pages/Chat.jsx";
import User from "src/pages/User.jsx";
import AIArt from "src/pages/AIArt.jsx";
import Container from "@mui/material/Container";
import {MobileAppBar, PCAppBarLeft} from "src/components/AppAppBar.jsx";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {SnackbarProvider} from "notistack";
import CssBaseline from "@mui/material/CssBaseline";
import Chybench from "src/pages/chybench/Chybench.jsx";
import ChybenchRanking from "src/pages/chybench/ChybenchRanking.jsx";
import Error from "src/pages/Error.jsx";
import Minesweeper from "src/pages/minesweeper/Minesweeper.jsx";
import Box from "@mui/material/Box";
import getDefaultTheme from "src/theme/getDefaultTheme.jsx";
import {useBinaryColorMode} from "src/components/ColorMode.jsx";
import Start from "src/pages/Start.jsx";
import {memo, useEffect, useRef, useState} from "react";
import {Fab, useMediaQuery, Zoom} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {KeyboardArrowUpOutlined} from "@mui/icons-material";

const PageContainer = memo(function PageContainer() {
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
	const containerRef = useRef(null);
	const scrollComponentRef = useRef(null);
	
	const [scrollTrigger, setScrollTrigger] = useState(false);
	
	const handleClick = () => {
		containerRef.current.scrollTo({top: 0, behavior: "smooth"});
	};
	
	useEffect(() => {
		containerRef.current.addEventListener("scroll", () => {
			if (containerRef.current.scrollTop >= 100)
				setScrollTrigger(true);
			else
				setScrollTrigger(false);
			scrollComponentRef.current.style.right = window.innerWidth - containerRef.current.clientWidth - containerRef.current.offsetLeft + 25 + "px";
		});
	}, []);
	
	return (
		<Grid container width="100%" height="100%" overflow="hidden" justifyContent="center">
			<BrowserRouter>
				<ChatNotificationClient/>
				{!isSmallScreen && <PCAppBarLeft/>}
				<Box ref={containerRef} display="flex" flexDirection="column" sx={{height: "100%", maxWidth: 1200, flex: 1, overflow: "auto"}}>
					{isSmallScreen && <MobileAppBar/>}
					<Container
						maxWidth="lg"
						component="main"
						sx={{
							display: 'flex',
							flexDirection: 'column',
							flex: 1,
							minHeight: 0,
						}}
					>
						{!isSmallScreen && <Box minHeight={16}/>}
						<Routes>
							<Route path="/" element={<Chat/>}/>
							<Route path="/about" element={<Start/>}/>
							<Route path="/blog" element={<Blog/>}/>
							<Route path="/login" element={<SignIn/>}/>
							<Route path="/register" element={<SignUp/>}/>
							<Route path="/user/:username" element={<User/>}/>
							<Route path="/user/:username/:tab" element={<User/>}/>
							<Route path="/ai-art" element={<AIArt/>}/>
							<Route path="/ai-art/:tab" element={<AIArt/>}/>
							<Route path="/chybench" element={<Chybench/>}/>
							<Route path="/chybench/ranking" element={<ChybenchRanking/>}/>
							<Route path="/minesweeper" element={<Minesweeper/>}/>
							<Route path="/chat" element={<Chat/>}/>
							<Route path="/chat/:username" element={<Chat/>}/>
							<Route path="*" element={<Error/>}/>
						</Routes>
						<Box minHeight={16}/>
					</Container>
					<Zoom in={scrollTrigger}>
						<Box
							ref={scrollComponentRef}
							onClick={handleClick}
							role="presentation"
							sx={{
								position: "absolute",
								bottom: 25,
								zIndex: 1
							}}
						>
							<Fab size="small" aria-label="scroll back to top">
								<KeyboardArrowUpOutlined/>
							</Fab>
						</Box>
					</Zoom>
				</Box>
			</BrowserRouter>
		</Grid>
	);
});

export default function App() {
	const [binaryColorMode] = useBinaryColorMode();
	
	return (
		<ThemeProvider theme={createTheme(getDefaultTheme(binaryColorMode))}>
			<SnackbarProvider/>
			<CssBaseline enableColorScheme/>
			<PageContainer/>
		</ThemeProvider>
	);
}