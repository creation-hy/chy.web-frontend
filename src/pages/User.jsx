import Box from "@mui/material/Box";
import {useNavigate, useParams} from "react-router";
import {memo, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {
	Alert,
	Badge,
	ButtonBase,
	CircularProgress,
	InputLabel,
	LinearProgress,
	List,
	ListItem,
	ListItemAvatar,
	ListItemIcon,
	ListItemText,
	MenuList,
	Modal,
	Paper,
	Tab,
	Tabs,
	Tooltip,
	useMediaQuery
} from "@mui/material";
import axios from "axios";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import {enqueueSnackbar} from "notistack";
import PropTypes from "prop-types";
import {useInfiniteQuery, useQuery, useQueryClient} from "@tanstack/react-query";
import {
	Block,
	BlockSharp,
	EditOutlined,
	Female,
	HowToReg,
	MailOutlined,
	Male,
	PersonAdd,
	PersonAddOutlined,
	PersonOffOutlined,
	PersonOutlined,
	QuestionMark,
	Restore,
	SwapHoriz,
	Transgender,
	Upload,
	VerifiedOutlined
} from "@mui/icons-material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import {ChatMarkdown} from "src/components/ChatMarkdown.jsx";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import {convertDateToLocaleAbsoluteString, convertDateToLocaleDateString} from "src/assets/DateUtils.jsx";
import Chip from "@mui/material/Chip";
import {Cropper} from "react-cropper";
import "react-cropper/node_modules/cropperjs/dist/cropper.css";
import {useClientUser} from "src/components/ClientUser.jsx";
import {supportedBadges, UserAvatar, UserBadge, UsernameWithBadge} from "src/components/UserComponents.jsx";
import {NavigateButtonBase, NavigateIconButton, NavigateLink} from "src/components/NavigateComponents.jsx";
import {MessageFile} from "src/pages/Chat.jsx";
import {LoadMoreIndicator} from "src/components/LoadMoreIndicator.jsx";
import {AnimatePresence, motion} from "framer-motion";

const myname = localStorage.getItem("username");

const News = memo(function News({username, displayName, avatarVersion}) {
	const {data, fetchNextPage, isFetching, hasNextPage} = useInfiniteQuery({
		queryKey: ["user", username, "news"],
		queryFn: ({pageParam}) => axios.get(`/api/user/${username}/chat/${pageParam}`).then(res => res.data?.result ?? []),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages, lastPageParam) => lastPage.length === 0 ? undefined : lastPageParam + 1,
	});
	
	const loadMoreRef = useRef(null);
	
	useEffect(() => {
		const pageLoadingObserver = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !isFetching && hasNextPage) {
				fetchNextPage();
			}
		}, {
			rootMargin: "200px",
		});
		pageLoadingObserver.observe(loadMoreRef.current);
		return () => pageLoadingObserver.disconnect();
	}, [fetchNextPage, hasNextPage, isFetching]);
	
	return (
		<Box sx={{mt: 2}}>
			<Box sx={{mt: -0.5}}>
				{data?.pages.map(page => page.map(chat => (
					<Grid
						container
						key={chat.id}
						justifyContent='flex-start'
						alignItems="flex-start"
						sx={{my: 3}}
					>
						<IconButton sx={{mr: 1.5, p: 0}}>
							<UserAvatar username={username} displayName={displayName} avatarVersion={avatarVersion}/>
						</IconButton>
						<Grid container direction="column" sx={{maxWidth: "75%"}} alignItems='flex-start' spacing={0.7}>
							{chat.type === 1 ? (
								<Paper
									elevation={3}
									sx={{
										padding: '8px 11px',
										px: chat.type === 1 ? undefined : 0,
										pt: chat.type === 1 ? undefined : 0,
										borderRadius: '10px',
										wordBreak: 'break-word',
										maxWidth: "100%",
									}}
								>
									<Box sx={{fontSize: 15}}>
										<ChatMarkdown useMarkdown={chat.useMarkdown}>{chat.content}</ChatMarkdown>
									</Box>
									<Typography variant="caption" display="block" textAlign="right" mt={1} mr={chat.type === 1 ? undefined : "11px"}>
										{convertDateToLocaleAbsoluteString(chat.time)}
									</Typography>
								</Paper>
							) : (
								<MessageFile
									url={chat.file.url}
									fileName={chat.file.fileName}
									fileSize={chat.file.fileSize}
									fileWidth={chat.file.fileWidth}
									fileHeight={chat.file.fileHeight}
									deleted={chat.file.deleted}
									onContextMenu={(event) => event.preventDefault()}
								/>
							)}
							{chat.quote != null &&
								<Chip
									variant="outlined"
									avatar={<UserAvatar username={chat.quote.username} displayName={chat.quote.displayName}
									                    avatarVersion={chat.quote.avatarVersion}/>}
									label={chat.quote.displayName + ": " + chat.quote.content}
									clickable
								/>
							}
						</Grid>
					</Grid>
				)))}
			</Box>
			<Box ref={loadMoreRef} sx={{pt: 1.5}}>
				<LoadMoreIndicator isFetching={isFetching}/>
			</Box>
		</Box>
	);
});

News.propTypes = {
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
}

const UserItem = memo(function UserItem({
	                                        username,
	                                        displayName,
	                                        avatarVersion,
	                                        badge,
	                                        introduction,
	                                        isFollowing,
	                                        isFollowedBy,
	                                        isBlocking,
	                                        showBlockButton,
	                                        type,
	                                        queryKeyUserName,
	                                        disableAnimation,
                                        }) {
	const queryClient = useQueryClient();
	
	return (
		<motion.div
			initial={{opacity: disableAnimation ? 1 : 0, height: disableAnimation ? "auto" : 0}}
			animate={{opacity: 1, height: "auto"}}
			exit={{opacity: 0, height: 0}}
			transition={{duration: disableAnimation ? 0 : 0.3}}
		>
			<Box sx={{px: 2, py: 2.5, borderBottom: 1, borderColor: "divider"}}>
				<ListItem sx={{p: 0}}>
					<ListItemAvatar>
						<NavigateButtonBase
							href={`/user/${username}`}
							sx={{borderRadius: "50%"}}
						>
							<UserAvatar username={username} displayName={displayName} avatarVersion={avatarVersion}/>
						</NavigateButtonBase>
					</ListItemAvatar>
					<Grid container wrap="nowrap" justifyContent="space-between" alignItems="center" flex={1}>
						<ListItemText sx={{m: 0}}>
							<Grid container alignItems="center" wrap="nowrap" gap={0.25}>
								<NavigateLink href={`/user/${username}`} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
									<Typography fontWeight="bold" noWrap alignItems="center">
										{displayName}
									</Typography>
								</NavigateLink>
								<UserBadge badge={badge} fontSize={18}/>
							</Grid>
							<Typography
								fontSize={14}
								color="textSecondary"
								noWrap
								overflow="hidden"
								textOverflow="ellipsis"
								maxWidth="100%"
							>
								<NavigateLink href={`/user/${username}`} underline="none">
									@{username}
								</NavigateLink>
							</Typography>
						</ListItemText>
						{!showBlockButton ? (
							<Button
								variant={isFollowing || isBlocking ? "outlined" : "contained"}
								sx={{ml: 2, flexShrink: 0}}
								disabled={username === myname || isBlocking}
								startIcon={isBlocking ? <Block/> :
									(isFollowedBy && isFollowing ? <SwapHoriz/> : (isFollowing ? <PersonOutlined/> : <PersonAdd/>))}
								onClick={() => {
									axios.post("/api/user/" + username + "/follow").then(res => {
										if (res.data.status === 1 || res.data.status === 2) {
											const newIsFollowing = res.data.status === 1;
											
											queryClient.invalidateQueries({queryKey: ["user", queryKeyUserName, "info"]});
											
											queryClient.setQueryData(["user", queryKeyUserName, "followers"], data => !data ? data : {
												pages: data.pages.map(page => page.map(item => item.username !== username ? item : {
													...item,
													isFollowing: newIsFollowing,
												})),
												pageParams: data.pageParams,
											});
											
											if (type === "following" && newIsFollowing === false && queryKeyUserName === myname) {
												queryClient.setQueryData(["user", queryKeyUserName, "following"], data => !data ? data : {
													pages: data.pages.map(page => page.filter(item => item.username !== username)),
													pageParams: data.pageParams,
												});
											} else {
												queryClient.setQueryData(["user", queryKeyUserName, "following"], data => !data ? data : {
													pages: data.pages.map(page => page.map(item => item.username !== username ? item : {
														...item,
														isFollowing: newIsFollowing,
													})),
													pageParams: data.pageParams,
												});
											}
										} else {
											enqueueSnackbar(res.data.content, {variant: "error"});
										}
									})
								}}
							>
								{isBlocking ? "已屏蔽" : (isFollowing ? (isFollowedBy ? "已互关" : "已关注") : "关注")}
							</Button>
						) : (
							<Button
								color="error"
								variant={isBlocking ? "outlined" : "contained"}
								sx={{ml: 2, flexShrink: 0}}
								disabled={username === myname}
								startIcon={<Block/>}
								onClick={() => {
									axios.post("/api/user/" + username + "/block").then(res => {
										if (res.data.status === 1 || res.data.status === 2) {
											const newIsBlocking = res.data.status === 1;
											if (queryKeyUserName === myname) {
												queryClient.invalidateQueries({queryKey: ["user", queryKeyUserName, "info"]});
												if (newIsBlocking === false) {
													queryClient.setQueryData(["user", queryKeyUserName, "blocking"], data => !data ? data : {
														pages: data.pages.map(page => page.filter(item => item.username !== username)),
														pageParams: data.pageParams,
													});
												}
											}
										} else {
											enqueueSnackbar(res.data.content, {variant: "error"});
										}
									})
								}}
							>
								{isBlocking ? "已屏蔽" : "屏蔽"}
							</Button>
						)}
					</Grid>
				</ListItem>
				<Grid container sx={{ml: 7, mt: 0.25}}>
					<Typography
						component="span"
						fontSize={14}
						color="textPrimary"
						maxHeight="6em"
						overflow="hidden"
						textOverflow="ellipsis"
						sx={{
							display: "-webkit-box",
							WebkitBoxOrient: "vertical",
							WebkitLineClamp: 4,
						}}
					>
						<NavigateLink href={`/user/${username}`} underline="none">
							{introduction}
						</NavigateLink>
					</Typography>
				</Grid>
			</Box>
		</motion.div>
	);
});

UserItem.propTypes = {
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
	badge: PropTypes.string,
	introduction: PropTypes.string,
	isFollowing: PropTypes.bool,
	isFollowedBy: PropTypes.bool,
	isBlocking: PropTypes.bool,
	showBlockButton: PropTypes.bool.isRequired,
	type: PropTypes.string.isRequired,
	queryKeyUserName: PropTypes.string.isRequired,
	disableAnimation: PropTypes.bool.isRequired,
}

const Follows = memo(function Follows({username, type}) {
	const [isNewData, setIsNewData] = useState(true);
	
	const {data, fetchNextPage, isFetching, hasNextPage, isFetched} = useInfiniteQuery({
		queryKey: ["user", username, type],
		queryFn: ({pageParam}) => axios.get(`/api/user/${username}/${type}/${pageParam}`).then(res => res.data?.result ?? []),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages, lastPageParam) => lastPage.length === 0 ? undefined : lastPageParam + 1,
	});
	
	const loadMoreRef = useRef(null);
	const prevPageNumberRef = useRef(0);
	
	useEffect(() => {
		const pageLoadingObserver = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !isFetching && hasNextPage) {
				fetchNextPage();
			}
		}, {
			rootMargin: "200px",
		});
		pageLoadingObserver.observe(loadMoreRef.current);
		return () => pageLoadingObserver.disconnect();
	}, [fetchNextPage, hasNextPage, isFetching]);
	
	if (!isFetching && isFetched && data != null && prevPageNumberRef.current !== data.pageParams.length) {
		console.log(prevPageNumberRef.current, data.pageParams.length);
		setIsNewData(true);
		prevPageNumberRef.current = data.pageParams.length;
	}
	
	useEffect(() => {
		if (isNewData) {
			setIsNewData(false);
		}
	}, [isNewData]);
	
	return (
		<>
			<List sx={{pt: 0, mt: -1}}>
				<AnimatePresence>
					{data?.pages.flat().map(user => (
						<UserItem
							key={user.username}
							username={user.username}
							displayName={user.displayName}
							avatarVersion={user.avatarVersion}
							badge={user.badge}
							introduction={user.introduction}
							isFollowing={user.isFollowing}
							isFollowedBy={user.isFollowedBy}
							isBlocking={user.isBlocking}
							showBlockButton={type === "blocking"}
							type={type}
							queryKeyUserName={username}
							disableAnimation={isNewData}
						/>
					))}
				</AnimatePresence>
			</List>
			<Box ref={loadMoreRef} sx={{pt: !data || data.pages.flat().length === 0 ? 2 : 1}}>
				<LoadMoreIndicator isFetching={isFetching}/>
			</Box>
		</>
	);
});

Follows.propTypes = {
	username: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
}

const TabPanel = memo(function TabPanel({value, username, displayName, avatarVersion}) {
	if (value === 0) {
		document.title = `${displayName} (@${username}) 的动态 - chy.web`;
		return <News username={username} displayName={displayName} avatarVersion={avatarVersion}/>;
	}
	
	if (value === 1) {
		document.title = `${displayName} (@${username}) 的关注列表 - chy.web`;
		return <Follows key={0} username={username} type="following"/>;
	}
	
	if (value === 2) {
		document.title = `${displayName} (@${username}) 的粉丝列表 - chy.web`;
		return <Follows key={1} username={username} type="followers"/>;
	}
	
	document.title = `${displayName} (@${username}) 的屏蔽列表 - chy.web`;
	return <Follows key={2} username={username} type="blocking"/>;
});

TabPanel.propTypes = {
	value: PropTypes.number.isRequired,
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
}

const doFollow = (username, setIsFollowing) => {
	return axios.post("/api/user/" + username + "/follow").then(res => {
		if (res.data.status === 1) {
			setIsFollowing(true);
		} else if (res.data.status === 2) {
			setIsFollowing(false);
		} else {
			enqueueSnackbar(res.data.content, {variant: "error"});
		}
	});
};

const LEVEL_THRESHOLDS = [0, 50, 300, 1000, 3650, 10000, 50000, 350000, 1e9];

const GENDERS = [
	{name: "未知", icon: <QuestionMark color="action"/>},
	{name: "男", icon: <Male sx={{color: "#5bcefa"}}/>},
	{name: "女", icon: <Female sx={{color: "#f5a9b8"}}/>},
	{name: "男の娘", icon: <Male sx={{color: "#5bcefa"}}/>},
	{name: "假小子", icon: <Female sx={{color: "#f5a9b8"}}/>},
	{name: "Futa", icon: <Female sx={{color: "#f5a9b8"}}/>},
	{name: "MtF", icon: <Transgender sx={{color: "#f5a9b8"}}/>},
	{name: "MtX", icon: <Transgender sx={{color: "#f5a9b8"}}/>},
	{name: "FtM", icon: <Transgender sx={{color: "#5bcefa"}}/>},
	{name: "FtX", icon: <Transgender sx={{color: "#5bcefa"}}/>},
	{name: "非二元", icon: <Transgender color="action"/>},
	{name: "间性", icon: <Transgender color="action"/>},
	{name: "无性别", icon: <QuestionMark color="action"/>},
	{name: "汉堡王", icon: <QuestionMark color="action"/>},
	{name: "西瓜霜", icon: <QuestionMark color="action"/>},
	{name: "北洋军阀", icon: <QuestionMark color="action"/>},
	{name: "其它", icon: <QuestionMark color="action"/>},
];

const UserPage = memo(function UserPage({username}) {
	const queryClient = useQueryClient();
	
	const {clientUser, setClientUser} = useClientUser();
	const {tab} = useParams();
	const navigate = useNavigate();
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
	
	const tabs = useMemo(() => {
		return username === myname ? [undefined, "following", "followers", "blocking"] : [undefined, "following", "followers"];
	}, [username]);
	
	const [tabValue, setTabValue] = useState(Math.max(tabs.indexOf(tab), 0));
	
	const [modifying, setModifying] = useState(false);
	
	const [isManagingBadges, setIsManagingBadges] = useState(false);
	
	const [openAvatarModifyDialog, setOpenAvatarModifyDialog] = useState(false);
	const [avatarProcessing, setAvatarProcessing] = useState(false);
	
	const [showAvatarCropper, setShowAvatarCropper] = useState(false);
	const [avatarSrc, setAvatarSrc] = useState();
	const avatarCropper = useRef(null);
	
	const {data, isLoading, refetch} = useQuery({
		queryKey: ["user", username, "info"],
		queryFn: () => axios.get(`/api/user/${username}/info`).then(res => res.data),
	});
	
	useLayoutEffect(() => {
		setTabValue(Math.max(tabs.indexOf(tab), 0));
		if (tabs.indexOf(tab) === -1) {
			navigate(`/user/${username}`);
		}
	}, [navigate, tab, tabs, username]);
	
	if (isLoading) {
		return null;
	}
	
	if (!data || !data.username) {
		return <Alert severity="error">用户不存在！</Alert>;
	}
	
	return (
		<Box maxWidth="md" alignSelf="center" width="100%">
			<Card sx={{p: 2}}>
				<Grid container direction="column" gap={0.5}>
					<Grid container alignItems="center" gap={1.5} wrap="nowrap" width="100%" sx={{mb: 0.5}}>
						{data.username === myname ? (
							<IconButton
								onClick={() => setOpenAvatarModifyDialog(true)}
								sx={{width: 100, height: 100}}
							>
								<UserAvatar username={data.username} displayName={data.displayName}
								            avatarVersion={data.avatarVersion} width={100} height={100}/>
							</IconButton>
						) : (
							<Badge
								badgeContent={data.isBlocking ? <Block fontSize="large"/> : undefined}
								overlap="circular"
								color="error"
								anchorOrigin={{vertical: "bottom", horizontal: "right"}}
								sx={{
									'& .MuiBadge-badge': {
										width: 35,
										height: 35,
										borderRadius: "50%",
									}
								}}
							>
								<UserAvatar username={data.username} displayName={data.displayName}
								            avatarVersion={data.avatarVersion} width={100} height={100}/>
							</Badge>
						)}
						<input
							type="file"
							id="avatar-upload"
							accept="image/*"
							hidden
							onChange={(event) => {
								setAvatarSrc(URL.createObjectURL(event.target.files[0]));
								setShowAvatarCropper(true);
								event.target.value = null;
							}}
						/>
						<Modal open={avatarProcessing}>
							<Grid container width="100%" height="100%" alignItems="center" justifyContent="center">
								<CircularProgress size={50}/>
							</Grid>
						</Modal>
						<Dialog open={showAvatarCropper} onClose={() => setShowAvatarCropper(false)}>
							<DialogTitle sx={{pb: 0}}>
								裁剪头像
							</DialogTitle>
							<DialogContent sx={{pt: "16px !important"}}>
								<Cropper
									ref={avatarCropper}
									src={avatarSrc}
									aspectRatio={1}
									dragMode="move"
									viewMode={2}
									responsive={true}
									autoCropArea={1}
								/>
							</DialogContent>
							<DialogActions>
								<Button onClick={() => {
									setShowAvatarCropper(false);
									setAvatarSrc(null);
								}}>
									取消
								</Button>
								<Button onClick={() => {
									setShowAvatarCropper(false);
									setAvatarProcessing(true);
									avatarCropper.current.cropper.getCroppedCanvas().toBlob(blob => {
										const avatar = new File([blob], "avatar.png", {type: "image/png"});
										
										if (avatar.size > 20 * 1024 * 1024) {
											enqueueSnackbar("头像大小不能超过20MB！", {variant: "error"});
											setAvatarProcessing(false);
										}
										
										axios.post("/api/account/avatar/upload", {avatar: avatar}, {
											headers: {
												"Content-Type": "multipart/form-data",
											},
										}).then((res) => {
											enqueueSnackbar(res.data.content, {variant: res.data.status === 0 ? "error" : "success"});
											if (res.data.status === 1) {
												setOpenAvatarModifyDialog(false);
												setAvatarProcessing(false);
												refetch();
												setClientUser({
													...clientUser,
													avatarVersion: clientUser.avatarVersion + 1,
												});
											}
										});
									});
								}}>
									上传
								</Button>
							</DialogActions>
						</Dialog>
						<Grid container direction="column" justifyContent="center">
							<Grid container alignItems="center" wrap="nowrap" maxWidth="100%">
								<UsernameWithBadge username={data.displayName} badge={data.badge} fontSize={20} size={22}/>
								<Box ml={1.5} mb={0.5} width="max-content" minWidth={60}>
									<Grid container alignItems="center" justifyContent="space-between" gap={1} wrap={"nowrap"}>
										<Typography fontWeight={"bold"} fontSize={14}>
											V{data.level}
										</Typography>
										{data.level <= 6 && <Typography fontSize={12} overflow={"hidden"} textOverflow={"ellipsis"}>
											{data.experience}/{LEVEL_THRESHOLDS[data.level + 1]}
										</Typography>}
									</Grid>
									<LinearProgress variant="determinate" value={data.experience * 100 / LEVEL_THRESHOLDS[data.level + 1]}
									                sx={{width: "100%", borderRadius: 1}}/>
								</Box>
							</Grid>
							<Typography color="text.secondary" sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
								@{data.username}
							</Typography>
							{data.username === myname ? (
								<Box sx={{pt: "2px"}}>
									<Tooltip title="修改信息">
										<IconButton onClick={() => setModifying(true)}>
											<EditOutlined/>
										</IconButton>
									</Tooltip>
									<Tooltip title="管理徽章">
										<IconButton onClick={() => setIsManagingBadges(true)}>
											<VerifiedOutlined/>
										</IconButton>
									</Tooltip>
									<Tooltip title="私信">
										<NavigateIconButton href={`/chat/${data.username}`}>
											<MailOutlined/>
										</NavigateIconButton>
									</Tooltip>
								</Box>
							) : (
								<Box flexShrink={0}>
									{data.isFollowing == null ? null : (data.isFollowing ? (
										<Tooltip title="取消关注">
											<IconButton onClick={() => {
												doFollow(data.username, refetch).then(() => {
													refetch();
													queryClient.invalidateQueries({queryKey: ["user", data.username, "followers"]});
												});
											}}>
												<PersonOffOutlined/>
											</IconButton>
										</Tooltip>
									) : (
										<Tooltip title="关注">
											<IconButton onClick={() => {
												doFollow(data.username, refetch).then(() => {
													refetch();
													queryClient.invalidateQueries({queryKey: ["user", data.username, "followers"]});
												});
											}}>
												<PersonAddOutlined/>
											</IconButton>
										</Tooltip>
									))}
									<Tooltip title="私信">
										<NavigateIconButton href={`/chat/${data.username}`}>
											<MailOutlined/>
										</NavigateIconButton>
									</Tooltip>
									<Tooltip title={data.isBlocking ? "取消屏蔽" : "屏蔽"}>
										<IconButton onClick={() => {
											axios.post(`/api/user/${data.username}/block`).then(res => {
												if (res.data.status === 1) {
													refetch();
												} else if (res.data.status === 2) {
													refetch();
												} else {
													enqueueSnackbar(res.data.content, {variant: "error"});
												}
											});
										}}>
											<Block color={data.isBlocking ? "inherit" : "error"}/>
										</IconButton>
									</Tooltip>
								</Box>
							)}
						</Grid>
					</Grid>
					<Grid container direction="column" gap={0.25}>
						<Grid container alignItems="center" gap={0.5}>
							{GENDERS.find(gender => gender.name === data.gender)?.icon}
							<Typography fontSize={14} color="textSecondary">
								{data.gender}
							</Typography>
						</Grid>
						<Grid container alignItems="center" gap={0.5}>
							<HowToReg color="action"/>
							<Typography fontSize={14} color="textSecondary">
								注册于{convertDateToLocaleDateString(data.registrationTime)}
							</Typography>
						</Grid>
					</Grid>
					<Box sx={{fontSize: 15, maxWidth: "100%"}}>
						<ChatMarkdown useMarkdown={true}>{data["introduction"]}</ChatMarkdown>
					</Box>
				</Grid>
			</Card>
			<Box sx={{borderBottom: 1, borderColor: 'divider', mb: 1, mt: 1.5}}>
				<Tabs
					value={tabValue}
					onChange={(event, newValue) => {
						navigate(newValue === 0 ? `/user/${username}` : `/user/${username}/${tabs[newValue]}`);
						setTabValue(newValue);
					}}
				>
					<Tab label="动态"/>
					<Tab label={`关注(${data.followingCount})`}/>
					<Tab label={`粉丝(${data.followerCount})`}/>
					{username === myname && <Tab label={`屏蔽(${data.blockingCount})`}/>}
				</Tabs>
			</Box>
			<TabPanel value={tabValue} username={data.username} displayName={data.displayName} avatarVersion={data.avatarVersion}/>
			<Dialog
				open={modifying}
				onClose={() => setModifying(false)}
				component="form"
				fullWidth
				onSubmit={(event) => {
					event.preventDefault();
					const formData = new FormData(event.currentTarget);
					formData.set("displayName", formData.get("displayName").trim());
					axios.post("/api/account/modify", formData, {
						headers: {
							"Content-Type": "application/json",
						},
					}).then(res => {
						if (res.data.status === 1) {
							refetch();
							setClientUser(clientUser => ({
								...clientUser,
								displayName: formData.get("displayName"),
							}));
						}
					});
					setModifying(false);
				}}
			>
				<DialogTitle>修改信息</DialogTitle>
				<DialogContent>
					<Grid container>
						<TextField
							label="昵称"
							defaultValue={data.displayName}
							name="displayName"
							margin="dense"
							sx={{flex: 1, mr: 1}}
							required
						/>
						<FormControl margin="dense">
							<InputLabel id="select-gender-label">性别</InputLabel>
							<Select
								labelId="select-gender-label"
								label="性别"
								variant="outlined"
								defaultValue={data["gender"]}
								name="gender"
							>
								{GENDERS.map(gender => (
									<MenuItem key={gender.name} value={gender.name} sx={{pl: 1.25, height: 40}}>
										<Grid container alignItems="center" gap={1}>
											{gender.icon}
											<Typography>
												{gender.name}
											</Typography>
										</Grid>
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
					<TextField
						label="简介"
						fullWidth
						multiline
						maxRows={10}
						defaultValue={data["introduction"]}
						name="introduction"
						margin="normal"
					/>
				</DialogContent>
				<DialogActions>
					<Button type="button" onClick={() => setModifying(false)}>关闭</Button>
					<Button type="submit">确认</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={isManagingBadges} onClose={() => setIsManagingBadges(false)}>
				<DialogTitle>
					管理徽章
				</DialogTitle>
				<DialogContent sx={{pb: 1}}>
					<Grid container spacing={2}>
						{supportedBadges.map((item) => (
							<Grid
								key={item.id}
								size={isSmallScreen ? 6 : 4}
								sx={{
									height: 100,
									border: data.badge === item.id ? 2 : 0,
									borderColor: theme => theme.palette.primary.main,
									borderRadius: 1,
								}}
							>
								<ButtonBase
									sx={{
										borderRadius: data.badge === item.id ? 0 : 1,
										width: "100%",
										height: "100%",
									}}
									onClick={() => {
										if (data.level >= item.levelRequirement && data.badge !== item.id) {
											axios.post("/api/account/badge/modify", {badge: item.id}, {
												headers: {
													"Content-Type": "application/json",
												},
											}).then(res => {
												if (res.data.status === 1) {
													refetch();
													setClientUser(clientUser => ({
														...clientUser,
														badge: item.id,
													}));
													setIsManagingBadges(false);
												}
											});
										}
									}}
								>
									<Grid
										container
										direction="column"
										gap={0.25}
										alignItems="center"
										padding={1}
									>
										{item.id ? <UserBadge badge={item.id} fontSize={35}/> :
											<BlockSharp sx={{color: theme => theme.palette.text.disabled, fontSize: 35}}/>}
										<Box>
											<Typography color={data.level >= item.levelRequirement ? "textPrimary" : "textDisabled"}>
												{item.name}
											</Typography>
											{item.levelRequirement > 0 && <Typography color="textSecondary" fontSize={12}>
												V{item.levelRequirement}解锁
											</Typography>}
										</Box>
									</Grid>
								</ButtonBase>
							</Grid>
						))}
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button type="button" onClick={() => setIsManagingBadges(false)}>关闭</Button>
				</DialogActions>
			</Dialog>
			<Dialog
				open={openAvatarModifyDialog}
				onClose={() => setOpenAvatarModifyDialog(false)}
			>
				<MenuList>
					<MenuItem
						sx={{height: 48}}
						onClick={() => {
							document.getElementById("avatar-upload").click();
						}}
					>
						<ListItemIcon>
							<Upload/>
						</ListItemIcon>
						<ListItemText>上传头像</ListItemText>
					</MenuItem>
					<MenuItem
						sx={{height: 48}}
						onClick={() => {
							setAvatarProcessing(true);
							axios.post("/api/account/avatar/reset").then((res) => {
								setTimeout(() => {
									enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
									if (res.data.status === 1) {
										setOpenAvatarModifyDialog(false);
										setAvatarProcessing(false);
										refetch();
										setClientUser({
											...clientUser,
											avatarVersion: clientUser.avatarVersion + 1,
										});
									}
								}, 2000);
							});
						}}
					>
						<ListItemIcon>
							<Restore/>
						</ListItemIcon>
						<ListItemText>重置头像</ListItemText>
					</MenuItem>
				</MenuList>
			</Dialog>
		</Box>
	);
});

UserPage.propTypes = {
	username: PropTypes.string.isRequired,
}

const User = () => {
	const {username} = useParams();
	return <UserPage key={username} username={username}/>;
}

export default User;