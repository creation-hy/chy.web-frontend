import {Badge, List, ListItemButton, ListItemIcon, ListItemText, Switch, Table, TableBody, TableCell, TableRow} from "@mui/material";
import {AccountCircle, ArrowBack, Block, InfoOutlined, LockReset, LogoutOutlined, MailOutlined} from "@mui/icons-material";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import {useLocation, useNavigate, useParams} from "react-router";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid2";
import {useEffect, useRef, useState} from "react";
import TextField from "@mui/material/TextField";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import PropTypes from "prop-types";
import {NavigateButtonBase, NavigateLink} from "src/components/NavigateComponents.jsx";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import {useClientUser} from "src/components/ClientUser.jsx";
import Footer from "src/components/Footer.jsx";
import Button from "@mui/material/Button";

const SettingsItemButton = ({url, icon, text, onClick}) => {
	return (
		<Box>
			<NavigateButtonBase
				href={url}
				disableTouchRipple
				sx={{
					width: "100%",
					'&:active': {
						backgroundColor: theme => theme.palette.action.selected,
					},
				}}
			>
				<ListItemButton
					disableRipple
					onClick={onClick}
					sx={{pl: 3}}
				>
					<ListItemIcon>
						{icon}
					</ListItemIcon>
					<ListItemText primary={text}/>
				</ListItemButton>
			</NavigateButtonBase>
		</Box>
	);
}

SettingsItemButton.propTypes = {
	url: PropTypes.string,
	icon: PropTypes.node,
	text: PropTypes.string,
	onClick: PropTypes.func,
}

const MainSettings = () => {
	document.title = "设置 - chy.web";
	
	return (
		<>
			<CardContent>
				<Grid container sx={{minHeight: 40, pl: 0.5}} alignItems="center">
					<Typography variant="h5">
						设置
					</Typography>
				</Grid>
			</CardContent>
			<List>
				<SettingsItemButton url={"/settings/account"} icon={<AccountCircle/>} text={"账号设置"}/>
				<SettingsItemButton url={"/settings/chat"} icon={<MailOutlined/>} text={"聊天设置"}/>
				<SettingsItemButton url={"/settings/about"} icon={<InfoOutlined/>} text={"关于"}/>
				<SettingsItemButton
					onClick={() => {
						localStorage.removeItem("user_id");
						localStorage.removeItem("username");
						localStorage.removeItem("auth_token");
						window.location.href = "/login";
					}}
					icon={<LogoutOutlined/>}
					text={"登出"}
				/>
			</List>
		</>
	);
}

const AccountDeactivation = () => {
	const navigate = useNavigate();
	const location = useLocation();
	
	document.title = "停用账号 - chy.web";
	
	return (
		<CardContent>
			<Grid container alignItems="center" spacing={2} sx={{mb: 2}}>
				<IconButton onClick={() => navigate(location.pathname.replace(/\/[^/]+\/?$/, ''))}>
					<ArrowBack/>
				</IconButton>
				<Typography variant="h5">
					停用账号
				</Typography>
			</Grid>
			<Typography sx={{mt: 3}}>
				请使用您的注册邮箱向 account@creation-hy.top 发送一封内容为“DEACTIVATE”的邮件，我们会在接收到邮件的 30 天后停用您的账号。<br/><br/>
				在此期间内，如果您想取消停用请求，只需要发送一封内容为“REACTIVATE”的邮件即可。
			</Typography>
		</CardContent>
	);
}

const AccountSettings = () => {
	document.title = "账号设置 - chy.web";
	
	const navigate = useNavigate();
	const location = useLocation();
	
	return (
		<>
			<CardContent>
				<Grid container alignItems="center" spacing={2}>
					<IconButton onClick={() => navigate(location.pathname.replace(/\/[^/]+\/?$/, ''))}>
						<ArrowBack/>
					</IconButton>
					<Typography variant="h5">
						账号设置
					</Typography>
				</Grid>
			</CardContent>
			<List>
				<SettingsItemButton url={"/settings/account/reset-password"} icon={<LockReset/>} text={"重置密码"}/>
				<SettingsItemButton url={"/settings/account/deactivate"} icon={<Block/>} text={"停用账号"}/>
			</List>
		</>
	);
}

const ResetPassword = () => {
	document.title = "重置密码 - chy.web";
	
	const navigate = useNavigate();
	const location = useLocation();
	
	const emailText = useRef(null);
	const verificationText = useRef(null);
	const passwordText = useRef(null);
	
	const [verifyLoading, setVerifyLoading] = useState(false);
	const [resetLoading, setResetLoading] = useState(false);
	
	return (
		<CardContent>
			<Grid container alignItems="center" spacing={2}>
				<IconButton onClick={() => navigate(location.pathname.replace(/\/[^/]+\/?$/, ''))}>
					<ArrowBack/>
				</IconButton>
				<Typography variant="h5">
					重置密码
				</Typography>
			</Grid>
			<Typography sx={{mt: 3, mb: 2}}>
				我们需要验证你的邮箱。<br/>
				重置成功后，所有登录此账号的设备都将强制注销。
			</Typography>
			<Grid container direction="column" gap={2}>
				<Grid container gap={1}>
					<TextField
						autoComplete="email"
						inputRef={emailText}
						autoFocus
						required
						id="email"
						name="email"
						label="邮箱"
						placeholder="your@email.com"
						type="email"
						sx={{flex: 1}}
					/>
					<Button
						variant="contained"
						loading={verifyLoading}
						onClick={() => {
							setVerifyLoading(true);
							axios.post("/api/account/reset-password/send-verification", {email: emailText.current.value}, {
								headers: {
									"Content-Type": "application/json",
								},
							}).then(res => {
								enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
								setVerifyLoading(false);
							});
						}}
					>
						验证
					</Button>
				</Grid>
				<TextField
					inputRef={verificationText}
					autoComplete="verification"
					name="verificationCode"
					required
					fullWidth
					id="verification"
					placeholder="6位数字"
					label="验证码"
				/>
				<TextField
					inputRef={passwordText}
					autoComplete="new-password"
					type="password"
					name="password"
					required
					fullWidth
					id="password"
					placeholder="••••••"
					label="新密码"
				/>
				<Button
					loading={resetLoading}
					variant="contained"
					startIcon={<LockReset/>}
					onClick={() => {
						setResetLoading(true);
						
						axios.post("/api/account/reset-password/reset", {
							email: emailText.current.value,
							verificationCode: verificationText.current.value,
							password: passwordText.current.value,
						}, {
							headers: {
								"Content-Type": "application/json",
							},
						}).then(res => {
							setResetLoading(false);
							
							enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
							if (res.data.status === 1) {
								localStorage.removeItem("user_id");
								localStorage.removeItem("username");
								localStorage.removeItem("auth_token");
								setTimeout(() => window.location.href = "/login", 1000);
							}
						});
					}}
				>
					重置
				</Button>
			</Grid>
		</CardContent>
	);
}

const ChatSettings = () => {
	document.title = "聊天设置 - chy.web";
	
	const navigate = useNavigate();
	const location = useLocation();
	
	const settingItems = ["allowNotification", "allowPublicNotification", "allowCurrentNotification", "displayNotificationContent"];
	const settingItemsDisplay = ["允许通知", "允许公共频道通知", "允许当前联系人通知", "通知显示消息内容"];
	
	const [settings, setSettings] = useState(JSON.parse(localStorage.getItem("chatSettings")) ?? {});
	
	const {clientUser, setClientUser} = useClientUser();
	
	useEffect(() => {
		if (clientUser) {
			setSettings(settings => {
				const newSettings = {
					...settings,
					allowMessageFrom: clientUser.allowMessageFrom,
				};
				localStorage.setItem("chatSettings", JSON.stringify(newSettings));
				return newSettings;
			});
		}
	}, [clientUser]);
	
	return (
		<CardContent>
			<Grid container alignItems="center" spacing={2} sx={{mb: 2}}>
				<IconButton onClick={() => navigate(location.pathname.replace(/\/[^/]+\/?$/, ''))}>
					<ArrowBack/>
				</IconButton>
				<Typography variant="h5">
					聊天设置
				</Typography>
			</Grid>
			<Table>
				<TableBody>
					{settingItems.map((item, index) => (
						<TableRow key={item}>
							<TableCell sx={{py: 1, pl: 1}}>
								<Typography>
									{settingItemsDisplay[index]}
								</Typography>
							</TableCell>
							<TableCell align="right" sx={{py: 1, pr: 0}}>
								<Switch
									checked={settings[item] !== false}
									onChange={(event) => {
										const newSettings = {...settings, [item]: event.target.checked};
										setSettings(newSettings);
										localStorage.setItem("chatSettings", JSON.stringify(newSettings));
									}}
								/>
							</TableCell>
						</TableRow>
					))}
					<TableRow key="allowMessageFrom">
						<TableCell sx={{py: 1, pl: 1, border: 0}}>
							<Typography>
								允许的消息来源
							</Typography>
						</TableCell>
						<TableCell align="right" sx={{py: 1, pr: 1, border: 0}}>
							<Select
								variant="outlined"
								size="small"
								value={settings.allowMessageFrom ?? "ALL"}
								onChange={(event) => {
									setSettings(settings => {
										const newSettings = {...settings, allowMessageFrom: event.target.value};
										localStorage.setItem("chatSettings", JSON.stringify(newSettings));
										return newSettings;
									});
									
									setClientUser(clientUser => ({
										...clientUser,
										allowMessageFrom: event.target.value,
									}));
									
									axios.post(`/api/account/allow-message-from/modify`, {allowMessageFrom: event.target.value}, {
										headers: {
											'Content-Type': 'application/json',
										},
									});
								}}
							>
								<MenuItem value="ALL">所有人</MenuItem>
								<MenuItem value="FOLLOWING">关注的人</MenuItem>
								<MenuItem value="SELF">仅自己</MenuItem>
							</Select>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
			<Divider/>
		</CardContent>
	);
}

const About = () => {
	const navigate = useNavigate();
	const location = useLocation();
	
	document.title = "关于 - chy.web";
	
	return (
		<CardContent sx={{display: "flex", flexDirection: "column", height: "100%"}}>
			<Grid container alignItems="center" spacing={2} sx={{mb: 2}}>
				<IconButton onClick={() => navigate(location.pathname.replace(/\/[^/]+\/?$/, ''))}>
					<ArrowBack/>
				</IconButton>
				<Typography variant="h5">
					关于
				</Typography>
			</Grid>
			<Box sx={{mb: 2}}>
				<Typography variant="h3" align="center" fontWeight="bold" mt={1}>
					<Badge badgeContent="Beta" color="primary">
						chy.web 5.1
					</Badge>
				</Typography>
			</Box>
			<Box>
				<Typography align="center">
					开发团队：<NavigateLink color="primary" underline="always" href={"/user/creation_hy"}>chy</NavigateLink>,&nbsp;
					<NavigateLink color="primary" underline="always" href={"/user/Administrator"}>6913</NavigateLink>
				</Typography>
				<Typography align="center">
					官方账号：<NavigateLink color="primary" underline="always" href={"/user/chy.web"}>chy.web</NavigateLink>
				</Typography>
				<Footer/>
			</Box>
		</CardContent>
	);
}

export const Settings = () => {
	const navigate = useNavigate();
	const {item1, item2} = useParams();
	
	let cardContent;
	
	if (!item1) {
		cardContent = <MainSettings/>;
	} else if (item1 === "account") {
		if (!item2) {
			cardContent = <AccountSettings/>;
		} else if (item2 === "reset-password") {
			cardContent = <ResetPassword/>;
		} else if (item2 === "deactivate") {
			cardContent = <AccountDeactivation/>
		}
	} else if (item1 === "chat") {
		if (!item2) {
			cardContent = <ChatSettings/>;
		}
	} else if (item1 === "about") {
		if (!item2) {
			cardContent = <About/>;
		}
	}
	
	useEffect(() => {
		if (!cardContent) {
			navigate("/settings");
		}
	}, [cardContent, navigate]);
	
	return (
		<Container maxWidth="sm" sx={{p: 0, flex: 1, display: "flex", flexDirection: "column"}}>
			<Card variant="outlined" sx={{flex: 1}}>
				{cardContent}
			</Card>
		</Container>
	);
}