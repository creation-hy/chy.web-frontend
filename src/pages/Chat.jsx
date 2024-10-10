import {Fragment, useCallback, useEffect, useRef, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import {Alert, Badge, List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Paper, Switch} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import PropTypes from "prop-types";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import {
	AddLinkOutlined,
	AddPhotoAlternateOutlined,
	AddReactionOutlined,
	ArrowBack,
	DeleteOutline,
	FormatQuoteOutlined,
	MoreHoriz,
	SearchOutlined,
	Send,
	SettingsOutlined,
	TitleOutlined,
	VisibilityOutlined
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Markdown from "react-markdown";
import IconButton from "@mui/material/IconButton";
import {flushSync} from "react-dom";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SockJS from "sockjs-client";
import {Stomp} from "@stomp/stompjs";
import Cookies from "js-cookie";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {isMobile} from "react-device-detect";
import {enqueueSnackbar} from "notistack";
import Chip from "@mui/material/Chip";
import DialogTitle from "@mui/material/DialogTitle";

function UserItem({username, info}) {
	return (
		<Fragment>
			<ListItemAvatar>
				<Badge badgeContent={info["newMessageCount"]} overlap="circular" color="error">
					<Badge
						badgeContent={info["isOnline"] || username === "ChatRoomSystem" ? " " : 0} overlap="circular"
						anchorOrigin={{vertical: "bottom", horizontal: "right"}} color="success" variant="dot"
						sx={{
							"& .MuiBadge-badge": {
								backgroundColor: '#44b700',
								color: '#44b700',
								boxShadow: `0 0 0 2px`,
							}
						}}
					>
						<Avatar src={"/usericon/" + username + ".png"} alt={username}/>
					</Badge>
				</Badge>
			</ListItemAvatar>
			<ListItemText
				primary={
					<Grid container sx={{
						justifyContent: "space-between",
						flexWrap: "nowrap",
						whiteSpace: "nowrap",
						gap: 1,
					}}>
						<Typography sx={{
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
							flexShrink: 1,
						}}>
							{info["displayName"]}
						</Typography>
						<Typography>
							{info["lastMessageTime"]}
						</Typography>
					</Grid>
				}
				secondary={
					<Typography variant="body2" color="textSecondary" sx={{
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}>
						{info["lastMessageText"]}
					</Typography>
				}
			/>
		</Fragment>
	);
}

UserItem.propTypes = {
	username: PropTypes.string,
	info: PropTypes.any,
}

const Message = ({messageId, isMe, username, content, quote, timestamp, messagesRef, setQuote}) => {
	const [contextMenu, setContextMenu] = useState(null);
	const [onDialog, setOnDialog] = useState(false);
	const [contentState, setContent] = useState(content);
	const queryClient = useQueryClient();
	
	return (
		<Grid container justifyContent={isMe ? 'flex-end' : 'flex-start'} alignItems="flex-start" sx={{my: 2}} id={"message-" + messageId}>
			{!isMe && <IconButton sx={{mr: 1.5, p: 0}} href={"/user/" + username}><Avatar src={"/usericon/" + username + ".png"} alt={username}/></IconButton>}
			<Grid container direction="column" sx={{maxWidth: "60%"}} alignItems={isMe ? 'flex-end' : 'flex-start'} spacing={0.7}>
				<Paper
					elevation={3}
					sx={{
						padding: '8px 16px',
						borderRadius: '16px',
						backgroundColor: isMe ? '#1976d2' : 'normal',
						color: isMe ? 'white' : 'normal',
						wordBreak: 'break-word',
						userSelect: isMobile ? "none" : "auto",
					}}
					onContextMenu={(event) => {
						event.preventDefault();
						setContextMenu(contextMenu ? null : {
							mouseX: event.clientX + 2,
							mouseY: event.clientY - 6,
						});
					}}
				>
					<Box sx={{
						'& h1, h2, h3, p, ul, li': {
							margin: 0,
						}
					}}>
						<Markdown>{contentState.replace(/\n/g, "  \n")}</Markdown>
					</Box>
					<Typography variant="caption" display="block" textAlign={isMe ? "right" : "left"} mt={1}>
						{new Date(timestamp).toLocaleString()}
					</Typography>
				</Paper>
				{quote != null &&
					<Chip
						variant="outlined"
						avatar={<Avatar alt={quote.username} src={"/usericon/" + quote.username + ".png"}/>}
						label={quote.content}
						onClick={() => {
							if (document.getElementById("message-" + quote.id))
								document.getElementById("message-" + quote.id).scrollIntoView({behavior: "smooth"});
						}}
					/>
				}
			</Grid>
			{isMe && <IconButton sx={{ml: 1.5, p: 0}} href={"/user/" + username}><Avatar src={"/usericon/" + username + ".png"} alt={username}/></IconButton>}
			<Dialog open={onDialog} onClose={() => setOnDialog(false)}>
				<DialogTitle>
					来自{username}的消息
				</DialogTitle>
				<DialogContent sx={{
					'& h1, h2, h3, p, ul, li': {
						margin: 0,
					}
				}}>
					<Markdown>{contentState.replace(/\n/g, "  \n")}</Markdown>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOnDialog(false)} color="primary">关闭</Button>
				</DialogActions>
			</Dialog>
			<Menu
				open={Boolean(contextMenu)}
				onClose={() => setContextMenu(null)}
				onClick={() => setContextMenu(null)}
				anchorReference="anchorPosition"
				anchorPosition={contextMenu ? {top: contextMenu.mouseY, left: contextMenu.mouseX} : undefined}
			>
				<MenuItem onClick={() => setOnDialog(true)}>
					<ListItemIcon>
						<VisibilityOutlined/>
					</ListItemIcon>
					<Typography>
						查看
					</Typography>
				</MenuItem>
				<MenuItem onClick={() => {
					setQuote({
						id: messageId,
						username: username,
						content: contentState,
					});
				}}>
					<ListItemIcon>
						<FormatQuoteOutlined/>
					</ListItemIcon>
					<Typography>
						引用
					</Typography>
				</MenuItem>
				<MenuItem onClick={() => {
					axios.post("/api/chat/delete-message", {id: messageId}, {
						headers: {
							"Content-Type": "application/json",
						},
					}).then(res => {
						enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
						if (res.data.status === 1) {
							queryClient.invalidateQueries({queryKey: ["contacts"]})
							setContent("消息已撤回");
							const item = messagesRef.current.find(item => item.id === messageId);
							if (item)
								item.text = "消息已撤回";
						}
					});
				}}>
					<ListItemIcon>
						<DeleteOutline/>
					</ListItemIcon>
					<Typography>
						删除
					</Typography>
				</MenuItem>
			</Menu>
		</Grid>
	);
};

Message.propTypes = {
	messageId: PropTypes.number,
	isMe: PropTypes.bool,
	username: PropTypes.string,
	content: PropTypes.string,
	quote: PropTypes.object,
	timestamp: PropTypes.string,
	messagesRef: PropTypes.object,
	setQuote: PropTypes.func,
}

const notify = (title, body, iconId) => {
	try {
		Notification.requestPermission().then((result) => {
			if (result !== "granted") {
				console.log("呜呜呜把通知权限打开嘛QAQ");
				return;
			}
			navigator.serviceWorker.register("/service-worker.js").then((registration) => {
				registration.showNotification(title, {
					body: body,
					icon: "/usericon/" + iconId + ".png",
				});
			});
		});
	} catch (e) {
		console.log("你的浏览器不支持通知，人家也没办法呀……", e);
	}
};

export default function Chat() {
	document.title = "Chat - chy.web";
	
	const [users, setUsers] = useState([]);
	const [publicChannel, setPublicChannel] = useState([]);
	const [logged, setLogged] = useState(null);
	const [currentUser, setCurrentUser] = useState("");
	const [messages, setMessages] = useState([]);
	const [lastOnline, setLastOnline] = useState("");
	const [stomp, setStomp] = useState(null);
	const [quote, setQuote] = useState(null);
	const [onSettings, setOnSettings] = useState(false);
	const queryClient = useQueryClient();
	const messageCard = useRef(null), messageInput = useRef(null);
	const currentUserRef = useRef("");
	const messagesRef = useRef([]);
	const settingsRef = useRef(JSON.parse(localStorage.getItem("chatSettings")) || {});
	const myname = Cookies.get("username");
	
	const [settings, setSettings] = useState(JSON.parse(localStorage.getItem("chatSettings")) || {});
	const settingItems = ["allowNotification", "allowPublicNotification", "allowCurrentNotification", "displayNotificationContent"];
	const settingItemsDisplay = ["允许通知", "允许公共频道通知", "允许当前联系人通知", "显示消息内容"];
	
	const refreshContacts = useCallback(() => {
		queryClient.invalidateQueries({queryKey: ["contacts"]});
	}, [queryClient]);
	
	const getMessages = (username) => {
		if (currentUserRef.current === username)
			return;
		currentUserRef.current = username;
		setCurrentUser(username);
		setQuote(null);
		if (isMobile) {
			document.getElementById("contacts").style.display = "none";
			document.getElementById("chat-main").style.display = "flex";
		}
		axios.get("/api/chat/message/" + username + "/-1").then(res => {
			refreshContacts();
			messagesRef.current = res.data.result["message"];
			flushSync(() => {
				setLastOnline(res.data.result["onlineStatus"]);
				setMessages(messagesRef.current);
			});
			messageCard.current.lastElementChild.scrollIntoView({behavior: "instant"});
		});
	}
	
	const {data, isLoading, error} = useQuery({
		queryKey: ["contacts"],
		queryFn: () => axios.get("/api/chat/contacts").then(res => res.data),
	});
	
	useEffect(() => {
		if (!isLoading && !error) {
			if (data.status !== 1) {
				setLogged(false);
				return;
			}
			setLogged(true);
			document.getElementById("page-container").style.height = "0";
			document.getElementById("page-main").style.height = "0";
			if (isMobile) {
				document.getElementById("footer").style.display = "none";
				document.getElementById("page-main").style.paddingBottom = "20px";
			}
			setPublicChannel(data.result["public"]);
			setUsers(data.result["users"]);
		}
	}, [data, error, isLoading]);
	
	const newMessage = useCallback((data) => {
		axios.post("/api/chat/update-viewed", {target: currentUserRef.current}, {
			headers: {
				"Content-Type": "application/json",
			},
		}).then(() => refreshContacts());
		messagesRef.current = [...messagesRef.current, {
			id: data.id,
			username: data.sender,
			isMe: data.sender === myname,
			text: data.content,
			quote: data.quote,
			time: data.time,
		}];
		
		const {scrollTop, scrollHeight, clientHeight} = messageCard.current;
		flushSync(() => setMessages(messagesRef.current));
		if (scrollTop + clientHeight + 50 >= scrollHeight)
			messageCard.current.lastElementChild.scrollIntoView({behavior: "instant"});
	}, [myname, refreshContacts]);
	
	useEffect(() => {
		if (myname == null)
			return;
		
		const stomp = Stomp.over(() => new SockJS(window.location.origin + "/api/websocket"));
		setStomp(stomp);
		
		stomp.connect({}, () => {
			stomp.heartbeat.incoming = 10000;
			stomp.heartbeat.outgoing = 10000;
			
			stomp.subscribe("/topic/chat/online", (message) => {
				refreshContacts();
				if (JSON.parse(message.body).username === currentUserRef.current)
					setLastOnline("对方在线");
			});
			
			stomp.subscribe("/topic/chat/offline", (message) => {
				refreshContacts();
				const data = JSON.parse(message.body);
				if (data.username === currentUserRef.current)
					setLastOnline("对方上次上线：" + data["lastOnline"]);
			});
			
			stomp.subscribe(`/user/${myname}/queue/chat/message`, (message) => {
				const data = JSON.parse(message.body);
				if (myname === data.sender && currentUserRef.current === data.recipient ||
					myname === data.recipient && currentUserRef.current === data.sender) {
					newMessage(data);
					if (settingsRef.current["allowNotification"] !== false && settingsRef.current["allowCurrentNotification"] !== false && data.sender !== myname)
						notify("[私聊] " + data.sender + "说：",
							settingsRef.current["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender);
				} else {
					refreshContacts();
					if (settingsRef.current["allowNotification"] !== false && data.sender !== myname)
						notify("[私聊] " + data.sender + "说：",
							settingsRef.current["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender);
				}
			});
			
			stomp.subscribe("/topic/chat/public-message", (message) => {
				const data = JSON.parse(message.body);
				if (currentUserRef.current === data.recipient) {
					newMessage(data);
					if (settingsRef.current["allowNotification"] !== false && settingsRef.current["allowPublicNotification"] !== false &&
						settingsRef.current["allowCurrentNotification"] !== false && data.sender !== myname)
						notify("[公共] " + data.sender + "说：",
							settingsRef.current["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender);
				} else {
					refreshContacts();
					if (settingsRef.current["allowNotification"] !== false && settingsRef.current["allowPublicNotification"] !== false && data.sender !== myname)
						notify("[公共] " + data.sender + "说：",
							settingsRef.current["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender);
				}
			});
			
			stomp.subscribe(`/user/${myname}/queue/chat/delete-message`, (message) => {
				const item = messagesRef.current.find(item => item.id === Number(message.body));
				if (item) {
					item.text = "消息已撤回";
					item.id = -item.id;
					setMessages(messagesRef.current);
					refreshContacts();
				}
			});
		});
	}, [myname, newMessage, refreshContacts]);
	
	const sendMessage = () => {
		const content = messageInput.current.value;
		if (content === "")
			return;
		messageInput.current.value = "";
		setQuote(null);
		stomp.send("/app/chat/send-message", {}, JSON.stringify({
			recipient: currentUser,
			content: content,
			quoteId: quote == null ? null : quote.id,
		}));
	}
	
	// TODO: 联系人搜索，上滑加载更多消息
	
	return logged !== false ? (
		<Grid container sx={{flex: 1, height: 0}} gap={2}>
			<Card id="contacts" sx={{width: isMobile ? "100%" : 300, height: "100%", display: "flex", flexDirection: "column"}}>
				<OutlinedInput
					startAdornment={<InputAdornment position="start"><SearchOutlined fontSize="small"/></InputAdornment>}
					placeholder="搜索联系人"
				/>
				<Box sx={{overflowY: "auto"}}>
					<List>
						<ListItemButton
							onClick={() => getMessages("ChatRoomSystem")}
							selected={currentUser === "ChatRoomSystem"}
						>
							<UserItem username="ChatRoomSystem" info={publicChannel}/>
						</ListItemButton>
					</List>
					<Divider/>
					<List>
						{users.map((user) => (
							<ListItemButton
								key={user.displayName}
								onClick={() => getMessages(user.displayName)}
								selected={currentUser === user.displayName}
							>
								<UserItem username={user.displayName} info={user}/>
							</ListItemButton>
						))}
					</List>
				</Box>
			</Card>
			<Grid container id="chat-main" direction="column" sx={{flex: 1, height: "100%", display: isMobile ? "none" : "flex"}} gap={1.5}>
				<Card sx={{display: currentUser === "" ? "none" : "block"}}>
					<Grid container direction="row" justifyContent="space-between" alignItems="center" padding={isMobile ? 1 : 2}>
						{isMobile && <IconButton onClick={() => {
							document.getElementById("contacts").style.display = "flex";
							document.getElementById("chat-main").style.display = "none";
							setCurrentUser("");
							currentUserRef.current = "";
						}}>
							<ArrowBack/>
						</IconButton>}
						<Grid container direction="column" alignItems={isMobile ? "center" : "flex-start"}>
							<Typography variant="h6">{currentUser}</Typography>
							<Typography>{lastOnline}</Typography>
						</Grid>
						<IconButton href={"/user/" + currentUser}>
							<MoreHoriz/>
						</IconButton>
					</Grid>
				</Card>
				<Card ref={messageCard} sx={{flex: 1, overflowY: "auto", px: 1}}>
					{messages.map((message) => (
						<Message
							key={message.id}
							messageId={message.id}
							isMe={message.isMe}
							username={message.username}
							content={message.text}
							quote={message.quote}
							timestamp={message.time}
							messagesRef={messagesRef}
							setQuote={setQuote}
						/>
					))}
				</Card>
				<Card sx={{display: currentUser === "" ? "none" : "block", maxWidth: "100%"}}>
					{quote != null &&
						<Chip
							variant="outlined"
							avatar={<Avatar alt={quote.username} src={"/usericon/" + quote.username + ".png"}/>}
							label={quote.username + ": " + quote.content}
							clickable
							onClick={() => document.getElementById("message-" + quote.id).scrollIntoView({behavior: "smooth"})}
							onDelete={() => setQuote(null)}
						/>
					}
					<TextField
						inputRef={messageInput}
						placeholder="Message"
						multiline
						fullWidth
						maxRows={10}
						sx={{flex: 1}}
						onKeyDown={(event) => {
							if (!isMobile && event.key === "Enter") {
								event.preventDefault();
								if (event.ctrlKey)
									document.execCommand("insertLineBreak");
								else
									sendMessage();
							}
						}}
					/>
					<Grid container justifyContent="space-between">
						<Box>
							<IconButton size="large"><TitleOutlined/></IconButton>
							<IconButton size="large"><AddLinkOutlined/></IconButton>
							<IconButton size="large"><AddPhotoAlternateOutlined/></IconButton>
							<IconButton size="large"><AddReactionOutlined/></IconButton>
							<IconButton size="large" onClick={() => setOnSettings(true)}><SettingsOutlined/></IconButton>
						</Box>
						<IconButton
							size="large"
							color="primary"
							sx={{justifySelf: "flex-end"}}
							onClick={sendMessage}
						>
							<Send/>
						</IconButton>
					</Grid>
				</Card>
			</Grid>
			<Dialog open={onSettings} onClose={() => setOnSettings(false)}>
				<DialogTitle>
					设置
				</DialogTitle>
				<DialogContent>
					<Grid container direction="column" spacing={1}>
						{settingItems.map((item, index) => (
							<Grid container key={item} alignItems="center">
								<Switch
									checked={settings[item] !== false}
									onChange={(event) => {
										const newSettings = {...settings, [item]: event.currentTarget.checked};
										setSettings(newSettings);
										settingsRef.current = newSettings;
										localStorage.setItem("chatSettings", JSON.stringify(newSettings));
									}}
									sx={{
										'& .MuiSwitch-thumb': {
											boxShadow: 'none', // 关闭阴影
										}
									}}
								/>
								<Typography>{settingItemsDisplay[index]}</Typography>
							</Grid>
						))}
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOnSettings(false)}>关闭</Button>
				</DialogActions>
			</Dialog>
		</Grid>
	) : <Alert severity="error">请先登录！</Alert>;
}