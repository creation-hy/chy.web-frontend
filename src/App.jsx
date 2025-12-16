import './App.css'
import {Outlet, RouterProvider, ScrollRestoration} from "react-router-dom";
import Chat, {ChatNotificationClient} from "src/pages/Chat.jsx";
import User from "src/pages/User.jsx";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {SnackbarProvider} from "notistack";
import CssBaseline from "@mui/material/CssBaseline";
import getDefaultTheme from "src/theme/getDefaultTheme.jsx";
import {useBinaryColorMode} from "src/components/ColorMode.jsx";
import {useLayoutEffect, useRef, useState} from "react";
import {Fab, useMediaQuery, useScrollTrigger, Zoom} from "@mui/material";
import {createBrowserRouter, useLocation} from "react-router";
import {MobileAppBar, PCAppBarLeft} from "src/components/AppAppBar.jsx";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import {KeyboardArrowUpOutlined} from "@mui/icons-material";
import SignUp from "src/pages/SignUp.jsx";
import AIArt from "src/pages/AIArt.jsx";
import {Chybench} from "src/pages/chybench/Chybench.jsx";
import {Minesweeper} from "src/pages/minesweeper/Minesweeper.jsx";
import Posts from "src/pages/Posts.jsx";
import {Settings} from "src/pages/Settings.jsx";
import SignIn from "src/pages/sign-in/SignIn.jsx";
import Error from "src/pages/Error.jsx";
import Grid from "@mui/material/Grid";
import {ClientUserProvider} from "src/components/ClientUser.jsx";
import axios from "axios";
import {DrugWiki} from "src/pages/DrugWiki.jsx";

const Layout = () => {
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
	const scrollComponentRef = useRef(null);
	
	const [lockHeight, setLockHeight] = useState(false);
	
	const pathname = useLocation().pathname;
	
	const scrollTrigger = useScrollTrigger({
		target: window,
		disableHysteresis: true,
		threshold: 100,
	});
	
	useLayoutEffect(() => {
		if (pathname === "/" || pathname.startsWith("/chat")) {
			setLockHeight(true);
		} else {
			setLockHeight(false);
		}
	}, [pathname]);
	
	return (
		<ClientUserProvider>
			<Grid container direction={isSmallScreen ? "column" : "row"} maxWidth={1425} mx="auto" minHeight="100%" height={lockHeight ? "100%" : "auto"}>
				<ScrollRestoration/>
				<ChatNotificationClient/>
				{!isSmallScreen && (
					<Box width={225} component="header">
						<PCAppBarLeft/>
					</Box>
				)}
				{isSmallScreen && <MobileAppBar/>}
				<Container
					component="main"
					maxWidth="lg"
					sx={{
						display: 'flex',
						flexDirection: 'column',
						flex: 1,
						minHeight: 0,
						height: lockHeight ? "100%" : "auto",
						overflow: "auto",
						borderRight: 1,
						borderColor: "divider",
					}}
				>
					{!isSmallScreen && <Box minHeight={16}/>}
					<Outlet/>
					<Box minHeight={16}/>
				</Container>
				<Zoom in={scrollTrigger}>
					<Box
						ref={scrollComponentRef}
						onClick={() => {
							window.scrollTo({top: 0, behavior: "smooth"});
						}}
						sx={{
							position: "fixed",
							bottom: 25,
							right: 25,
							zIndex: 1,
						}}
					>
						<Fab size="small" aria-label="scroll back to top">
							<KeyboardArrowUpOutlined/>
						</Fab>
					</Box>
				</Zoom>
			</Grid>
		</ClientUserProvider>
	)
}

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout/>,
		children: [
			{path: "/", element: <Chat/>},
			{path: "/chat", element: <Chat/>},
			{path: "/chat/:username", element: <Chat/>},
			{path: "/user/:username", element: <User/>},
			{path: "/user/:username/:tab", element: <User/>},
			{path: "/login", element: <SignIn/>},
			{path: "/register", element: <SignUp/>},
			{path: "/ai-art", element: <AIArt/>},
			{path: "/ai-art/:tab", element: <AIArt/>},
			{path: "/chybench", element: <Chybench/>},
			{path: "/chybench/ranking", element: <Chybench showRanking/>},
			{path: "/chybench/ranking/page/:pageNumber", element: <Chybench showRanking/>},
			{path: "/minesweeper", element: <Minesweeper/>},
			{path: "/minesweeper/ranking", element: <Minesweeper showRanking/>},
			{path: "/settings", element: <Settings/>},
			{path: "/settings/:item1", element: <Settings/>},
			{path: "/settings/:item1/:item2", element: <Settings/>},
			{path: "/posts", element: <Posts/>},
			{path: "/posts/:tab", element: <Posts/>},
			{path: "/drugs", element: <DrugWiki/>},
			{path: "/drugs/:id", element: <DrugWiki/>},
			{path: "*", element: <Error/>},
		],
	},
]);

export default function App() {
	const [binaryColorMode] = useBinaryColorMode();
	
	const authToken = localStorage.getItem("auth_token");
	
	if (authToken) {
		axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
	}
	
	return (
		<ThemeProvider theme={createTheme(getDefaultTheme(binaryColorMode))}>
			<SnackbarProvider/>
			<CssBaseline enableColorScheme/>
			<RouterProvider router={router}/>
		</ThemeProvider>
	);
}