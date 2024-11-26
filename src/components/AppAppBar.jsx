import {memo, useCallback, useState} from 'react';
import {alpha, styled} from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Grid from "@mui/material/Grid2";
import {Badge, List, ListItemButton, ListItemIcon, ListItemText, SwipeableDrawer, useMediaQuery} from "@mui/material";
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
import {UserAvatar, UserBadge} from "src/components/UserComponents.jsx";
import {NavigateLink} from "src/components/NavigateComponents.jsx";

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
const myInformation = JSON.parse(localStorage.getItem("myInformation")) ?? {};

const LeftBar = memo(({navigateCallback}) => {
	const {clientUser, isClientUserLoading} = useClientUser();
	const navigate = useNavigate();
	const firstLevelLocation = useLocation().pathname.split("/")[1];
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
	
	const navigateAndCloseDrawer = useCallback((event, url) => {
		if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
			event.preventDefault();
			navigate(url);
			if (navigateCallback) {
				navigateCallback();
			}
		}
	}, []);
	
	if (clientUser) {
		myInformation.displayName = clientUser.displayName;
		myInformation.avatarVersion = clientUser.avatarVersion;
		myInformation.badge = clientUser.badge;
		localStorage.setItem("myInformation", JSON.stringify(myInformation));
	}
	
	return (
		<>
			<Box sx={{mt: 2.5, mb: 1}}>
				{isClientUserLoading ? (
					(!myName ? (
						<Grid container direction="column" gap={1.5} sx={{mt: isSmallScreen ? 0 : 6.5}}>
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
							<Grid container alignItems="center" flexWrap="nowrap" gap={0.25}>
								<NavigateLink href={`/user/${myInformation.username}`}>
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
					<Grid container direction="column" gap={1.5} sx={{mt: isSmallScreen ? 0 : 6.5}}>
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
						<Grid container alignItems="center" flexWrap="nowrap" gap={0.25}>
							<NavigateLink href={`/user/${clientUser.username}`}>
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
					href="/blog"
					onClick={(event) => navigateAndCloseDrawer(event, "/about")}
					selected={firstLevelLocation === "about"}
				>
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

export const PCAppBarLeft = memo(() => {
	const [colorMode, toggleColorMode] = useColorMode();
	
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

export const PCAppBarRight = memo(() => {
	return (
		<Box
			sx={{
				position: "relative",
				height: "100%",
				overflow: "auto",
				width: 225,
				borderLeft: 1,
				borderColor: theme => theme.palette.divider,
				p: 2,
			}}
		>
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
			sx={{
				boxShadow: 0,
				backgroundColor: 'transparent',
				backgroundImage: 'none',
				top: 0,
				py: 2,
			}}
		>
			<Container>
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
						<Box sx={{height: "100%", overflow: "auto", width: 225}}>
							<LeftBar navigateCallback={() => setOpen(false)}/>
						</Box>
					</SwipeableDrawer>
				</StyledToolbar>
			</Container>
		</AppBar>
	);
});