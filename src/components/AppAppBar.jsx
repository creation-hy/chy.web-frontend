import {memo, useCallback, useState} from 'react';
import {alpha, styled} from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Grid from "@mui/material/Grid2";
import {Badge, List, ListItemButton, ListItemIcon, ListItemText, Skeleton, SwipeableDrawer, useMediaQuery} from "@mui/material";
import {
	AnalyticsOutlined,
	ArticleOutlined,
	AutoAwesome,
	ChatBubbleOutline,
	DarkMode,
	DrawOutlined,
	ForumOutlined,
	InfoOutlined,
	LightMode,
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
import {UserAvatar} from "src/components/UserComponents.jsx";

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
const myDisplayName = localStorage.getItem("myDisplayName");
const myAvatarVersion = Number(localStorage.getItem("myAvatarVersion"));

const LeftBar = memo(({navigateCallback}) => {
	const {clientUser, clientUserLoading} = useClientUser();
	const navigate = useNavigate();
	const firstLevelLocation = useLocation().pathname.split("/")[1];
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
	
	const navigateAndCloseDrawer = useCallback((url) => {
		navigate(url);
		if (navigateCallback) {
			navigateCallback();
		}
	}, []);
	
	if (clientUser) {
		localStorage.setItem("myDisplayName", clientUser.displayName);
		localStorage.setItem("myAvatarVersion", clientUser.avatarVersion);
	}
	
	return (
		<>
			<Box sx={{mt: 2.5, mb: 1}}>
				{clientUserLoading ? (
					(!myName ? (
						<Grid container direction="column" gap={1.5} sx={{mt: isSmallScreen ? 0 : 6.5}}>
							<Button variant="contained" onClick={() => navigateAndCloseDrawer("register")} sx={{mx: 2}}>
								注册
							</Button>
							<Button variant="outlined" onClick={() => navigateAndCloseDrawer("login")} sx={{mx: 2}}>
								登录
							</Button>
						</Grid>
					) : (
						<Grid container direction="column" sx={{ml: 2.5, mr: 2.5}}>
							<IconButton sx={{width: 80, height: 80, mb: 0.75}} onClick={() => navigateAndCloseDrawer(`user/${myName}`)}>
								<UserAvatar username={myName} displayName={myDisplayName} avatarVersion={myAvatarVersion} width={80} height={80}/>
							</IconButton>
							<Typography fontWeight="bold" noWrap maxWidth="100%" overflow="hidden" textOverflow="ellipsis">
								{myDisplayName ? myDisplayName : <Skeleton/>}
							</Typography>
							<Typography fontSize={14} noWrap color="text.secondary" maxWidth="100%" overflow="hidden" textOverflow="ellipsis">
								@{myName}
							</Typography>
						</Grid>
					))
				) : (!clientUser ? (
					<Grid container direction="column" gap={1.5} sx={{mt: isSmallScreen ? 0 : 6.5}}>
						<Button variant="contained" onClick={() => navigateAndCloseDrawer("register")} sx={{mx: 2}}>
							注册
						</Button>
						<Button variant="outlined" onClick={() => navigateAndCloseDrawer("login")} sx={{mx: 2}}>
							登录
						</Button>
					</Grid>
				) : (
					<Grid container direction="column" sx={{ml: 2.5, mr: 2.5}}>
						<IconButton sx={{width: 80, height: 80, mb: 0.75}} onClick={() => navigateAndCloseDrawer(`user/${clientUser.username}`)}>
							<UserAvatar username={clientUser.username} displayName={clientUser.displayName}
							            avatarVersion={clientUser.avatarVersion} width={80} height={80}/>
						</IconButton>
						<Typography fontWeight="bold" noWrap maxWidth="100%" overflow="hidden" textOverflow="ellipsis">
							{clientUser.displayName}
						</Typography>
						<Typography fontSize={14} noWrap color="text.secondary" maxWidth="100%" overflow="hidden" textOverflow="ellipsis">
							@{clientUser.username}
						</Typography>
					</Grid>
				))}
			</Box>
			<List sx={{width: "100%"}}>
				<ListItemButton onClick={() => navigateAndCloseDrawer("")} selected={firstLevelLocation === "" || firstLevelLocation === "chat"}>
					<ListItemIcon>
						<Badge badgeContent={clientUser ? clientUser.newMessageCount : 0} color="error">
							<ChatBubbleOutline/>
						</Badge>
					</ListItemIcon>
					<ListItemText primary="Chat"/>
				</ListItemButton>
				<ListItemButton onClick={() => navigateAndCloseDrawer("ai-art")} selected={firstLevelLocation === "ai-art"}>
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
				<ListItemButton onClick={() => navigateAndCloseDrawer("minesweeper")} selected={firstLevelLocation === "minesweeper"}>
					<ListItemIcon>
						<SportsEsportsOutlined/>
					</ListItemIcon>
					<ListItemText primary="扫雷"/>
				</ListItemButton>
				<ListItemButton onClick={() => navigateAndCloseDrawer("chybench")} selected={firstLevelLocation === "chybench"}>
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
				<ListItemButton onClick={() => navigateAndCloseDrawer("blog")} selected={firstLevelLocation === "blog"}>
					<ListItemIcon>
						<ArticleOutlined/>
					</ListItemIcon>
					<ListItemText primary="Blog"/>
				</ListItemButton>
				<ListItemButton onClick={() => navigateAndCloseDrawer("about")} selected={firstLevelLocation === "about"}>
					<ListItemIcon>
						<InfoOutlined/>
					</ListItemIcon>
					<ListItemText primary="关于"/>
				</ListItemButton>
			</List>
		</>
	);
});

LeftBar.propTypes = {
	navigateCallback: PropTypes.func,
}

export const PCAppBar = memo(() => {
	const [colorMode, toggleColorMode] = useColorMode();
	
	return (
		<Box
			sx={{
				position: "relative",
				height: "100%",
				width: 225,
				borderRight: 1,
				borderColor: theme => theme.palette.divider,
			}}
		>
			<LeftBar/>
			<IconButton
				color="primary"
				size="small"
				onClick={toggleColorMode}
				sx={{
					position: "absolute",
					top: 8,
					right: 8,
				}}
			>
				{colorMode === "auto" ? <AutoAwesome/> : (colorMode === "light" ? <LightMode/> : <DarkMode/>)}
			</IconButton>
		</Box>
	);
});

export const MobileAppBar = memo(() => {
	const [open, setOpen] = useState(false);
	const [colorMode, toggleColorMode] = useColorMode();
	
	const toggleDrawer = (newOpen) => () => {
		setOpen(newOpen);
	};
	
	return (
		<AppBar
			position="sticky"
			id="app-bar"
			sx={{boxShadow: 0, backgroundColor: 'transparent', backgroundImage: 'none', top: 0, pt: 2, pb: 2}}
		>
			<Container maxWidth="lg">
				<StyledToolbar variant="dense" disableGutters sx={{justifyContent: "flex-end"}}>
					<Grid container spacing={1} justify="center" alignItems="center">
						<IconButton size="small" onClick={toggleColorMode}>
							{colorMode === "auto" ? <AutoAwesome fontSize="small"/> : (
								colorMode === "light" ? <LightMode fontSize="small"/> : <DarkMode fontSize="small"/>
							)}
						</IconButton>
						<IconButton aria-label="Menu button" onClick={toggleDrawer(true)} sx={{width: 36, height: 36}}>
							<MenuIcon/>
						</IconButton>
					</Grid>
					<SwipeableDrawer anchor="left" open={open} onOpen={toggleDrawer(true)} onClose={toggleDrawer(false)}>
						<Box sx={{backgroundColor: 'background.default', minHeight: "100%", width: 225}}>
							<LeftBar navigateCallback={() => setOpen(false)}/>
						</Box>
					</SwipeableDrawer>
				</StyledToolbar>
			</Container>
		</AppBar>
	);
});