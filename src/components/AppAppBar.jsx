import * as React from 'react';
import {useEffect, useState} from 'react';
import {alpha, styled} from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ToggleColorMode from "./ToggleColorMode.jsx";
import PropTypes from "prop-types";
import Avatar from "@mui/material/Avatar";
import axios from "axios";
import Grid from "@mui/material/Grid2";
import Cookies from "js-cookie";

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

export function AppBarInit() {
	if (localStorage.getItem('themeMode') == null)
		localStorage.setItem('themeMode', 'light');
	const [mode, setMode] = useState(localStorage.getItem('themeMode'));
	
	React.useEffect(() => {
		const savedMode = localStorage.getItem('themeMode');
		if (savedMode) {
			setMode(savedMode);
		} else {
			const systemPrefersDark = window.matchMedia(
				'(prefers-color-scheme: dark)',
			).matches;
			setMode(systemPrefersDark ? 'dark' : 'light');
		}
	}, []);
	
	const toggleColorMode = () => {
		const newMode = mode === 'dark' ? 'light' : 'dark';
		setMode(newMode);
		localStorage.setItem('themeMode', newMode);
	};
	
	return [mode, toggleColorMode];
}

const relocate = (event) => {
	window.location.href = event.currentTarget.getAttribute('data-url');
}

export function AppAppBar({mode, toggleColorMode}) {
	const [open, setOpen] = useState(false);
	
	const toggleDrawer = (newOpen) => () => {
		setOpen(newOpen);
	};
	
	const [username, setUsername] = useState(null);
	
	useEffect(() => {
		axios.get("/api/account/check").then(res => {
			const data = res.data;
			if (data["status"] === 1)
				setUsername(data["username"]);
			else {
				setUsername("");
				Cookies.remove("username");
				Cookies.remove("user_token");
			}
		});
	}, []);
	
	return (
		<AppBar
			position="fixed"
			sx={{boxShadow: 0, bgcolor: 'transparent', backgroundImage: 'none', mt: 3}}
		>
			<Container maxWidth="lg">
				<StyledToolbar variant="dense" disableGutters>
					<Box sx={{flexGrow: 1, display: 'flex', alignItems: 'center', px: 0}}>
						<Box sx={{display: {xs: 'none', md: 'flex'}}}>
							<Avatar src="/favicon.ico" sx={{width: 35, height: 35, mr: 1}}/>
							<Button variant="text" color="info" size="small" onClick={relocate} data-url="/">
								首页
							</Button>
							<Button variant="text" color="info" size="small" onClick={relocate} data-url="/chat">
								聊天
							</Button>
							<Button variant="text" color="info" size="small" onClick={relocate} data-url="/ai-draw">
								AI绘图
							</Button>
							<Button variant="text" color="info" size="small" onClick={relocate} data-url="/greedysnake">
								贪吃蛇
							</Button>
							<Button variant="text" color="info" size="small" onClick={relocate} data-url="/sgs">
								三国杀
							</Button>
							<Button variant="text" color="info" size="small" onClick={relocate} data-url="/minesweeper">
								扫雷
							</Button>
							<Button variant="text" color="info" size="small" onClick={relocate} data-url="/chybench">
								ChyBench
							</Button>
							<Button variant="text" color="info" size="small" onClick={relocate} data-url="/bbs">
								BBS
							</Button>
							<Button variant="text" color="info" size="small" onClick={relocate} data-url="/blog">
								Blog
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
						{username === "" ? (
							<Box>
								<Button color="primary" variant="text" size="small" onClick={relocate} data-url="/login">
									登陆
								</Button>
								<Button color="primary" variant="contained" size="small" onClick={relocate} data-url="/register">
									注册
								</Button>
							</Box>
						) : (username != null ? (
							<Box>
								<Avatar
									src={"/usericon/" + username + ".png"}
									sx={{width: 35, height: 35, cursor: "pointer"}}
									onClick={relocate}
									data-url={"/user/" + username}
								/>
							</Box>
						) : (<Box/>))}
						<ToggleColorMode
							data-screenshot="toggle-mode"
							mode={mode}
							toggleColorMode={toggleColorMode}
						/>
					</Box>
					<Box sx={{display: {sm: 'flex', md: 'none'}}}>
						<Grid container spacing={1} justify="center" alignItems="center">
							<ToggleColorMode
								data-screenshot="toggle-mode"
								mode={mode}
								toggleColorMode={toggleColorMode}
							/>
							<IconButton aria-label="Menu button" onClick={toggleDrawer(true)} sx={{width: 36, height: 36}}>
								<MenuIcon/>
							</IconButton>
						</Grid>
						<Drawer anchor="top" open={open} onClose={toggleDrawer(false)}>
							<Box sx={{p: 2, backgroundColor: 'background.default'}}>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<IconButton onClick={toggleDrawer(false)}>
										<CloseRoundedIcon/>
									</IconButton>
								</Box>
								<Divider sx={{my: 3}}/>
								<Button variant="text" color="info" size="small" onClick={relocate} data-url="/">
									首页
								</Button>
								<Button variant="text" color="info" size="small" onClick={relocate} data-url="/chat">
									聊天
								</Button>
								<Button variant="text" color="info" size="small" onClick={relocate} data-url="/ai-draw">
									AI绘图
								</Button>
								<Button variant="text" color="info" size="small" onClick={relocate} data-url="/greedysnake">
									贪吃蛇
								</Button>
								<Button variant="text" color="info" size="small" onClick={relocate} data-url="/sgs">
									三国杀
								</Button>
								<Button variant="text" color="info" size="small" onClick={relocate} data-url="/minesweeper">
									扫雷
								</Button>
								<Button variant="text" color="info" size="small" onClick={relocate} data-url="/chybench">
									ChyBench
								</Button>
								<Button variant="text" color="info" size="small" onClick={relocate} data-url="/bbs">
									BBS
								</Button>
								<Button variant="text" color="info" size="small" onClick={relocate} data-url="/blog">
									Blog
								</Button>
								
								{username === "" ? (
									<Box>
										<MenuItem>
											<Button color="primary" variant="contained" fullWidth onClick={relocate} data-url="/register">
												注册
											</Button>
										</MenuItem>
										<MenuItem>
											<Button color="primary" variant="outlined" fullWidth onClick={relocate} data-url="/login">
												登录
											</Button>
										</MenuItem>
									</Box>
								) : (username != null ? (
									<Box display="flex" justifyContent="center">
										<Avatar src={"/usericon/" + username + ".png"} sx={{width: 35, height: 35, mt: 1, cursor: "pointer"}} onClick={relocate}
										        data-url={"/user/" + username}/>
									</Box>
								) : (<Box/>))}
							</Box>
						</Drawer>
					</Box>
				</StyledToolbar>
			</Container>
		</AppBar>
	);
}

AppAppBar.propTypes = {
	mode: PropTypes.oneOf(['dark', 'light']).isRequired,
	toggleColorMode: PropTypes.func.isRequired
};