import {memo, useCallback, useState} from 'react';
import {alpha, styled} from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Grid from "@mui/material/Grid2";
import {Badge, ButtonBase, List, ListItemButton, ListItemIcon, ListItemText, SwipeableDrawer} from "@mui/material";
import {
	AnalyticsOutlined,
	ArticleOutlined,
	AutoAwesome,
	CalendarMonth,
	ChatBubbleOutline,
	DarkMode,
	DrawOutlined,
	EventAvailable,
	ForumOutlined,
	LightMode,
	SettingsOutlined,
	SportsEsportsOutlined
} from "@mui/icons-material";
import {useColorMode} from "src/components/ColorMode.jsx";
import {useClientUser} from "src/components/ClientUser.jsx";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {useLocation, useNavigate} from "react-router";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Cookies from "js-cookie";
import {UserAvatar, UserBadge, UsernameWithBadge} from "src/components/UserComponents.jsx";
import {NavigateLink} from "src/components/NavigateComponents.jsx";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import Avatar from "@mui/material/Avatar";

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

const myName = Cookies.get("username");
let myInformation = JSON.parse(localStorage.getItem("myInformation")) ?? {};

const LeftBar = memo(function LeftBar({navigateCallback}) {
	const [colorMode, toggleColorMode] = useColorMode();
	
	const {clientUser, isClientUserLoading, setClientUser} = useClientUser();
	const navigate = useNavigate();
	const firstLevelLocation = useLocation().pathname.split("/")[1];
	
	const navigateAndCloseDrawer = useCallback((event, url) => {
		if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
			event.preventDefault();
			navigate(url);
			if (navigateCallback) {
				navigateCallback();
			}
		}
	}, [navigate, navigateCallback]);
	
	if (clientUser) {
		myInformation.displayName = clientUser.displayName;
		myInformation.avatarVersion = clientUser.avatarVersion;
		myInformation.badge = clientUser.badge;
		myInformation.lastCheckInTime = clientUser.lastCheckInTime;
		localStorage.setItem("myInformation", JSON.stringify(myInformation));
	} else if (!isClientUserLoading) {
		myInformation = {};
		localStorage.setItem("myInformation", JSON.stringify(myInformation));
	}
	
	return (
		<>
			<Box sx={{mt: 2.5, mb: 1}}>
				{isClientUserLoading ? (
					(!myName ? (
						<Grid container direction="column" gap={1.5} sx={{mt: 7}}>
							<Button
								variant="contained"
								href="/register"
								onClick={(event) => navigateAndCloseDrawer(event, "/register")}
								sx={{mx: 2}}
							>
								注册
							</Button>
							<Button
								variant="outlined"
								href="/login"
								onClick={(event) => navigateAndCloseDrawer(event, "/login")}
								sx={{mx: 2}}
							>
								登录
							</Button>
						</Grid>
					) : (
						<Grid container direction="column" sx={{ml: 2.5, mr: 2.5}}>
							<IconButton
								sx={{width: 80, height: 80, mb: 0.75}}
								href={`/user/${myName}`}
								onClick={(event) => navigateAndCloseDrawer(event, `/user/${myName}`)}
							>
								<UserAvatar username={myName} displayName={myInformation.displayName}
								            avatarVersion={myInformation.avatarVersion} width={80} height={80}/>
							</IconButton>
							<Grid container alignItems="center" flexWrap="nowrap" gap={0.25} maxWidth="100%">
								<NavigateLink href={`/user/${myInformation.username}`} sx={{overflow: "hidden"}}>
									<Typography fontSize={18} fontWeight="bold" noWrap overflow="hidden" textOverflow="ellipsis" alignItems="center">
										{myInformation.displayName}
									</Typography>
								</NavigateLink>
								<UserBadge badge={myInformation.badge} fontSize={20}/>
							</Grid>
							<Typography fontSize={14} noWrap color="text.secondary" maxWidth="100%" overflow="hidden" textOverflow="ellipsis">
								@{myName}
							</Typography>
						</Grid>
					))
				) : (!clientUser ? (
					<Grid container direction="column" gap={1.5} sx={{mt: 7}}>
						<Button
							variant="contained"
							href="/register"
							onClick={(event) => navigateAndCloseDrawer(event, "/register")}
							sx={{mx: 2}}
						>
							注册
						</Button>
						<Button
							variant="outlined"
							href="/login"
							onClick={(event) => navigateAndCloseDrawer(event, "/login")}
							sx={{mx: 2}}
						>
							登录
						</Button>
					</Grid>
				) : (
					<Grid container direction="column" sx={{ml: 2.5, mr: 2.5}}>
						<IconButton
							sx={{width: 80, height: 80, mb: 0.75}}
							href={`/user/${clientUser.username}`}
							onClick={(event) => navigateAndCloseDrawer(event, `/user/${clientUser.username}`)}
						>
							<UserAvatar username={clientUser.username} displayName={clientUser.displayName}
							            avatarVersion={clientUser.avatarVersion} width={80} height={80}/>
						</IconButton>
						<Grid container alignItems="center" flexWrap="nowrap" gap={0.25} maxWidth="100%">
							<NavigateLink href={`/user/${clientUser.username}`} sx={{overflow: "hidden"}}>
								<Typography fontSize={18} fontWeight="bold" noWrap overflow="hidden" textOverflow="ellipsis" alignItems="center">
									{clientUser.displayName}
								</Typography>
							</NavigateLink>
							<UserBadge badge={clientUser.badge} fontSize={20}/>
						</Grid>
						<Typography fontSize={14} noWrap color="text.secondary" maxWidth="100%" overflow="hidden" textOverflow="ellipsis">
							@{clientUser.username}
						</Typography>
					</Grid>
				))}
			</Box>
			<List sx={{width: "100%"}}>
				<ListItemButton
					href="/"
					onClick={(event) => navigateAndCloseDrawer(event, "/")}
					selected={firstLevelLocation === "" || firstLevelLocation === "chat"}
				>
					<ListItemIcon>
						<Badge badgeContent={clientUser ? clientUser.newMessageCount : 0} color="error">
							<ChatBubbleOutline/>
						</Badge>
					</ListItemIcon>
					<ListItemText primary="Chat"/>
				</ListItemButton>
				<ListItemButton
					href="/ai-art"
					onClick={(event) => navigateAndCloseDrawer(event, "/ai-art")}
					selected={firstLevelLocation === "ai-art"}
				>
					<ListItemIcon>
						<DrawOutlined/>
					</ListItemIcon>
					<ListItemText primary="AI绘图"/>
				</ListItemButton>
				<ListItemButton href="https://creation-hy.top:8080/greedy-snake">
					<ListItemIcon>
						<SportsEsportsOutlined/>
					</ListItemIcon>
					<ListItemText primary="贪吃蛇"/>
				</ListItemButton>
				<ListItemButton href="https://creation-hy.top:8080/sgs">
					<ListItemIcon>
						<SportsEsportsOutlined/>
					</ListItemIcon>
					<ListItemText primary="三国杀"/>
				</ListItemButton>
				<ListItemButton
					href="/minesweeper"
					onClick={(event) => navigateAndCloseDrawer(event, "/minesweeper")}
					selected={firstLevelLocation === "minesweeper"}
				>
					<ListItemIcon>
						<SportsEsportsOutlined/>
					</ListItemIcon>
					<ListItemText primary="扫雷"/>
				</ListItemButton>
				<ListItemButton
					href="/chybench"
					onClick={(event) => navigateAndCloseDrawer(event, "/chybench")}
					selected={firstLevelLocation === "chybench"}
				>
					<ListItemIcon>
						<AnalyticsOutlined/>
					</ListItemIcon>
					<ListItemText primary="Chybench"/>
				</ListItemButton>
				<ListItemButton href="https://creation-hy.top:8080/bbs">
					<ListItemIcon>
						<ForumOutlined/>
					</ListItemIcon>
					<ListItemText primary="BBS"/>
				</ListItemButton>
				<ListItemButton
					href="/blog"
					onClick={(event) => navigateAndCloseDrawer(event, "/blog")}
					selected={firstLevelLocation === "blog"}
				>
					<ListItemIcon>
						<ArticleOutlined/>
					</ListItemIcon>
					<ListItemText primary="Blog"/>
				</ListItemButton>
				<ListItemButton
					href="/settings"
					onClick={(event) => navigateAndCloseDrawer(event, "/settings")}
					selected={firstLevelLocation === "settings"}
				>
					<ListItemIcon>
						<SettingsOutlined/>
					</ListItemIcon>
					<ListItemText primary="设置"/>
				</ListItemButton>
			</List>
			<Grid
				container
				direction="column"
				sx={{
					position: "absolute",
					top: 8,
					right: 8,
				}}
			>
				<IconButton
					color="primary"
					onClick={toggleColorMode}
				>
					{colorMode === "auto" ? <AutoAwesome/> : (colorMode === "light" ? <LightMode/> : <DarkMode/>)}
				</IconButton>
				{(isClientUserLoading && myName || !isClientUserLoading && clientUser) && <IconButton
					color={isClientUserLoading && myInformation.lastCheckInTime && new Date(myInformation.lastCheckInTime).toLocaleDateString() === new Date().toLocaleDateString() ||
					clientUser && clientUser.lastCheckInTime && new Date(clientUser.lastCheckInTime).toLocaleDateString() === new Date().toLocaleDateString() ? "success" : "warning"}
					onClick={() => {
						axios.post("/api/account/check-in").then(res => {
							if (res.data.status === 1) {
								enqueueSnackbar("签到成功", {variant: "success"});
								setClientUser(clientUser => ({
									...clientUser,
									lastCheckInTime: new Date(),
								}));
							} else if (res.data.status === 2) {
								enqueueSnackbar("今天已经签过到了喵～", {variant: "error"});
							} else {
								enqueueSnackbar("登录状态错误", {variant: "error"});
							}
						});
					}}
				>
					{isClientUserLoading && myInformation.lastCheckInTime && new Date(myInformation.lastCheckInTime).toLocaleDateString() === new Date().toLocaleDateString() ||
					clientUser && clientUser.lastCheckInTime && new Date(clientUser.lastCheckInTime).toLocaleDateString() === new Date().toLocaleDateString() ?
						<EventAvailable/> : <CalendarMonth/>}
				</IconButton>}
			</Grid>
		</>
	);
});

LeftBar.propTypes = {
	navigateCallback: PropTypes.func,
}

export const PCAppBarLeft = memo(function PCAppBarLeft() {
	return (
		<Box
			sx={{
				position: "relative",
				height: "100%",
				overflow: "auto",
				width: 225,
				borderRight: 1,
				borderColor: theme => theme.palette.divider,
			}}
		>
			<LeftBar/>
		</Box>
	);
});

export const MobileAppBar = memo(function MobileAppBar() {
	const [open, setOpen] = useState(false);
	const {clientUser, isClientUserLoading} = useClientUser();
	
	if (clientUser) {
		myInformation.displayName = clientUser.displayName;
		myInformation.avatarVersion = clientUser.avatarVersion;
		myInformation.badge = clientUser.badge;
		myInformation.lastCheckInTime = clientUser.lastCheckInTime;
		localStorage.setItem("myInformation", JSON.stringify(myInformation));
	} else if (!isClientUserLoading) {
		myInformation = {};
		localStorage.setItem("myInformation", JSON.stringify(myInformation));
	}
	
	return (
		<AppBar
			position="sticky"
			id="app-bar"
			sx={{
				boxShadow: 0,
				backgroundColor: 'transparent',
				backgroundImage: 'none',
				top: 0,
				py: 2,
			}}
		>
			<Container>
				<StyledToolbar variant="dense" disableGutters sx={{justifyContent: "flex-start"}}>
					<Grid container spacing={1} justify="center" alignItems="center" wrap={"nowrap"}>
						<IconButton aria-label="Menu button" onClick={() => setOpen(true)} sx={{width: 36, height: 36}}>
							{myName ? <UserAvatar username={myName} avatarVersion={myInformation.avatarVersion}
							                      displayName={myInformation.displayName} width={36} height={36}/> : <Avatar/>}
						</IconButton>
						{myName && (
							<ButtonBase
								sx={{overflow: "hidden"}}
								onClick={() => setOpen(true)}
								disableRipple
							>
								<UsernameWithBadge
									username={myInformation.displayName}
									badge={myInformation.badge}
									color={theme => theme.palette.text.primary}
								/>
							</ButtonBase>
						)}
					</Grid>
					<SwipeableDrawer
						anchor="left"
						open={open}
						onOpen={() => setOpen(true)}
						onClose={() => setOpen(false)}
					>
						<Box sx={{height: "100%", overflow: "auto", width: 225}}>
							<LeftBar navigateCallback={() => setOpen(false)}/>
						</Box>
					</SwipeableDrawer>
				</StyledToolbar>
			</Container>
		</AppBar>
	);
});