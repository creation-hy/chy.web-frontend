import Box from "@mui/material/Box";
import {useNavigate, useParams} from "react-router";
import {Fragment, memo, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
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
import Grid from "@mui/material/Grid2";
import Cookies from "js-cookie";
import {enqueueSnackbar} from "notistack";
import PropTypes from "prop-types";
import {useQuery} from "@tanstack/react-query";
import {
	Block,
	BlockSharp,
	EditOutlined,
	MailOutlined,
	PersonAdd,
	PersonAddOutlined,
	PersonOffOutlined,
	PersonOutlined,
	Restore,
	SwapHoriz,
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
import "cropperjs/dist/cropper.css";
import {useClientUser} from "src/components/ClientUser.jsx";
import {supportedBadges, UserAvatar, UserBadge, UsernameWithBadge} from "src/components/UserComponents.jsx";
import {NavigateButtonBase, NavigateIconButton, NavigateLink} from "src/components/NavigateComponents.jsx";
import Divider from "@mui/material/Divider";
import {MessageFile} from "src/pages/Chat.jsx";

const myname = Cookies.get("username");

const News = memo(function News({username, displayName, avatarVersion}) {
	const {data} = useQuery({
		queryKey: ["news", username],
		queryFn: () => axios.get(`/api/user/${username}/chat/0`).then(res => res.data),
		staleTime: Infinity,
	});
	
	const [chatList, setChatList] = useState(null);
	
	const pageNumberCurrent = useRef(0);
	const pageNumberNew = useRef(0);
	const lastMessageRef = useRef(null);
	const pageLoadingObserver = useRef(new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting && pageNumberNew.current === pageNumberCurrent.current) {
			pageNumberNew.current = pageNumberCurrent.current + 1;
			axios.get(`/api/user/${username}/chat/${pageNumberNew.current}`).then(res => {
				if (res.data.result.length > 0) {
					setChatList(chatList => [...chatList, ...res.data.result]);
				}
			});
		}
	}));
	
	useEffect(() => {
		if (data && data.result) {
			setChatList([...data.result]);
		}
	}, [data]);
	
	useEffect(() => {
		if (lastMessageRef.current) {
			pageNumberCurrent.current = pageNumberNew.current;
			pageLoadingObserver.current.disconnect();
			pageLoadingObserver.current.observe(lastMessageRef.current);
		}
	}, [chatList]);
	
	return (
		<Box sx={{mt: -0.5}}>
			{!chatList && (
				<Box textAlign="center" mt={4}>
					<CircularProgress/>
				</Box>
			)}
			{chatList && chatList.map((chat, chatIndex) => (
				<Grid
					container
					key={chat.id}
					ref={chatIndex === chatList.length - 1 ? lastMessageRef : undefined}
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
			))}
		</Box>
	);
});

News.propTypes = {
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
}

const UserItem = memo(function UserItem({username, displayName, avatarVersion, badge, introduction, isFollowing, isFollowedBy, isBlocking, showBlockButton}) {
	const [isFollowingState, setIsFollowing] = useState(isFollowing);
	const [isBlockingState, setIsBlocking] = useState(isBlocking);
	
	return (
		<>
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
							variant={isFollowingState ? "outlined" : "contained"}
							sx={{ml: 2, flexShrink: 0}}
							disabled={username === myname}
							startIcon={isFollowedBy && isFollowingState ? <SwapHoriz/> : (isFollowingState ? <PersonOutlined/> : <PersonAdd/>)}
							onClick={() => {
								axios.post("/api/user/" + username + "/follow").then(res => {
									if (res.data.status === 1) {
										setIsFollowing(true);
									} else if (res.data.status === 2) {
										setIsFollowing(false);
									} else {
										enqueueSnackbar(res.data.content, {variant: "error"});
									}
								})
							}}
						>
							{isFollowingState ? (isFollowedBy ? "已互关" : "已关注") : "关注"}
						</Button>
					) : (
						<Button
							color="error"
							variant={isBlockingState ? "outlined" : "contained"}
							sx={{ml: 2, flexShrink: 0}}
							disabled={username === myname}
							startIcon={<Block/>}
							onClick={() => {
								axios.post("/api/user/" + username + "/block").then(res => {
									if (res.data.status === 1) {
										setIsBlocking(true);
									} else if (res.data.status === 2) {
										setIsBlocking(false);
									} else {
										enqueueSnackbar(res.data.content, {variant: "error"});
									}
								})
							}}
						>
							{isBlockingState ? "已屏蔽" : "屏蔽"}
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
		</>
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
}

const Follows = memo(function Follows({username, type}) {
	const [followingList, setFollowingList] = useState(null);
	const [followersList, setFollowersList] = useState(null);
	const [blockingList, setBlockingList] = useState(null);
	const [userList, setUserList] = useState(null);
	
	const [showBlockButton, setShowBlockButton] = useState(false);
	
	const pageNumberCurrent = useRef(0);
	const pageNumberNew = useRef(0);
	const lastUserRef = useRef(null);
	const pageLoadingObserver = useMemo(() => new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting && pageNumberNew.current === pageNumberCurrent.current) {
			pageNumberNew.current = pageNumberCurrent.current + 1;
			axios.get(`/api/user/${username}/${type}/${pageNumberNew.current}`).then(res => {
				if (res.data.result.length > 0) {
					setUserList(userList => [...userList, ...res.data.result]);
				}
			});
		}
	}), [username, type]);
	
	useEffect(() => {
		axios.get(`/api/user/${username}/${type}/0`).then(res => {
			pageNumberNew.current = 0;
			pageNumberCurrent.current = 0;
			if (type === "following") {
				setFollowingList([...res.data.result]);
			} else if (type === "followers") {
				setFollowersList([...res.data.result]);
			} else {
				setBlockingList([...res.data.result]);
			}
		});
	}, [username, type]);
	
	useEffect(() => {
		if (type === "following") {
			setShowBlockButton(false);
			setUserList(followingList);
		}
	}, [followingList, type]);
	
	useEffect(() => {
		if (type === "followers") {
			setShowBlockButton(false);
			setUserList(followersList);
		}
	}, [followersList, type]);
	
	useEffect(() => {
		if (type === "blocking") {
			setShowBlockButton(true);
			setUserList(blockingList);
		}
	}, [blockingList, type]);
	
	useEffect(() => {
		if (lastUserRef.current) {
			pageNumberCurrent.current = pageNumberNew.current;
			pageLoadingObserver.disconnect();
			pageLoadingObserver.observe(lastUserRef.current);
		}
	}, [pageLoadingObserver, userList]);
	
	return (
		<List sx={{pt: 0, mt: -1}}>
			{!userList && (
				<Box textAlign="center" mt={4}>
					<CircularProgress/>
				</Box>
			)}
			{userList && userList.map((user, userIndex) => (
				<Fragment key={user.username}>
					{userIndex !== 0 && <Divider/>}
					<Box sx={{px: 2, py: 2.5}} ref={userIndex === userList.length - 1 ? lastUserRef : undefined}>
						<UserItem
							username={user.username}
							displayName={user.displayName}
							avatarVersion={user.avatarVersion}
							badge={user.badge}
							introduction={user.introduction}
							isFollowing={user.isFollowing}
							isFollowedBy={user.isFollowedBy}
							isBlocking={user.isBlocking}
							showBlockButton={showBlockButton}
						/>
					</Box>
				</Fragment>
			))}
		</List>
	);
});

Follows.propTypes = {
	username: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
}

const TabPanel = memo(function TabPanel({value, username, displayName, avatarVersion}) {
	if (value === 0) {
		return <News username={username} displayName={displayName} avatarVersion={avatarVersion}/>;
	}
	
	if (value === 1) {
		return <Follows username={username} type="following"/>;
	}
	
	if (value === 2) {
		return <Follows username={username} type="followers"/>;
	}
	
	return <Follows username={username} type="blocking"/>;
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

const UserPage = memo(function UserPage({username}) {
	const {clientUser, setClientUser} = useClientUser();
	const {tab} = useParams();
	const navigate = useNavigate();
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
	
	const tabs = username === myname ? [undefined, "following", "followers", "blocking"] : [undefined, "following", "followers"];
	const [tabValue, setTabValue] = useState(Math.max(tabs.indexOf(tab), 0));
	const [followingCount, setFollowingCount] = useState(0);
	const [followersCount, setFollowersCount] = useState(0);
	
	const [modifying, setModifying] = useState(false);
	const [isFollowing, setIsFollowing] = useState(null);
	const [isBlocking, setIsBlocking] = useState(null);
	
	const [isManagingBadges, setIsManagingBadges] = useState(false);
	const [myBadge, setMyBadge] = useState(null);
	
	const [openAvatarModifyDialog, setOpenAvatarModifyDialog] = useState(false);
	const [avatarProcessing, setAvatarProcessing] = useState(false);
	
	const [avatarVersion, setAvatarVersion] = useState(1);
	const [showAvatarCropper, setShowAvatarCropper] = useState(false);
	const [avatarSrc, setAvatarSrc] = useState();
	const avatarCropper = useRef(null);
	
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [dataVersion, setDataVersion] = useState(0);
	
	useEffect(() => {
		axios.get(`/api/user/${username}/info`).then(res => {
			setData(res.data);
			setIsLoading(false);
		});
	}, [username, dataVersion]);
	
	useLayoutEffect(() => {
		if (data && data.username) {
			setFollowingCount(data.followingCount);
			setFollowersCount(data.followerCount);
			setIsFollowing(data.isFollowing);
			setIsBlocking(data.isBlocking);
			setAvatarVersion(data.avatarVersion);
			setMyBadge(data.badge);
		}
	}, [data]);
	
	useEffect(() => {
		setTabValue(Math.max(tabs.indexOf(tab), 0));
		if (tabs.indexOf(tab) === -1) {
			navigate(`/user/${username}`);
		}
	}, [tab]);
	
	if (isLoading) {
		return null;
	}
	
	if (!data || !data.username) {
		return <Alert severity="error">用户不存在！</Alert>;
	}
	
	document.title = `${data.displayName} (@${data.username}) 的主页 - chy.web`;
	
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
								            avatarVersion={avatarVersion} width={100} height={100}/>
							</IconButton>
						) : (
							<Badge
								badgeContent={isBlocking ? <Block fontSize="large"/> : undefined}
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
								            avatarVersion={avatarVersion} width={100} height={100}/>
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
												
												setAvatarVersion(version => {
													const newVersion = -(Math.abs(version) + 1);
													
													setClientUser({
														...clientUser,
														avatarVersion: newVersion,
													});
													
													return newVersion;
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
								<UsernameWithBadge username={data.displayName} badge={myBadge} fontSize={20} size={22}/>
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
									{isFollowing == null ? null : (isFollowing ? (
										<Tooltip title="取消关注">
											<IconButton onClick={() => {
												doFollow(data.username, setIsFollowing).then(() => {
													setDataVersion(version => version + 1);
												});
											}}>
												<PersonOffOutlined/>
											</IconButton>
										</Tooltip>
									) : (
										<Tooltip title="关注">
											<IconButton onClick={() => {
												doFollow(data.username, setIsFollowing).then(() => {
													setDataVersion(version => version + 1);
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
									<Tooltip title={isBlocking ? "取消屏蔽" : "屏蔽"}>
										<IconButton onClick={() => {
											axios.post(`/api/user/${data.username}/block`).then(res => {
												if (res.data.status === 1) {
													setIsBlocking(true);
												} else if (res.data.status === 2) {
													setIsBlocking(false);
												} else {
													enqueueSnackbar(res.data.content, {variant: "error"});
												}
											});
										}}>
											<Block color={isBlocking ? "inherit" : "error"}/>
										</IconButton>
									</Tooltip>
								</Box>
							)}
						</Grid>
					</Grid>
					<Typography fontSize={14} color="text.secondary">
						注册于{convertDateToLocaleDateString(data.registrationTime)}<br/>
						性别：{data.gender}
					</Typography>
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
					<Tab label={`关注(${followingCount})`}/>
					<Tab label={`粉丝(${followersCount})`}/>
					{username === myname && <Tab label={`屏蔽(${data.blockingCount})`}/>}
				</Tabs>
			</Box>
			<TabPanel value={tabValue} username={data.username} displayName={data.displayName} avatarVersion={avatarVersion}/>
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
						enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
						if (res.data.status === 1) {
							setTimeout(() => window.location.reload(), 500);
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
								<MenuItem value="未知">未知</MenuItem>
								<MenuItem value="男">男</MenuItem>
								<MenuItem value="女">女</MenuItem>
								<MenuItem value="男の娘">男の娘</MenuItem>
								<MenuItem value="假小子">假小子</MenuItem>
								<MenuItem value="Futanari">Futanari</MenuItem>
								<MenuItem value="MtF">MtF</MenuItem>
								<MenuItem value="MtX">MtX</MenuItem>
								<MenuItem value="FtM">FtM</MenuItem>
								<MenuItem value="FtX">FtX</MenuItem>
								<MenuItem value="Non-binary">Non-binary</MenuItem>
								<MenuItem value="无">无</MenuItem>
								<MenuItem value="汉堡王">汉堡王</MenuItem>
								<MenuItem value="西瓜霜">西瓜霜</MenuItem>
								<MenuItem value="北洋军阀">北洋军阀</MenuItem>
								<MenuItem value="其它">其它</MenuItem>
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
									border: myBadge === item.id ? 2 : 0,
									borderColor: theme => theme.palette.primary.main,
									borderRadius: 1,
								}}
							>
								<ButtonBase
									sx={{
										borderRadius: myBadge === item.id ? 0 : 1,
										width: "100%",
										height: "100%",
									}}
									onClick={() => {
										if (data.level >= item.levelRequirement && myBadge !== item.id) {
											axios.post("/api/account/badge/modify", {badge: item.id}, {
												headers: {
													"Content-Type": "application/json",
												},
											}).then(res => {
												if (res.data.status === 1) {
													setMyBadge(item.id);
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
										
										setAvatarVersion(version => {
											const newVersion = -(Math.abs(version) + 1);
											
											setClientUser({
												...clientUser,
												avatarVersion: newVersion,
											});
											
											return newVersion;
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