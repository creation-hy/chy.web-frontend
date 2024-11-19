import Box from "@mui/material/Box";
import {useNavigate, useParams} from "react-router";
import {memo, useEffect, useMemo, useRef, useState} from "react";
import {
	Alert,
	CircularProgress,
	InputLabel,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	MenuList,
	Modal,
	Paper,
	Tab,
	Tabs
} from "@mui/material";
import axios from "axios";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Cookies from "js-cookie";
import {enqueueSnackbar} from "notistack";
import PropTypes from "prop-types";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {
	EditOutlined,
	LockResetOutlined,
	LogoutOutlined,
	MailOutlined,
	PersonAddDisabledOutlined,
	PersonAddOutlined,
	Restore,
	Upload,
	Verified
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
import ResetPassword from "src/components/ResetPassword.jsx";
import {convertDateToLocaleAbsoluteString, convertDateToLocaleDateString} from "src/assets/DateUtils.jsx";
import {UserAvatar} from "src/components/UserAvatar.jsx";
import Chip from "@mui/material/Chip";
import {Cropper} from "react-cropper";
import "cropperjs/dist/cropper.css";
import {useClientUser} from "src/components/ClientUser.jsx";

const News = memo(({username, displayName, avatarVersion}) => {
	const {data} = useQuery({
		queryKey: ["news", username],
		queryFn: () => axios.get(`/api/user/${username}/chat/0`).then(res => res.data),
		staleTime: Infinity,
	});
	
	const [chatList, setChatList] = useState([]);
	
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
		<Box>
			{chatList.map((item) => (
				<Grid
					container
					key={item.id}
					ref={item === chatList[chatList.length - 1] ? lastMessageRef : undefined}
					justifyContent='flex-start'
					alignItems="flex-start"
					sx={{my: 3}}
				>
					<IconButton sx={{mr: 1.5, p: 0}}>
						<UserAvatar username={username} displayName={displayName} avatarVersion={avatarVersion}/>
					</IconButton>
					<Grid container direction="column" sx={{maxWidth: "75%"}} alignItems='flex-start' spacing={0.7}>
						<Paper
							elevation={3}
							sx={{
								padding: '8px 11px',
								borderRadius: '10px',
								wordBreak: 'break-word',
								maxWidth: "100%",
							}}
						>
							<Box sx={{fontSize: 15}}>
								<ChatMarkdown>{item.content}</ChatMarkdown>
							</Box>
							<Typography variant="caption" display="block" textAlign="right" mt={1}>
								{convertDateToLocaleAbsoluteString(item.time)}
							</Typography>
						</Paper>
						{item.quote != null &&
							<Chip
								variant="outlined"
								avatar={<UserAvatar username={item.quote.username} displayName={item.quote.displayName}
								                    avatarVersion={item.quote.avatarVersion}/>}
								label={item.quote.displayName + ": " + item.quote.content}
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

const Follows = memo(({username, type}) => {
	const [userList, setUserList] = useState([]);
	const navigate = useNavigate();
	
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
			setUserList([...res.data.result]);
		});
	}, [username, type]);
	
	useEffect(() => {
		if (lastUserRef.current) {
			pageNumberCurrent.current = pageNumberNew.current;
			pageLoadingObserver.disconnect();
			pageLoadingObserver.observe(lastUserRef.current);
		}
	}, [userList]);
	
	return (
		<List sx={{mt: -2}}>
			{userList.map((item) => (
				<ListItem key={item.username} ref={item === userList[userList.length - 1] ? lastUserRef : undefined} sx={{p: 0}}>
					<ListItemButton onClick={() => navigate(`/user/${item.username}`)}>
						<ListItemAvatar>
							<UserAvatar username={item.username} displayName={item.displayName} avatarVersion={item.avatarVersion}/>
						</ListItemAvatar>
						<ListItemText
							primary={
								<Typography fontWeight="bold" noWrap overflow="hidden" textOverflow="ellipsis">
									{item.displayName}
								</Typography>
							}
							secondary={
								<Typography fontSize={14} color="text.secondary" noWrap overflow="hidden" textOverflow="ellipsis">
									@{item.username}
								</Typography>
							}
						/>
					</ListItemButton>
				</ListItem>
			))}
		</List>
	);
});

Follows.propTypes = {
	username: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
}

const TabPanel = memo(({value, username, displayName, avatarVersion}) => {
	if (value === 0) {
		return <News username={username} displayName={displayName} avatarVersion={avatarVersion}/>;
	}
	
	if (value === 1) {
		return <Follows username={username} type="following"/>;
	}
	
	return <Follows username={username} type="follower"/>;
});

TabPanel.propTypes = {
	value: PropTypes.number.isRequired,
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
}

const doFollow = (username, setIsFollowing, queryClient) => {
	axios.post("/api/user/" + username + "/follow").then(res => {
		enqueueSnackbar(res.data.content, {variant: res.data.status === 0 ? "error" : "success"});
		if (res.data.status === 1) {
			setIsFollowing(true);
			queryClient.invalidateQueries({queryKey: ["follower"]});
		} else if (res.data.status === 2) {
			setIsFollowing(false);
			queryClient.invalidateQueries({queryKey: ["follower"]});
		}
	})
};

const myname = Cookies.get("username");

const UserPage = memo(({username}) => {
	const navigate = useNavigate();
	const {clientUser, setClientUser} = useClientUser();
	
	const [value, setValue] = useState(0);
	const [modifying, setModifying] = useState(false);
	const [isFollowing, setIsFollowing] = useState(null);
	const [resetPasswordOn, setResetPasswordOn] = useState(false);
	
	const [openAvatarModifyDialog, setOpenAvatarModifyDialog] = useState(false);
	const [avatarProcessing, setAvatarProcessing] = useState(false);
	
	const [avatarVersion, setAvatarVersion] = useState(1);
	const [showAvatarCropper, setShowAvatarCropper] = useState(false);
	const [avatarSrc, setAvatarSrc] = useState();
	const avatarCropper = useRef(null);
	
	const queryClient = useQueryClient();
	
	const handleChange = (event, newValue) => {
		setValue(newValue);
	};
	
	const {data, isLoading} = useQuery({
		queryKey: ["user-init", username],
		queryFn: () => axios.get("/api/user/" + username + "/info").then(res => res.data),
	});
	
	useEffect(() => {
		if (data && data.username) {
			document.getElementById("tab-following").innerHTML = "关注(" + data["followingCount"] + ")";
			document.getElementById("tab-follower").innerHTML = "粉丝(" + data["followerCount"] + ")";
			setIsFollowing(data["alreadyFollowing"]);
			setAvatarVersion(data.avatarVersion);
		}
	}, [data]);
	
	if (isLoading)
		return null;
	
	if (!data || !data.username)
		return <Alert severity="error">用户不存在！</Alert>;
	
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
							<UserAvatar username={data.username} displayName={data.displayName}
							            avatarVersion={avatarVersion} width={100} height={100}/>
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
						<ResetPassword open={resetPasswordOn} handleClose={() => setResetPasswordOn(false)}/>
						<Grid container direction="column" justifyContent="center">
							<Box display="flex" gap={0.5} alignItems="center" margin={0} flexShrink={1} flexWrap="nowrap" width="100%">
								<Typography variant="h5" fontWeight="bold" noWrap overflow="hidden" textOverflow="ellipsis">
									{data.displayName}
								</Typography>
								{!isLoading && data["verification"] && (<Verified color="primary"/>)}
							</Box>
							<Typography color="text.secondary" sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
								@{data.username}
							</Typography>
							{data.username === myname ? (
								<Box sx={{pt: "2px"}}>
									<IconButton onClick={() => setModifying(true)}>
										<EditOutlined/>
									</IconButton>
									<IconButton onClick={() => setResetPasswordOn(true)}>
										<LockResetOutlined/>
									</IconButton>
									<IconButton onClick={() => navigate(`/chat/${data.username}`)}>
										<MailOutlined/>
									</IconButton>
									<IconButton
										onClick={() => {
											Cookies.remove("username");
											Cookies.remove("user_token");
											window.location.href = "/login";
										}}
									>
										<LogoutOutlined/>
									</IconButton>
								</Box>
							) : (
								<Box flexShrink={0}>
									<IconButton onClick={() => doFollow(data.username, setIsFollowing, queryClient)}>
										{isFollowing == null ? null : (isFollowing ? <PersonAddDisabledOutlined/> : <PersonAddOutlined/>)}
									</IconButton>
									<IconButton onClick={() => navigate(`/chat/${data.username}`)}>
										<MailOutlined/>
									</IconButton>
								</Box>
							)}
						</Grid>
					</Grid>
					<Typography fontSize={14} color="text.secondary">
						注册于{convertDateToLocaleDateString(data.registrationTime)}<br/>
						性别：{data.gender}
					</Typography>
					<Box id="introduction" sx={{fontSize: 15, maxWidth: "100%"}}>
						<ChatMarkdown>{data["introduction"]}</ChatMarkdown>
					</Box>
				</Grid>
			</Card>
			<Box sx={{borderBottom: 1, borderColor: 'divider', mb: 2, mt: 2}}>
				<Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
					<Tab label="动态" data-option="chat"/>
					<Tab label="关注" data-option="following" id="tab-following"/>
					<Tab label="粉丝" data-option="follower" id="tab-follower"/>
				</Tabs>
			</Box>
			<TabPanel value={value} username={data.username} displayName={data.displayName} avatarVersion={avatarVersion}/>
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