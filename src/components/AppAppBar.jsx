import {useState} from 'react';
import {alpha, styled} from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from "@mui/material/Avatar";
import axios from "axios";
import Grid from "@mui/material/Grid2";
import {List, ListItemButton, ListItemIcon, ListItemText, SwipeableDrawer} from "@mui/material";
import {Analytics, Article, Chat, DarkMode, Draw, Forum, Games, Home, Leaderboard, LightMode} from "@mui/icons-material";
import {useQuery} from "@tanstack/react-query";
import {isMobile} from "react-device-detect";
import {useColorMode} from "src/components/ColorMode.jsx";

const StyledToolbar = styled(Toolbar)(({theme}) => ({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	flexShrink: 0,
	borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
	backdropFilter: 'blur(24px)',
	border: '1px solid',
	borderColor: theme.palette.divider,
	backgroundColor: alpha(theme.palette.background.default, 0.4),
	boxShadow: theme.shadows[1],
	padding: '8px 12px',
}));

export const AppAppBar = () => {
	const [open, setOpen] = useState(false);
	const [colorMode, toggleColorMode] = useColorMode();
	
	const toggleDrawer = (newOpen) => () => {
		setOpen(newOpen);
	};
	
	const {data, isLoading, error} = useQuery({
		queryKey: ["accountCheck"],
		queryFn: () => axios.get("/api/account/check").then(res => res.data),
	});
	
	return (
		<AppBar
			position="sticky"
			id="app-bar"
			sx={{boxShadow: 0, bgcolor: 'transparent', backgroundImage: 'none', top: 0, py: isMobile ? 2 : 3}}
		>
			<Container maxWidth="lg">
				<StyledToolbar variant="dense" disableGutters>
					<Box sx={{flexGrow: 1, display: 'flex', alignItems: 'center', px: 0}}>
						<Box sx={{display: {xs: 'none', md: 'flex'}}}>
							<Avatar src="/favicon.ico" sx={{width: 35, height: 35, mr: 1}}/>
							<Button variant="text" href="/">
								首页
							</Button>
							<Button variant="text" href="/chat">
								聊天
							</Button>
							<Button variant="text" href="/ai-draw">
								AI绘图
							</Button>
							<Button variant="text" href="https://creation-hy.top:8080/greedy-snake">
								贪吃蛇
							</Button>
							<Button variant="text" href="https://creation-hy.top:8080/sgs">
								三国杀
							</Button>
							<Button variant="text" href="/minesweeper">
								扫雷
							</Button>
							<Button variant="text" href="/chybench" sx={{textTransform: "none", px: 1}}>
								Chybench
							</Button>
							<Button variant="text" href="https://creation-hy.top:8080/bbs">
								BBS
							</Button>
							<Button variant="text" href="/blog" sx={{textTransform: "none"}}>
								Blog
							</Button>
							<Button variant="text" href="/ranking">
								排行榜
							</Button>
						</Box>
					</Box>
					<Box
						sx={{
							display: {xs: 'none', md: 'flex'},
							gap: 1,
							alignItems: 'center',
						}}
					>
						{!isLoading && !error && data["status"] === 0 ? (
							<Box>
								<Button variant="text" href="/login">
									登陆
								</Button>
								<Button variant="contained" href="/register">
									注册
								</Button>
							</Box>
						) : (!isLoading && !error ? (
							<Box>
								<IconButton sx={{width: 35, height: 35}} href={"/user/" + data.username}>
									<Avatar sx={{width: 35, height: 35}} alt={data.username} src={"/usericon/" + data.username + ".png"}/>
								</IconButton>
							</Box>
						) : (<Box/>))}
						<IconButton color="primary" size="small" onClick={toggleColorMode}>
							{colorMode === "light" ? <LightMode fontSize="small"/> : <DarkMode fontSize="small"/>}
						</IconButton>
					</Box>
					<Box sx={{display: {sm: 'flex', md: 'none'}}}>
						<Grid container spacing={1} justify="center" alignItems="center">
							<IconButton size="small" onClick={toggleColorMode}>
								{colorMode === "light" ? <LightMode fontSize="small"/> : <DarkMode fontSize="small"/>}
							</IconButton>
							<IconButton aria-label="Menu button" onClick={toggleDrawer(true)} sx={{width: 36, height: 36}}>
								<MenuIcon/>
							</IconButton>
						</Grid>
						<SwipeableDrawer anchor="left" open={open} onOpen={toggleDrawer(true)} onClose={toggleDrawer(false)}>
							<Box sx={{backgroundColor: 'background.default', minHeight: "100%", width: 250}}>
								<Box sx={{mt: 2.5, mb: 1.5}}>
									{!isLoading && !error && data["status"] === 0 ? (
										<Grid container direction="column" gap={1.5}>
											<Button variant="contained" href="/register" sx={{mx: 2}}>
												注册
											</Button>
											<Button variant="outlined" href="/login" sx={{mx: 2}}>
												登录
											</Button>
										</Grid>
									) : (!isLoading && !error ? (
										<Box display="flex" justifyContent="center">
											<IconButton sx={{width: 50, height: 50}} href={"/user/" + data.username}>
												<Avatar sx={{width: 50, height: 50}} alt={data.username} src={"/usericon/" + data.username + ".png"}/>
											</IconButton>
										</Box>
									) : <Box/>)}
								</Box>
								<List sx={{width: "100%"}}>
									<ListItemButton href="/">
										<ListItemIcon>
											<Home/>
										</ListItemIcon>
										<ListItemText primary="首页"/>
									</ListItemButton>
									<ListItemButton href="/chat">
										<ListItemIcon>
											<Chat/>
										</ListItemIcon>
										<ListItemText primary="聊天"/>
									</ListItemButton>
									<ListItemButton href="/ai-draw">
										<ListItemIcon>
											<Draw/>
										</ListItemIcon>
										<ListItemText primary="AI绘图"/>
									</ListItemButton>
									<ListItemButton href="https://creation-hy.top:8080/greedy-snake">
										<ListItemIcon>
											<Games/>
										</ListItemIcon>
										<ListItemText primary="贪吃蛇"/>
									</ListItemButton>
									<ListItemButton href="https://creation-hy.top:8080/sgs">
										<ListItemIcon>
											<Games/>
										</ListItemIcon>
										<ListItemText primary="三国杀"/>
									</ListItemButton>
									<ListItemButton href="/minesweeper">
										<ListItemIcon>
											<Games/>
										</ListItemIcon>
										<ListItemText primary="扫雷"/>
									</ListItemButton>
									<ListItemButton href="/chybench">
										<ListItemIcon>
											<Analytics/>
										</ListItemIcon>
										<ListItemText primary="Chybench"/>
									</ListItemButton>
									<ListItemButton href="https://creation-hy.top:8080/bbs">
										<ListItemIcon>
											<Forum/>
										</ListItemIcon>
										<ListItemText primary="BBS"/>
									</ListItemButton>
									<ListItemButton href="/blog">
										<ListItemIcon>
											<Article/>
										</ListItemIcon>
										<ListItemText primary="Blog"/>
									</ListItemButton>
									<ListItemButton href="/ranking">
										<ListItemIcon>
											<Leaderboard/>
										</ListItemIcon>
										<ListItemText primary="排行榜"/>
									</ListItemButton>
								</List>
							</Box>
						</SwipeableDrawer>
					</Box>
				</StyledToolbar>
			</Container>
		</AppBar>
	);
}