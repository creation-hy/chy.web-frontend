import {Fragment, useCallback, useEffect, useRef, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import {Alert, Badge, InputLabel, List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Paper, Switch} from "@mui/material";
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
	CloudDownload,
	ContentCopyOutlined,
	DeleteOutline,
	FontDownloadOutlined,
	FormatQuoteOutlined,
	MoreHoriz,
	SearchOutlined,
	Send,
	SettingsOutlined,
	VisibilityOutlined
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
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
import {closeSnackbar, enqueueSnackbar} from "notistack";
import Chip from "@mui/material/Chip";
import DialogTitle from "@mui/material/DialogTitle";
import Picker from "@emoji-mart/react";
import {useColorMode} from "src/components/ColorMode.jsx";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import {ChatMarkdown} from "src/components/ChatMarkdown.jsx";

const myname = Cookies.get("username"), myToken = Cookies.get("user_token");

let currentUserVar = "", settingsVar = JSON.parse(localStorage.getItem("chatSettings")) || {};
let usersVar = [], messagesVar = [];
let socket, stomp;

function UserItem({username, info}) {
	if (!info)
		return null;
	
	return (
		<>
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
						<Avatar src={"/avatars/" + username + ".png"} alt={username}/>
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
							{info.username}
						</Typography>
						<Typography variant="body2" color="textSecondary">
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
		</>
	);
}

UserItem.propTypes = {
	username: PropTypes.string,
	info: PropTypes.object,
}

const Message = ({messageId, isMe, username, content, quote, setQuote, messageCard, setUsers}) => {
	const [contextMenu, setContextMenu] = useState(null);
	const [onDialog, setOnDialog] = useState(false);
	const [contentState, setContent] = useState(content.toString());
	
	return (
		<Grid container justifyContent={isMe ? 'flex-end' : 'flex-start'} alignItems="flex-start" sx={{my: 2}} id={"message-" + messageId}>
			{!isMe && <IconButton sx={{mr: 1, p: 0}} href={"/user/" + username}><Avatar src={"/avatars/" + username + ".png"} alt={username}/></IconButton>}
			<Grid container direction="column" sx={{maxWidth: "75%"}} alignItems={isMe ? 'flex-end' : 'flex-start'} spacing={0.7}>
				<Paper
					elevation={3}
					sx={{
						padding: '8px 11px',
						borderRadius: '10px',
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
					<Box>
						<ChatMarkdown>{contentState}</ChatMarkdown>
					</Box>
				</Paper>
				{quote != null &&
					<Chip
						variant="outlined"
						avatar={<Avatar alt={quote.username} src={"/avatars/" + quote.username + ".png"}/>}
						label={quote.username + ": " + quote.content}
						onClick={() => {
							if (document.getElementById("message-" + quote.id))
								document.getElementById("message-" + quote.id).scrollIntoView({behavior: "smooth"});
						}}
					/>
				}
			</Grid>
			{isMe && <IconButton sx={{ml: 1, p: 0}} href={"/user/" + username}><Avatar src={"/avatars/" + username + ".png"} alt={username}/></IconButton>}
			<Dialog open={onDialog} onClose={() => setOnDialog(false)}>
				<DialogTitle>
					来自{username}的消息
				</DialogTitle>
				<DialogContent>
					<ChatMarkdown>{contentState}</ChatMarkdown>
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
				<MenuItem onClick={() => navigator.clipboard.writeText(contentState)}>
					<ListItemIcon>
						<ContentCopyOutlined/>
					</ListItemIcon>
					<Typography>
						复制
					</Typography>
				</MenuItem>
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
							setContent("消息已撤回");
							const item = messagesVar.find(item => item.id === messageId);
							if (item) {
								item.content = "消息已撤回";
								if (item.id.toString() === messageCard.current.lastElementChild.id.substring(8)) {
									const userItem = usersVar.find(item => item.username === (currentUserVar === "ChatRoomSystem" ? "公共" : currentUserVar));
									if (userItem) {
										userItem["lastMessageText"] = currentUserVar === "ChatRoomSystem" ? myname + ": 消息已撤回" : "消息已撤回";
										setUsers([...usersVar]);
									}
								}
							}
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
	setQuote: PropTypes.func,
	messageCard: PropTypes.object,
	setUsers: PropTypes.func,
}

const notify = (title, body, iconId) => {
	try {
		Notification.requestPermission().then((result) => {
			if (result !== "granted") {
				console.log("呜呜呜把通知权限打开嘛QAQ");
				return;
			}
			navigator.serviceWorker.register("/service-worker.js");
			navigator.serviceWorker.ready.then((registration) => {
				registration.showNotification(title, {
					body: body,
					icon: "/avatars/" + iconId + ".png",
				});
			});
		});
	} catch (e) {
		console.log("你的浏览器不支持通知，人家也没办法呀……", e);
	}
};

const ChatToolBar = (inputField) => {
	const [colorMode] = useColorMode();
	
	const [onSpecialFont, handleSpecialFont] = useState(false);
	const [fontStyle, setFontStyle] = useState("");
	const fontTextRef = useRef(null);
	
	const [onAddLink, handleAddLink] = useState(false);
	const linkHrefRef = useRef(null);
	const linkTextRef = useRef(null);
	
	const [onAddImage, handleAddImage] = useState(false);
	const imageHrefRef = useRef(null);
	const imageAltRef = useRef(null);
	
	const [onEmojiPicker, handleEmojiPicker] = useState(false);
	
	const [onSettings, handleSettings] = useState(false);
	const [settings, setSettings] = useState(settingsVar);
	const settingItems = ["allowNotification", "allowPublicNotification", "allowCurrentNotification", "displayNotificationContent"];
	const settingItemsDisplay = ["允许通知", "允许公共频道通知", "允许当前联系人通知", "显示消息内容"];
	
	return (
		<>
			<Box>
				<IconButton size="large" onClick={() => handleSpecialFont(true)}><FontDownloadOutlined/></IconButton>
				<IconButton size="large" onClick={() => handleAddLink(true)}><AddLinkOutlined/></IconButton>
				<IconButton size="large" onClick={() => handleAddImage(true)}><AddPhotoAlternateOutlined/></IconButton>
				<IconButton size="large" onClick={() => handleEmojiPicker(true)}><AddReactionOutlined/></IconButton>
				<IconButton size="large" onClick={() => handleSettings(true)}><SettingsOutlined/></IconButton>
			</Box>
			<Dialog open={onSpecialFont} onClose={() => handleSpecialFont(false)} fullWidth>
				<DialogTitle>
					添加特殊字体
				</DialogTitle>
				<DialogContent>
					<Grid container gap={1}>
						<FormControl margin="dense" sx={{minWidth: 80}}>
							<InputLabel id="font-style-label">样式</InputLabel>
							<Select
								labelId="font-style-label"
								variant="outlined"
								label="样式"
								value={fontStyle}
								onChange={(event) => setFontStyle(event.target.value)}
							>
								<MenuItem value="#">H1</MenuItem>
								<MenuItem value="##">H2</MenuItem>
								<MenuItem value="###">H3</MenuItem>
								<MenuItem value="####">H4</MenuItem>
								<MenuItem value="#####">H5</MenuItem>
								<MenuItem value="######">H6</MenuItem>
								<MenuItem value="*">斜体</MenuItem>
								<MenuItem value="**">粗体</MenuItem>
								<MenuItem value="***">斜体+粗体</MenuItem>
								<MenuItem value="~~">删除线</MenuItem>
							</Select>
						</FormControl>
						<TextField label="文本" margin="dense" inputRef={fontTextRef} sx={{flex: 1, minWidth: "min(100%, 300px)"}}/>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleSpecialFont(false)}>关闭</Button>
					<Button onClick={() => {
						flushSync(() => handleSpecialFont(false));
						if (fontStyle === '' && fontTextRef.current.value === '')
							inputField.inputField.current.value += ' ';
						else if (fontStyle.charAt(0) === '#') {
							const lines = inputField.inputField.current.value.split('\n');
							inputField.inputField.current.focus();
							if (lines[lines.length - 1].trim() !== '')
								document.execCommand("insertLineBreak");
							inputField.inputField.current.value += fontStyle + ' ' + fontTextRef.current.value;
							document.execCommand("insertLineBreak");
						} else
							inputField.inputField.current.value += fontStyle + fontTextRef.current.value + fontStyle;
						inputField.inputField.current.focus();
					}}>确认</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={onAddLink} onClose={() => handleAddLink(false)} fullWidth>
				<DialogTitle>
					添加链接
				</DialogTitle>
				<DialogContent>
					<TextField label="链接地址" margin="dense" fullWidth inputRef={linkHrefRef}/>
					<TextField label="显示文本" margin="dense" fullWidth inputRef={linkTextRef}/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleAddLink(false)}>关闭</Button>
					<Button onClick={() => {
						flushSync(() => handleAddLink(false));
						inputField.inputField.current.value += "[" + linkTextRef.current.value + "](" + linkHrefRef.current.value + ")";
						inputField.inputField.current.focus();
					}}>确认</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={onAddImage} onClose={() => handleAddImage(false)} fullWidth>
				<DialogTitle>
					添加图片
				</DialogTitle>
				<DialogContent>
					<TextField label="图片地址" margin="dense" fullWidth inputRef={imageHrefRef}/>
					<TextField label="替代文字" margin="dense" fullWidth inputRef={imageAltRef}/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleAddImage(false)}>关闭</Button>
					<Button onClick={() => {
						inputField.inputField.current.value += "![" + imageAltRef.current.value + "](" + imageHrefRef.current.value + ")";
						flushSync(() => handleAddImage(false));
						inputField.inputField.current.focus();
					}}>确认</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={onEmojiPicker} onClose={() => handleEmojiPicker(false)} PaperProps={{sx: {borderRadius: "10px", margin: 0}}}>
				<Picker
					theme={colorMode}
					locale="zh"
					onEmojiSelect={(emoji) => {
						inputField.inputField.current.value += emoji.native;
						flushSync(() => handleEmojiPicker(false));
						inputField.inputField.current.focus();
					}}
				/>
			</Dialog>
			<Dialog open={onSettings} onClose={() => handleSettings(false)}>
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
										settingsVar = newSettings;
										localStorage.setItem("chatSettings", JSON.stringify(newSettings));
									}}
									sx={{
										'& .MuiSwitch-thumb': {
											boxShadow: 'none', // 关闭阴影
										},
									}}
								/>
								<Typography>{settingItemsDisplay[index]}</Typography>
							</Grid>
						))}
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleSettings(false)}>关闭</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

ChatToolBar.propTypes = {
	inputField: PropTypes.object.isRequired,
}

export default function Chat() {
	document.title = "Chat - chy.web";
	
	const [users, setUsers] = useState([]);
	const [logged, setLogged] = useState(null);
	const [currentUser, setCurrentUser] = useState("");
	const [messages, setMessages] = useState([]);
	const [lastOnline, setLastOnline] = useState("");
	const [quote, setQuote] = useState(null);
	const [matchList, setMatchList] = useState([]);
	const [abortController, setAbortController] = useState(null);
	const messageCard = useRef(null), messageInput = useRef(null);
	const disconnectErrorBarKey = useRef(null);
	const queryClient = useRef(useQueryClient());
	
	const getMessages = useCallback((username, startId = -1, doRefresh = false) => {
		if (currentUserVar === username && startId === -1 && !doRefresh)
			return;
		const isCurrentUser = currentUserVar === username;
		currentUserVar = username;
		setCurrentUser(username);
		setQuote(null);
		if (isMobile) {
			document.getElementById("contacts").style.display = "none";
			document.getElementById("chat-main").style.display = "flex";
			document.getElementById("app-bar").style.display = "none";
		}
		try {
			Notification.requestPermission();
		} catch (e) {
			console.log("你的浏览器不支持通知，人家也没办法呀……", e);
		}
		axios.get("/api/chat/message/" + username + "/" + startId).then(res => {
			const userItem = usersVar.find(item => item.username === (username === "ChatRoomSystem" ? "公共" : username));
			if (userItem) {
				userItem["newMessageCount"] = 0;
				setUsers([...usersVar]);
			}
			let currentScrollBottom = !isCurrentUser ? 0 : messageCard.current.scrollHeight - messageCard.current.scrollTop;
			messagesVar = startId === -1 ? res.data.result["message"] : [...res.data.result["message"], ...messagesVar];
			flushSync(() => {
				setLastOnline(res.data.result["onlineStatus"]);
				setMessages([...messagesVar]);
			});
			messageCard.current.scrollTop = messageCard.current.scrollHeight - currentScrollBottom;
		});
	}, []);
	
	const {data, isLoading, error} = useQuery({
		queryKey: ["contacts"],
		queryFn: () => axios.get("/api/chat/contacts").then(res => res.data),
		staleTime: Infinity,
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
			document.getElementById("footer").style.display = "none";
			if (isMobile) {
				document.getElementById("page-main").style.paddingBottom = "12px";
				document.getElementById("chat-main").style.paddingTop = "16px";
			} else
				document.getElementById("page-main").style.paddingBottom = "24px";
			usersVar = data.result;
			setUsers(usersVar);
		}
	}, [data, error, isLoading]);
	
	const sendMessage = useCallback(() => {
		const content = messageInput.current.value;
		if (content.trim().length === 0)
			return;
		messageInput.current.focus();
		document.execCommand("selectAll");
		document.execCommand("delete");
		setQuote(null);
		stomp.send("/app/chat.message", {}, JSON.stringify({
			recipient: currentUserVar,
			content: content,
			quoteId: quote == null ? null : quote.id,
		}));
	}, [quote]);
	
	useEffect(() => {
		const updateUserItem = (username, content, time, isCurrent) => {
			const date = new Date(time), now = new Date();
			const timeString = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate() ?
				date.toLocaleTimeString().substring(0, 5) : date.toLocaleDateString().replace(/\//g, '-').substring(2);
			
			const userItem = usersVar.find(item => item.username === (username === "ChatRoomSystem" ? "公共" : username));
			if (userItem) {
				userItem["lastMessageText"] = content;
				userItem["lastMessageTime"] = timeString;
				if (!isCurrent)
					userItem["newMessageCount"]++;
				usersVar = [userItem, ...usersVar.filter(item => item.username !== username)];
				setUsers([...usersVar]);
			} else {
				axios.get("/api/user/find/" + username).then(res => {
					usersVar = [{
						username: username,
						isOnline: res.data.result[0].isOnline,
						lastMessageTime: timeString,
						lastMessageText: content,
						newMessageCount: isCurrent ? 0 : 1,
					}, ...usersVar];
					setUsers([...usersVar]);
				});
			}
		}
		
		const newMessage = (data) => {
			axios.post("/api/chat/update-viewed", {target: currentUserVar}, {
				headers: {
					"Content-Type": "application/json",
				},
			});
			
			const content = data.recipient === "ChatRoomSystem" ? data.sender + ": " + data.content : data.content;
			updateUserItem(data.recipient === "ChatRoomSystem" ? data.recipient : (data.sender === myname ? data.recipient : data.sender),
				content, data.time, true);
			
			messagesVar = [...messagesVar, {
				id: data.id,
				username: data.sender,
				isMe: data.sender === myname,
				content: data.content,
				quote: data.quote,
				time: data.time,
			}];
			
			const {scrollTop, scrollHeight, clientHeight} = messageCard.current;
			flushSync(() => setMessages([...messagesVar]));
			if (scrollTop + clientHeight + 50 >= scrollHeight)
				messageCard.current.scrollTop = scrollHeight;
		};
		
		let firstRebirth = true;
		
		const stompOnConnect = () => {
			stomp.heartbeat.incoming = 10000;
			stomp.heartbeat.outgoing = 10000;
			
			firstRebirth = true;
			
			if (disconnectErrorBarKey.current) {
				closeSnackbar(disconnectErrorBarKey.current);
				getMessages(currentUserVar, -1, true);
				queryClient.current.invalidateQueries({queryKey: ["contacts"]});
				disconnectErrorBarKey.current = null;
			}
			
			stomp.subscribe("/topic/chat.online", (message) => {
				const username = JSON.parse(message.body).username;
				const userItem = usersVar.find(item => item.username === username);
				if (userItem) {
					userItem["isOnline"] = true;
					setUsers([...usersVar]);
				}
				if (username === currentUserVar)
					setLastOnline("对方在线");
			});
			
			stomp.subscribe("/topic/chat.offline", (message) => {
				const data = JSON.parse(message.body);
				const userItem = usersVar.find(item => item.username === data.username);
				if (userItem) {
					userItem["isOnline"] = false;
					userItem["lastOnline"] = data["lastOnline"];
					setUsers([...usersVar]);
				}
				if (data.username === currentUserVar)
					setLastOnline("上次上线：" + data["lastOnline"]);
			});
			
			stomp.subscribe(`/user/queue/chat.message`, (message) => {
				const data = JSON.parse(message.body);
				if (myname === data.sender && currentUserVar === data.recipient ||
					myname === data.recipient && currentUserVar === data.sender) {
					newMessage(data);
					if (settingsVar["allowNotification"] !== false && settingsVar["allowCurrentNotification"] !== false && data.sender !== myname)
						notify("[私聊] " + data.sender + "说：",
							settingsVar["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender);
				} else {
					updateUserItem(data.sender === myname ? data.recipient : data.sender, data.content, data.time, false);
					if (settingsVar["allowNotification"] !== false && data.sender !== myname)
						notify("[私聊] " + data.sender + "说：",
							settingsVar["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender);
				}
			}, {"auto-delete": true});
			
			stomp.subscribe("/topic/chat.group.public.message", (message) => {
				const data = JSON.parse(message.body);
				if (currentUserVar === data.recipient) {
					newMessage(data);
					if (settingsVar["allowNotification"] !== false && settingsVar["allowPublicNotification"] !== false &&
						settingsVar["allowCurrentNotification"] !== false && data.sender !== myname)
						notify("[公共] " + data.sender + "说：",
							settingsVar["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender);
				} else {
					updateUserItem(data.recipient, data.sender + ": " + data.content, data.time, false);
					if (settingsVar["allowNotification"] !== false && settingsVar["allowPublicNotification"] !== false && data.sender !== myname)
						notify("[公共] " + data.sender + "说：",
							settingsVar["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender);
				}
			});
			
			stomp.subscribe(`/user/queue/chat.delete`, (message) => {
				const data = JSON.parse(message.body);
				const item = messagesVar.find(item => item.id === data.id);
				if (item) {
					item.content = "消息已撤回";
					item.id = -item.id;
					setMessages([...messagesVar]);
				}
				
				if (data["isLatest"]) {
					const userItem = usersVar.find(item => item.username === data.username);
					if (userItem) {
						userItem["lastMessageText"] = "消息已撤回";
						setUsers([...usersVar]);
					}
				}
			}, {"auto-delete": true});
			
			stomp.subscribe(`/topic/chat.group.public.delete`, (message) => {
				const data = JSON.parse(message.body);
				if (data.username === myname)
					return;
				
				const item = messagesVar.find(item => item.id === data.id);
				if (item) {
					item.content = "消息已撤回";
					item.id = -item.id;
					setMessages([...messagesVar]);
				}
				
				if (data["isLatest"]) {
					const userItem = usersVar.find(item => item.username === "公共");
					if (userItem) {
						userItem["lastMessageText"] = data.username + ": 消息已撤回";
						setUsers([...usersVar]);
					}
				}
			});
		};
		
		const stompConnect = () => {
			socket = new SockJS(window.location.origin + "/api/websocket");
			stomp = Stomp.over(() => socket);
			stomp.connect({
				"username": myname,
				"user-token": myToken,
			}, stompOnConnect, null, stompReconnect);
			socket.onclose = stompReconnect;
		};
		
		const stompReconnect = async () => {
			if (firstRebirth) {
				firstRebirth = false;
				disconnectErrorBarKey.current = enqueueSnackbar("服务器连接已断开，正在尝试重连...", {
					variant: "error",
					anchorOrigin: {vertical: "bottom", horizontal: "center"},
					persist: true,
				});
				stompConnect();
			} else
				setTimeout(stompConnect, 1000);
		};
		
		stompConnect();
		
		let lastScrollStartId = -1;
		messageCard.current.addEventListener("scroll", (event) => {
			if (event.target.scrollTop <= 50 && lastScrollStartId !== messagesVar[0].id - 1 && messagesVar.length >= 30) {
				lastScrollStartId = messagesVar[0].id - 1;
				getMessages(currentUserVar, lastScrollStartId);
			}
		});
	}, [getMessages]);
	
	return logged !== false ? (
		<Grid container sx={{flex: 1, height: 0}} gap={2}>
			<Card id="contacts" sx={{width: isMobile ? "100%" : 300, height: "100%", display: "flex", flexDirection: "column"}}>
				<OutlinedInput
					startAdornment={<InputAdornment position="start"><SearchOutlined fontSize="small"/></InputAdornment>}
					placeholder="搜索联系人"
					sx={{fontSize: 14}}
					onChange={(event) => {
						if (abortController)
							abortController.abort();
						if (event.target.value === "")
							setMatchList([]);
						else {
							const controller = new AbortController();
							setAbortController(controller);
							axios.get("/api/user/find/" + encodeURIComponent(event.target.value), {signal: controller.signal})
								.then(res => setMatchList(res.data.result)).catch(() => null);
						}
					}}
				/>
				<Box sx={{overflowY: "auto"}}>
					<List>
						<ListItemButton
							onClick={() => getMessages("ChatRoomSystem")}
							selected={currentUser === "ChatRoomSystem"}
						>
							<UserItem username="ChatRoomSystem" info={users.find(item => item.username === "公共")}/>
						</ListItemButton>
					</List>
					<Divider/>
					<List sx={{display: matchList.length === 0 ? "block" : "none"}}>
						{users.map((user) => (user.username !== "公共" &&
							<ListItemButton
								key={user.username}
								onClick={() => getMessages(user.username)}
								selected={currentUser === user.username}
							>
								<UserItem username={user.username} info={user}/>
							</ListItemButton>
						))}
					</List>
					<List sx={{display: matchList.length === 0 ? "none" : "block"}}>
						{matchList.map((user) => (
							<ListItemButton
								key={user.username}
								onClick={() => getMessages(user.username)}
								selected={currentUser === user.username}
							>
								<Avatar src={"/avatars/" + user.username + ".png"} alt={user.username}/>
							</ListItemButton>
						))}
					</List>
				</Box>
			</Card>
			<Grid container id="chat-main" direction="column" sx={{flex: 1, height: "100%", display: isMobile ? "none" : "flex"}} gap={1.5}>
				<Card sx={{display: currentUser === "" ? "none" : "block", width: "100%"}}>
					<Grid container direction="row" justifyContent="space-between" alignItems="center" padding={isMobile ? 1 : 1.5} gap={1.5}>
						{isMobile && <IconButton onClick={() => {
							document.getElementById("contacts").style.display = "flex";
							document.getElementById("chat-main").style.display = "none";
							document.getElementById("app-bar").style.display = "flex";
							setCurrentUser("");
							currentUserVar = "";
						}}>
							<ArrowBack/>
						</IconButton>}
						<Grid container direction="column" alignItems={isMobile ? "center" : "flex-start"} sx={{flex: 1}}>
							<Typography sx={{maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis"}}>
								{currentUser}
							</Typography>
							<Typography variant="body2" color="textSecondary"
							            sx={{maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
								{lastOnline}
							</Typography>
						</Grid>
						<Box>
							<IconButton onClick={async () => {
								let text = "", startId = -1;
								while (true) {
									const res = await axios.get("/api/chat/message/" + currentUserVar + "/" + startId);
									const message = res.data.result.message;
									if (!message.length)
										break;
									text = message.map((item) => ("**" + item.username + " " + new Date(item.time) + "**\n\n" + item.text)).join("\n\n")
										+ "\n\n" + text;
									startId = message[0].id;
								}
								const link = document.createElement("a");
								link.href = URL.createObjectURL(new Blob([text], {type: "text/plain;charset=utf-8"}));
								link.style.display = "none";
								link.download = "ChyChat-" + currentUserVar + ".md";
								document.body.appendChild(link);
								link.click();
								document.body.removeChild(link);
							}}>
								<CloudDownload/>
							</IconButton>
							<IconButton href={"/user/" + currentUser}>
								<MoreHoriz/>
							</IconButton>
						</Box>
					</Grid>
				</Card>
				<Card ref={messageCard} sx={{flex: 1, overflowY: "auto", px: 1, pt: 1, maxWidth: "100%"}}>
					{messages.map((message, index) => {
						const currentDate = new Date(message.time);
						const previousDate = new Date(!index ? 0 : messages[index - 1].time);
						const showTime = currentDate.getTime() - previousDate.getTime() > 5 * 60 * 1000;
						return (
							<Fragment key={message.id}>
								{showTime && <Grid container><Chip label={currentDate.toLocaleString()} sx={{mx: "auto"}}/></Grid>}
								<Message
									messageId={message.id}
									isMe={message.isMe}
									username={message.username}
									content={message.content}
									quote={message.quote}
									timestamp={message.time}
									setQuote={setQuote}
									messageCard={messageCard}
									setUsers={setUsers}
								/>
							</Fragment>
						);
					})}
				</Card>
				<Card sx={{display: currentUser === "" ? "none" : "block", maxWidth: "100%"}}>
					{quote != null &&
						<Chip
							variant="outlined"
							avatar={<Avatar alt={quote.username} src={"/avatars/" + quote.username + ".png"}/>}
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
						slotProps={{input: {style: {fontSize: 15, padding: 10}}}}
						onKeyDown={(event) => {
							if (!isMobile && event.keyCode === 13) {
								event.preventDefault();
								if (event.metaKey)
									document.execCommand("insertLineBreak");
								else
									sendMessage();
							}
						}}
					/>
					<Grid container justifyContent="space-between">
						<ChatToolBar inputField={messageInput}/>
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
		</Grid>
	) : <Alert severity="error">请先登录！</Alert>;
}