import Box from "@mui/material/Box";
import {useParams} from "react-router";
import {useEffect, useRef, useState} from "react";
import {Alert, InputLabel, Paper, Tab, Tabs} from "@mui/material";
import axios from "axios";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Cookies from "js-cookie";
import {enqueueSnackbar} from "notistack";
import PropTypes from "prop-types";
import {useQuery} from "@tanstack/react-query";
import {EditOutlined, LockResetOutlined, LogoutOutlined, MailOutlined, PersonAddDisabledOutlined, PersonAddOutlined, Verified} from "@mui/icons-material";
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

function InfoContainer({value, info}) {
	const opt = value === 0 ? "info" : (value === 1 ? "chat" : (value === 2 ? "following" : "follower"));
	const url = opt === "chat" ? "/chat/-1" : "/" + opt;
	
	const {data, isLoading, error} = useQuery({
		queryKey: [opt],
		queryFn: () => axios.get("/api/user/" + info.username + url).then(res => res.data),
	});
	
	const [chatList, setChatList] = useState([]);
	const chatListRef = useRef(-1);
	
	useEffect(() => {
		if (!error && !isLoading && value === 1) {
			setChatList([...data.result]);
			chatListRef.current = data.result;
			let lastScrollStartId = -1;
			window.addEventListener("scroll", () => {
				if (document.documentElement.scrollHeight - window.scrollY - window.innerHeight <= 50 &&
					lastScrollStartId !== chatListRef.current[chatListRef.current.length - 1].id - 1) {
					lastScrollStartId = chatListRef.current[chatListRef.current.length - 1].id - 1;
					axios.get("/api/user/" + info.username + "/chat/" + lastScrollStartId).then(res => {
						chatListRef.current = [...chatListRef.current, ...res.data.result];
						setChatList([...chatListRef.current]);
					});
				}
			});
		}
	}, [data, error, info.username, isLoading, value]);
	
	if (!data)
		return null;
	
	if (value === 0)
		return (
			<Typography>
				注册时间：{convertDateToLocaleDateString(data["registrationTime"])}<br/>
				性别：{data["gender"]}
			</Typography>
		);
	
	if (value === 1) {
		return (
			<Box>
				{chatList.map((item) => (
					<Grid container key={item.id} justifyContent='flex-start' alignItems="flex-start" sx={{my: 2.5}}>
						<IconButton sx={{mr: 1.5, p: 0}}>
							<Avatar src={"/avatars/" + info.username + ".png"} alt={info.displayName}/>
						</IconButton>
						<Grid container direction="column" sx={{maxWidth: "75%"}} alignItems='flex-end' spacing={0.7}>
							<Paper
								elevation={3}
								sx={{
									padding: '8px 11px',
									borderRadius: '10px',
									wordBreak: 'break-word',
								}}
							>
								<Box sx={{fontSize: 15}}>
									<ChatMarkdown>{item.content}</ChatMarkdown>
								</Box>
								<Typography variant="caption" display="block" textAlign="right" mt={1}>
									{convertDateToLocaleAbsoluteString(item.time)}
								</Typography>
							</Paper>
						</Grid>
					</Grid>
				))}
			</Box>
		);
	}
	
	return (
		<Grid container direction="column" spacing={3}>
			{data.result.map((item, index) => (
				<Grid container key={index} alignItems="center" spacing={1.5}>
					<Avatar src={"/avatars/" + item.username + ".png"} alt={item.displayName}/>
					<Grid container gap={0.5} alignItems="center">
						<Typography variant="h6" sx={{cursor: "pointer", fontWeight: "bold"}} onClick={() => {
							window.location.href = item.username;
						}}>
							{item.displayName}
						</Typography>
						{item["verification"] && (<Verified color="primary"/>)}
					</Grid>
				</Grid>
			))}
		</Grid>
	);
}

InfoContainer.propTypes = {
	value: PropTypes.number.isRequired,
	info: PropTypes.object,
}

const doFollow = (username, setIsFollowing) => {
	axios.post("/api/user/" + username + "/follow").then(res => {
		enqueueSnackbar(res.data.content, {variant: res.data.status === 0 ? "error" : "success"});
		if (res.data.status === 1)
			setIsFollowing(true);
		else if (res.data.status === 2)
			setIsFollowing(false);
	})
};

const logOut = () => {
	Cookies.remove("username");
	Cookies.remove("user_token");
	window.location.href = "/";
}

const uploadAvatar = (event) => {
	const formData = new FormData();
	formData.append("avatar", event.target.files[0]);
	axios.post("/api/account/upload-avatar", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	}).then((res) => {
		enqueueSnackbar(res.data.content, {variant: res.data.status === 0 ? "error" : "success"});
	});
}

const myname = Cookies.get("username");

export default function User() {
	const {username} = useParams();
	
	const [value, setValue] = useState(0);
	const [modifying, setModifying] = useState(false);
	const [isFollowing, setIsFollowing] = useState(null);
	const [resetPasswordOn, setResetPasswordOn] = useState(false);
	
	const handleChange = (event, newValue) => {
		setValue(newValue);
	};
	
	const {data, isLoading} = useQuery({
		queryKey: ["user-init"],
		queryFn: () => axios.get("/api/user/" + username + "/info").then(res => res.data),
	});
	
	useEffect(() => {
		if (data && data.username) {
			document.getElementById("tab-following").innerHTML += "(" + data["followingCount"] + ")";
			document.getElementById("tab-follower").innerHTML += "(" + data["followerCount"] + ")";
			setIsFollowing(data["alreadyFollowing"]);
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
				<Grid container direction="column" gap={1.5}>
					<Grid container alignItems="center" gap={1.5} wrap="nowrap" width="100%">
						{data.username === myname ? (
							<IconButton
								onClick={() => document.getElementById("avatar-upload").click()}
								sx={{width: 100, height: 100, mb: 0.5}}
							>
								<Avatar
									alt={data.displayName}
									src={"/avatars/" + data.username + ".png"}
									sx={{width: 100, height: 100}}
								/>
							</IconButton>
						) : (
							<Avatar
								alt={data.displayName}
								src={"/avatars/" + data.username + ".png"}
								sx={{width: 100, height: 100}}
							/>
						)}
						<input type="file" id="avatar-upload" onChange={uploadAvatar} accept="image/*" hidden/>
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
									<IconButton href={"/chat/" + data.username}>
										<MailOutlined/>
									</IconButton>
									<IconButton onClick={logOut}>
										<LogoutOutlined/>
									</IconButton>
								</Box>
							) : (
								<Box flexShrink={0}>
									<IconButton onClick={() => doFollow(data.username)}>
										{isFollowing == null ? null : (isFollowing ? <PersonAddDisabledOutlined/> : <PersonAddOutlined/>)}
									</IconButton>
									<IconButton href={"/chat/" + data.username}>
										<MailOutlined/>
									</IconButton>
								</Box>
							)}
						</Grid>
					</Grid>
					<Box id="introduction" sx={{fontSize: 15}}>
						<ChatMarkdown>{data["introduction"]}</ChatMarkdown>
					</Box>
				</Grid>
			</Card>
			<Box sx={{borderBottom: 1, borderColor: 'divider', mb: 2, mt: 1}}>
				<Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
					<Tab label="信息" data-option="info"/>
					<Tab label="动态" data-option="chat"/>
					<Tab label="关注" data-option="following" id="tab-following"/>
					<Tab label="粉丝" data-option="follower" id="tab-follower"/>
				</Tabs>
			</Box>
			<InfoContainer value={value} info={data}/>
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
						if (res.data.status === 1)
							setTimeout(() => window.location.reload(), 500);
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
		</Box>
	);
}