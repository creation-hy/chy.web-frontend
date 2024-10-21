import Box from "@mui/material/Box";
import {useParams} from "react-router";
import {useState} from "react";
import {Alert, Input, InputLabel, Paper, Tab, Tabs} from "@mui/material";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Cookies from "js-cookie";
import {enqueueSnackbar} from "notistack";
import PropTypes from "prop-types";
import {useQuery} from "@tanstack/react-query";
import {Edit, Logout, PersonAdd, PersonAddDisabled, Verified} from "@mui/icons-material";
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

function a11yProps(index) {
	return {
		id: `simple-tab-${index}`,
	};
}

function InfoContainer({value, username}) {
	const opt = value === 0 ? "info" : (value === 1 ? "chat" : (value === 2 ? "following" : "follower"));
	const url = opt === "chat" ? "/chat/-1" : "/" + opt;
	
	const {data, isLoading, error} = useQuery({
		queryKey: [opt],
		queryFn: () => axios.get("/api/user/" + username + url).then(res => res.data),
	});
	
	if (error || isLoading)
		return null;
	
	if (value === 0)
		return (
			<Typography>
				用户编号：{data["userId"]}<br/>
				性别：{data["sex"]}<br/>
				注册时间：{new Date(data["regTime"]).toLocaleString()}
			</Typography>
		);
	
	if (value === 1)
		return (
			<Box>
				{data.result.map((item, index) => (
					<Grid container key={index} justifyContent='flex-start' alignItems="flex-start" sx={{my: 2.5}}>
						<IconButton sx={{mr: 1.5, p: 0}} href={"/user/" + username}>
							<Avatar src={"/usericon/" + username + ".png"} alt={username}/>
						</IconButton>
						<Grid container direction="column" sx={{maxWidth: "60%"}} alignItems='flex-end' spacing={0.7}>
							<Paper
								elevation={3}
								sx={{
									padding: '8px 16px',
									borderRadius: '16px',
									wordBreak: 'break-word',
								}}
							>
								<Box sx={{fontSize: 15}}>
									<ChatMarkdown>{item.content}</ChatMarkdown>
								</Box>
								<Typography variant="caption" display="block" textAlign="right" mt={1}>
									{new Date(item.time).toLocaleString()}
								</Typography>
							</Paper>
						</Grid>
					</Grid>
				))}
			</Box>
		);
	
	return (
		<Grid container direction="column" spacing={3}>
			{data.result.map((item, index) => (
				<Grid container key={index} alignItems="center" spacing={1.5}>
					<Avatar src={"/usericon/" + item.username + ".png"} alt={item.username}/>
					<Typography variant="h6" sx={{cursor: "pointer"}} onClick={() => {
						window.location.href = item.username;
					}}>
						<Grid container gap={0.5} alignItems="center">
							{item.username}{item["certification"] != null && (<Verified color="primary"/>)}
						</Grid>
					</Typography>
				</Grid>
			))}
		</Grid>
	);
}

InfoContainer.propTypes = {
	value: PropTypes.number.isRequired,
	username: PropTypes.string.isRequired,
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
		enqueueSnackbar(res.data["content"], {variant: res.data["status"] === 0 ? "error" : "success"});
	});
}

export default function User() {
	const {username} = useParams();
	
	document.title = username + "的主页 - chy.web";
	
	const [value, setValue] = useState(0);
	const [modifying, setModifying] = useState(false);
	const [inited, setInited] = useState(false);
	const [isMe, setIsMe] = useState(false);
	const [isFollowing, setIsFollowing] = useState(null);
	
	const handleChange = (event, newValue) => {
		setValue(newValue);
	};
	
	const {data, isLoading, error} = useQuery({
		queryKey: ["user-init"],
		queryFn: () => axios.get("/api/user/" + username + "/info").then(res => res.data),
	});
	
	if (!isLoading && !error && !inited) {
		if (data["userId"] == null)
			return (
				<Alert severity="error">用户不存在！</Alert>
			);
		document.getElementById("tab-following").innerHTML += "(" + data["followingCount"] + ")";
		document.getElementById("tab-follower").innerHTML += "(" + data["followerCount"] + ")";
		setIsFollowing(data["alreadyFollowing"]);
		setIsMe(username === Cookies.get("username"));
		setInited(true);
	}
	
	return (
		<Box>
			<Card>
				<CardContent>
					<Grid container direction="column">
						<IconButton
							onClick={isMe ? () => document.getElementById("avatar-upload").click() : null}
							sx={{width: 75, height: 75, mb: 0.5}}
						>
							<Avatar
								alt={username}
								src={"/usericon/" + username + ".png"}
								sx={{width: 75, height: 75}}
							/>
						</IconButton>
						<Input type="file" id="avatar-upload" sx={{display: "none"}} onChange={uploadAvatar}/>
						<Grid container spacing={1} alignItems="center" sx={{pb: 1}}>
							<Typography gutterBottom variant="h6" display="flex" gap={0.5} alignItems="center" margin={0}>
								{username}{!isLoading && data["certification"] != null && (<Verified color="primary"/>)}
							</Typography>
							<Button variant="contained" sx={{display: isMe ? "none" : "flex"}}
							        onClick={() => doFollow(username)}>
								{isFollowing == null ? null : (isFollowing ? <PersonAddDisabled fontSize="small"/> : <PersonAdd fontSize="small"/>)}
							</Button>
							<Box id="my-container" display={isMe ? "flex" : "none"} gap={1}>
								<Button variant="contained" onClick={() => setModifying(true)}>
									<Edit fontSize="small"/>
								</Button>
								<Button variant="contained" onClick={logOut}>
									<Logout fontSize="small"/>
								</Button>
							</Box>
						</Grid>
						<Box id="intro" sx={{color: "text.secondary", fontSize: 14}}>
							<ChatMarkdown>{!isLoading ? data["intro"] : ""}</ChatMarkdown>
						</Box>
					</Grid>
				</CardContent>
			</Card>
			<Box sx={{borderBottom: 1, borderColor: 'divider', mb: 2, mt: 1}}>
				<Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
					<Tab label="信息" {...a11yProps(0)} data-option="info"/>
					<Tab label="动态" {...a11yProps(1)} data-option="chat"/>
					<Tab label="关注" {...a11yProps(2)} data-option="following" id="tab-following"/>
					<Tab label="粉丝" {...a11yProps(3)} data-option="follower" id="tab-follower"/>
				</Tabs>
			</Box>
			<InfoContainer value={value} username={username}/>
			<Dialog
				open={modifying}
				onClose={() => setModifying(false)}
				component="form"
				onSubmit={(event) => {
					event.preventDefault();
					const formData = new FormData(event.currentTarget);
					axios.post("/api/account/modify", formData, {
						headers: {
							"Content-Type": "application/json",
						},
					}).then(res => {
						enqueueSnackbar(res.data["content"], {variant: res.data["status"] === 1 ? "success" : "error"});
						if (res.data["status"] === 1)
							setTimeout(() => window.location.reload(), 500);
					});
					setModifying(false);
				}}
			>
				<DialogTitle>修改信息</DialogTitle>
				<DialogContent>
					<FormControl margin="dense">
						<InputLabel id="select-sex-label">性别</InputLabel>
						<Select
							labelId="select-sex-label"
							label="性别"
							variant="outlined"
							defaultValue={!isLoading && data["sex"]}
							name="sex"
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
							<MenuItem value="Intersex">Intersex</MenuItem>
							<MenuItem value="无">无</MenuItem>
							<MenuItem value="汉堡王">汉堡王</MenuItem>
							<MenuItem value="西瓜霜">西瓜霜</MenuItem>
							<MenuItem value="北洋军阀">北洋军阀</MenuItem>
							<MenuItem value="其它">其它</MenuItem>
						</Select>
					</FormControl><br/>
					<FormControl margin="dense" sx={{pt: 1}}>
						<TextField
							label="简介"
							fullWidth
							multiline
							maxRows={10}
							defaultValue={!isLoading && data["intro"]}
							name="intro"
						/>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button type="button" onClick={() => setModifying(false)}>关闭</Button>
					<Button type="submit">确认</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}