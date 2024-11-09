import {Fragment, useCallback, useEffect, useRef, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import {Badge, Fab, Fade, InputLabel, List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Paper, Switch} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import PropTypes from "prop-types";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography"
import {
	AddLinkOutlined,
	AddPhotoAlternateOutlined,
	AddReactionOutlined,
	ArrowBack,
	ArrowDownward,
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
import {useBinaryColorMode} from "src/components/ColorMode.jsx";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import {ChatMarkdown} from "src/components/ChatMarkdown.jsx";
import {useNavigate, useParams} from "react-router";
import {useClientUser} from "src/components/ClientUser.jsx";
import {convertDateToLocaleAbsoluteString, convertDateToLocaleShortString} from "src/assets/DateUtils.jsx";
import SignUp from "src/pages/SignUp.jsx";
import {UserAvatar} from "src/components/UserAvatar.jsx";
import getDefaultTheme from "src/theme/getDefaultTheme.jsx";

const myname = Cookies.get("username"), myToken = Cookies.get("user_token");

let currentUserVar = null, settingsVar = JSON.parse(localStorage.getItem("chatSettings")) || {};
let usersVar = [], messagesVar = [];
let socket, stomp;

function UserItem({username, displayName, isOnline, newMessageCount, lastMessageTime, lastMessageText, displayNameNode}) {
	const [binaryColorMode] = useBinaryColorMode();
	const paperBackground = getDefaultTheme(binaryColorMode).palette.background.paper;
	
	return (
		<>
			<ListItemAvatar>
				<Badge badgeContent={newMessageCount} overlap="circular" color="error">
					<Badge
						badgeContent={isOnline === true ? " " : 0} overlap="circular" color="success" variant="dot"
						anchorOrigin={{vertical: "bottom", horizontal: "right"}}
						sx={{
							'& .MuiBadge-badge': {
								backgroundColor: '#44b700',
								color: '#44b700',
								boxShadow: `0 0 0 2px ${paperBackground}`,
								'&::after': {
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: '100%',
									borderRadius: '50%',
									animation: 'ripple 1.2s infinite ease-in-out',
									border: '1px solid currentColor',
									content: '""',
								},
							},
							'@keyframes ripple': {
								'0%': {
									transform: 'scale(.8)',
									opacity: 1,
								},
								'100%': {
									transform: 'scale(2.4)',
									opacity: 0,
								},
							},
						}}
					>
						<UserAvatar username={username} displayName={displayName}/>
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
							{displayNameNode ? displayNameNode : displayName}
						</Typography>
						{lastMessageTime && <Typography variant="body2" color="textSecondary">
							{convertDateToLocaleShortString(lastMessageTime)}
						</Typography>}
					</Grid>
				}
				secondary={
					<Typography variant="body2" color="textSecondary" sx={{
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}>
						{lastMessageText}
					</Typography>
				}
			/>
		</>
	);
}

UserItem.propTypes = {
	username: PropTypes.string,
	displayName: PropTypes.string,
	isOnline: PropTypes.bool,
	newMessageCount: PropTypes.number,
	lastMessageTime: PropTypes.string,
	lastMessageText: PropTypes.string,
	displayNameNode: PropTypes.node,
}

const Message = ({messageId, username, displayName, content, quote, setQuote}) => {
	const [contextMenu, setContextMenu] = useState(null);
	const [onDialog, setOnDialog] = useState(false);
	
	const isMe = username === myname;
	
	return (
		<Grid container justifyContent={isMe ? 'flex-end' : 'flex-start'} alignItems="flex-start" sx={{my: 2}} id={"message-" + messageId}>
			{!isMe && <IconButton sx={{mr: 1, p: 0}} href={"/user/" + username}>
				<UserAvatar username={username} displayName={displayName}/>
			</IconButton>}
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
						width: "100%",
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
						<ChatMarkdown>{content}</ChatMarkdown>
					</Box>
				</Paper>
				{quote != null &&
					<Chip
						variant="outlined"
						avatar={<UserAvatar username={quote.username} displayName={quote.displayName}/>}
						label={quote.displayName + ": " + quote.content}
						onClick={() => {
							if (document.getElementById("message-" + quote.id))
								document.getElementById("message-" + quote.id).scrollIntoView({behavior: "smooth"});
						}}
					/>
				}
			</Grid>
			{isMe && <IconButton sx={{ml: 1, p: 0}} href={"/user/" + username}>
				<UserAvatar username={username} displayName={displayName}/>
			</IconButton>}
			<Dialog open={onDialog} onClose={() => setOnDialog(false)}>
				<DialogTitle>
					{displayName} (@{username}):
				</DialogTitle>
				<DialogContent>
					<ChatMarkdown>{content}</ChatMarkdown>
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
				<MenuItem onClick={() => navigator.clipboard.writeText(content)}>
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
						displayName: displayName,
						content: content,
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
	username: PropTypes.string,
	displayName: PropTypes.string,
	content: PropTypes.string,
	quote: PropTypes.object,
	setQuote: PropTypes.func,
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
	const [binaryColorMode] = useBinaryColorMode();
	
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
					theme={binaryColorMode}
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

const ScrollTop = ({children, messageCard}) => {
	const [trigger, setTrigger] = useState(false);
	
	useEffect(() => {
		messageCard.current.addEventListener("scroll", () => {
			if (messageCard.current.scrollTop + messageCard.current.clientHeight + 100 <= messageCard.current.scrollHeight)
				setTrigger(true);
			else
				setTrigger(false);
		});
	}, []);
	
	if (!messageCard.current || messageCard.current.display === "none")
		return null;
	
	return (
		<Fade in={trigger}>
			<Box
				onClick={() => messageCard.current.scrollTop = messageCard.current.scrollHeight}
				role="presentation"
				sx={{
					position: "absolute",
					top: messageCard.current.clientHeight + messageCard.current.offsetTop - 50 + "px",
					left: messageCard.current.clientWidth / 2 + messageCard.current.offsetLeft - 25 + "px",
				}}
			>
				{children}
			</Box>
		</Fade>
	);
}

export default function Chat() {
	document.title = "Chat - chy.web";
	
	const urlParams = useRef(useParams());
	const navigate = useRef(useNavigate());
	const userJumped = useRef(false);
	
	const [users, setUsers] = useState(null);
	const [logged, setLogged] = useState(null);
	const [currentUser, setCurrentUser] = useState(null);
	const [currentUserDisplayName, setCurrentUserDisplayName] = useState(null);
	const [messages, setMessages] = useState([]);
	const [lastOnline, setLastOnline] = useState("");
	const [quote, setQuote] = useState(null);
	const [matchList, setMatchList] = useState(null);
	const [abortController, setAbortController] = useState(null);
	const [showScrollTop, setShowScrollTop] = useState(false);
	
	const messageCard = useRef(null);
	const messageInput = useRef(null);
	const userSearchField = useRef(null);
	
	const disconnectErrorBarKey = useRef(null);
	const lastScrollStartId = useRef(-1);
	const queryClient = useRef(useQueryClient());
	
	const chatMainComponent = useRef(null);
	const contactsComponent = useRef(null);
	
	const {clientUser, setClientUser, clientUserLoading} = useClientUser();
	const clientUserRef = useRef(null);
	
	if (!clientUserLoading)
		clientUserRef.current = clientUser;
	
	const messageCardScrollTo = useCallback((bottom) => {
		messageCard.current.scrollTop = messageCard.current.scrollHeight - bottom;
		Promise.all(Array.prototype.slice.call(messageCard.current.getElementsByTagName("img")).map(img => new Promise(resolve => {
			img.addEventListener("load", () => resolve(img));
			img.addEventListener("error", () => resolve(img));
		}))).then(() => {
			messageCard.current.scrollTop = messageCard.current.scrollHeight - bottom;
		});
	}, []);
	
	const getMessages = useCallback((username, startId = -1, doRefresh = false) => {
		if (!username || currentUserVar === username && startId === -1 && !doRefresh)
			return;
		const isCurrentUser = currentUserVar === username;
		setShowScrollTop(false);
		if (!isCurrentUser) {
			currentUserVar = username;
			setCurrentUser(username);
			navigate.current("/chat/" + username);
			setQuote(null);
		}
		if (isMobile) {
			if (contactsComponent.current) {
				contactsComponent.current.style.display = "none";
			}
			if (chatMainComponent.current) {
				chatMainComponent.current.style.display = "flex";
			}
			document.getElementById("app-bar").style.display = "none";
		}
		try {
			Notification.requestPermission();
		} catch (e) {
			console.log("你的浏览器不支持通知，人家也没办法呀……", e);
		}
		axios.get("/api/chat/message/" + username + "/" + startId).then(res => {
			const userItem = usersVar.find(item => item.username === username);
			if (userItem) {
				if (clientUserRef.current)
					setClientUser({
						...clientUserRef.current,
						newMessageCount: Math.max(0, clientUserRef.current.newMessageCount - userItem.newMessageCount),
					});
				userItem.newMessageCount = 0;
				setUsers([...usersVar]);
			}
			let currentScrollBottom = !isCurrentUser ? 0 : messageCard.current.scrollHeight - messageCard.current.scrollTop;
			messagesVar = startId === -1 ? res.data.result.message : [...res.data.result.message, ...messagesVar];
			flushSync(() => {
				setCurrentUserDisplayName(res.data.result.displayName);
				setLastOnline(res.data.result.isOnline || username === myname ? "在线" : (
					res.data.result.lastOnline ? "上次上线：" + convertDateToLocaleShortString(res.data.result.lastOnline) : "从未上线"));
				setMessages([...messagesVar]);
			});
			setShowScrollTop(true);
			messageCardScrollTo(currentScrollBottom);
		});
	}, [setClientUser]);
	
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
			} else
				document.getElementById("page-main").style.paddingBottom = "24px";
			usersVar = data.result;
			setUsers(usersVar);
			if (!userJumped.current && urlParams.current["username"]) {
				getMessages(urlParams.current["username"]);
				userJumped.current = true;
			}
		}
	}, [data, error, getMessages, isLoading, urlParams]);
	
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
	
	const updateUserItem = useCallback((username, displayName, content, time, isCurrent, sender) => {
		const userItem = usersVar.find(item => item.username === username);
		if (userItem) {
			userItem.lastMessageText = content;
			userItem.lastMessageTime = time;
			if (sender !== myname && !isCurrent)
				userItem.newMessageCount++;
			usersVar = [userItem, ...usersVar.filter(item => item.username !== username)];
			setUsers([...usersVar]);
		} else {
			axios.get("/api/user/find/" + username).then(res => {
				usersVar = [{
					username: username,
					displayName: displayName,
					isOnline: res.data.result[0].isOnline,
					lastMessageTime: time,
					lastMessageText: content,
					newMessageCount: sender !== myname && !isCurrent ? 1 : 0,
				}, ...usersVar];
				setUsers([...usersVar]);
			});
		}
		if (sender !== myname && !isCurrent && clientUserRef.current)
			setClientUser({
				...clientUserRef.current,
				newMessageCount: clientUserRef.current.newMessageCount + 1,
			});
	}, [setClientUser]);
	
	const newMessage = useCallback((data) => {
		axios.post("/api/chat/update-viewed", {target: currentUserVar}, {
			headers: {
				"Content-Type": "application/json",
			},
		}).then(() => queryClient.current.invalidateQueries({queryKey: ["accountCheck"]}));
		
		const content = data.recipient === "ChatRoomSystem" ? data.senderDisplayName + ": " + data.content : data.content;
		updateUserItem(data.recipient === "ChatRoomSystem" ? data.recipient : (data.sender === myname ? data.recipient : data.sender),
			data.recipient === "ChatRoomSystem" ? data.recipientDisplayName : data.senderDisplayName, content, data.time, true, data.sender);
		
		messagesVar = [...messagesVar, {
			id: data.id,
			username: data.sender,
			displayName: data.senderDisplayName,
			content: data.content,
			quote: data.quote,
			time: data.time,
		}];
		
		const {scrollTop, scrollHeight, clientHeight} = messageCard.current;
		flushSync(() => setMessages([...messagesVar]));
		if (scrollTop + clientHeight + 50 >= scrollHeight) {
			messageCardScrollTo(0);
		}
	}, [updateUserItem]);
	
	let firstRebirth = useRef(false);
	
	const stompOnConnect = useCallback(() => {
		stomp.heartbeat.incoming = 10000;
		stomp.heartbeat.outgoing = 10000;
		
		firstRebirth.current = true;
		
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
				userItem.isOnline = true;
				setUsers([...usersVar]);
			}
			if (username === currentUserVar)
				setLastOnline("在线");
		});
		
		stomp.subscribe("/topic/chat.offline", (message) => {
			const data = JSON.parse(message.body);
			const userItem = usersVar.find(item => item.username === data.username);
			if (userItem) {
				userItem.isOnline = false;
				userItem.lastOnline = data.lastOnline;
				setUsers([...usersVar]);
			}
			if (data.username === currentUserVar)
				setLastOnline("上次上线：" + convertDateToLocaleShortString(data.lastOnline));
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
				updateUserItem(data.sender === myname ? data.recipient : data.sender,
					data.sender === myname ? data.recipientDisplayName : data.senderDisplayName,
					data.content, data.time, false, data.sender);
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
				updateUserItem(data.recipient, data.recipientDisplayName, data.senderDisplayName + ": " + data.content, data.time, false, data.sender);
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
				const userItem = usersVar.find(item => item.username === (data.sender === myname ? data.recipient : data.sender));
				if (userItem) {
					userItem.lastMessageText = "消息已撤回";
					setUsers([...usersVar]);
				}
			}
		}, {"auto-delete": true});
		
		stomp.subscribe(`/topic/chat.group.public.delete`, (message) => {
			const data = JSON.parse(message.body);
			
			const item = messagesVar.find(item => item.id === data.id);
			if (item) {
				item.content = "消息已撤回";
				item.id = -item.id;
				setMessages([...messagesVar]);
			}
			
			if (data["isLatest"]) {
				const userItem = usersVar.find(item => item.username === "ChatRoomSystem");
				if (userItem) {
					userItem.lastMessageText = data.displayName + ": 消息已撤回";
					setUsers([...usersVar]);
				}
			}
		});
	}, [getMessages, newMessage, updateUserItem]);
	
	useEffect(() => {
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
				firstRebirth.current = false;
				if (!disconnectErrorBarKey.current)
					disconnectErrorBarKey.current = enqueueSnackbar("服务器连接已断开，正在尝试重连...", {
						variant: "error",
						anchorOrigin: {vertical: "bottom", horizontal: "center"},
						persist: true,
					});
				stompConnect();
			} else
				setTimeout(stompConnect, 1000);
		};
		
		if (logged)
			stompConnect();
	}, [getMessages, logged, stompOnConnect]);
	
	if (logged === false)
		return <SignUp/>;
	
	return (
		<Grid container sx={{flex: 1, height: 0, display: !users ? "none" : "flex"}} gap={2}>
			<Card ref={contactsComponent} sx={{width: isMobile ? "100%" : 300, height: "100%", display: "flex", flexDirection: "column"}}>
				<OutlinedInput
					inputRef={userSearchField}
					startAdornment={<InputAdornment position="start"><SearchOutlined fontSize="small"/></InputAdornment>}
					placeholder="搜索用户"
					sx={{fontSize: 14}}
					onChange={(event) => {
						if (abortController)
							abortController.abort();
						if (event.target.value === "")
							setMatchList(null);
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
							{users != null && <UserItem
								username="ChatRoomSystem"
								displayName="公共"
								isOnline={false}
								newMessageCount={users.find(item => item.username === "ChatRoomSystem").newMessageCount}
								lastMessageTime={users.find(item => item.username === "ChatRoomSystem").lastMessageTime}
								lastMessageText={users.find(item => item.username === "ChatRoomSystem").lastMessageText}
							/>}
						</ListItemButton>
					</List>
					<Divider/>
					{!matchList && <List>
						{users != null && users.map((user) => (user.username !== "ChatRoomSystem" &&
							<ListItemButton
								key={user.username}
								onClick={() => getMessages(user.username)}
								selected={currentUser === user.username}
							>
								<UserItem
									username={user.username}
									displayName={user.displayName}
									isOnline={user.isOnline}
									newMessageCount={user.newMessageCount}
									lastMessageTime={user.lastMessageTime}
									lastMessageText={user.lastMessageText}
								/>
							</ListItemButton>
						))}
					</List>}
					{matchList != null && <List>
						{matchList.map((user) => {
							const displayNameIndex = user.displayName.toLowerCase().indexOf(userSearchField.current.value.toLowerCase());
							const usernameIndex = user.username.toLowerCase().indexOf(userSearchField.current.value.toLowerCase());
							const keyLength = userSearchField.current.value.length;
							let beforeHighlight, highlight, afterHighlight;
							
							if (displayNameIndex !== -1) {
								beforeHighlight = user.displayName.slice(0, displayNameIndex);
								highlight = user.displayName.slice(displayNameIndex, displayNameIndex + keyLength);
								afterHighlight = `${user.displayName.slice(displayNameIndex + keyLength)} (@${user.username})`;
							} else {
								beforeHighlight = `${user.displayName} (@${user.username.slice(0, usernameIndex)}`;
								highlight = user.username.slice(usernameIndex, usernameIndex + keyLength);
								afterHighlight = `${user.username.slice(usernameIndex + keyLength)})`;
							}
							
							return (
								<ListItemButton
									key={user.username}
									onClick={() => getMessages(user.username)}
									selected={currentUser === user.username}
								>
									<UserItem
										username={user.username}
										displayName={`${user.displayName} (@${user.username})`}
										isOnline={user.isOnline}
										newMessageCount={0}
										displayNameNode={
											<>
												{beforeHighlight}
												<Typography component="span" color="primary">{highlight}</Typography>
												{afterHighlight}
											</>
										}
									/>
								</ListItemButton>
							);
						})}
					</List>}
				</Box>
			</Card>
			<Grid container ref={chatMainComponent} direction="column" sx={{flex: 1, height: "100%", display: isMobile ? "none" : "flex", pt: isMobile ? 2 : 0}}
			      gap={1.5}>
				{Boolean(currentUser) && <Card sx={{width: "100%"}}>
					<Grid container direction="row" justifyContent="space-between" alignItems="center" padding={isMobile ? 1 : 1.5} gap={1.5}>
						{isMobile && <IconButton onClick={() => {
							if (contactsComponent.current) {
								contactsComponent.current.style.display = "flex";
							}
							if (chatMainComponent.current) {
								chatMainComponent.current.style.display = "none";
							}
							document.getElementById("app-bar").style.display = "flex";
							setCurrentUser(null);
							setCurrentUserDisplayName(null);
							currentUserVar = null;
							navigate.current("/chat");
						}}>
							<ArrowBack/>
						</IconButton>}
						<Grid container direction="column" alignItems={isMobile ? "center" : "flex-start"} sx={{flex: 1}}>
							<Typography maxWidth="100%" overflow="hidden" textOverflow="ellipsis" fontWeight="bold" noWrap>
								{currentUserDisplayName}
							</Typography>
							<Typography variant="body2" color="textSecondary" maxWidth="100%" noWrap overflow="hidden" textOverflow="ellipsis">
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
									text = message.map((item) => (`## ${item.displayName} (@${item.username}) ${convertDateToLocaleAbsoluteString(item.time)}\n\n` + item.content)).join("\n\n")
										+ "\n\n" + text;
									startId = message[0].id;
								}
								const link = document.createElement("a");
								link.href = URL.createObjectURL(new Blob([text], {type: "text/plain;charset=utf-8"}));
								link.style.display = "none";
								link.download = "ChyChat-" + currentUserVar + ".txt";
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
				</Card>}
				<Card ref={messageCard} sx={{flex: 1, overflowY: "auto", px: 1, pt: 2, maxWidth: "100%"}} onScroll={(event) => {
					if (event.target.scrollTop <= 50 && messagesVar.length > 0 && lastScrollStartId.current !== messagesVar[0].id - 1 && messagesVar.length >= 30) {
						lastScrollStartId.current = messagesVar[0].id - 1;
						getMessages(currentUserVar, lastScrollStartId.current);
					}
				}}>
					{messages.map((message, index) => {
						const currentDate = new Date(message.time);
						const previousDate = new Date(!index ? 0 : messages[index - 1].time);
						const showTime = currentDate.getTime() - previousDate.getTime() > 5 * 60 * 1000;
						return (
							<Fragment key={message.id}>
								{showTime && <Grid container><Chip label={convertDateToLocaleAbsoluteString(currentDate)} sx={{mx: "auto"}}/></Grid>}
								<Message
									messageId={message.id}
									username={message.username}
									displayName={message.displayName}
									content={message.content}
									quote={message.quote}
									timestamp={message.time}
									setQuote={setQuote}
								/>
							</Fragment>
						);
					})}
					{showScrollTop && <ScrollTop messageCard={messageCard}>
						<Fab size="small">
							<ArrowDownward/>
						</Fab>
					</ScrollTop>}
				</Card>
				{currentUser != null && <Card sx={{maxWidth: "100%"}}>
					{quote != null &&
						<Chip
							variant="outlined"
							avatar={<UserAvatar username={quote.username} displayName={quote.displayName}/>}
							label={quote.displayName + ": " + quote.content}
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
								if (event.metaKey || event.ctrlKey)
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
				</Card>}
			</Grid>
		</Grid>
	);
}