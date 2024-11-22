import {Fragment, memo, useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";
import {Badge, Fab, InputLabel, List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Paper, Switch, useMediaQuery, Zoom} from "@mui/material";
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
import {throttle} from "lodash";
import {UserAvatar, UsernameWithBadge} from "src/components/UserComponents.jsx";
import {NavigateIconButton} from "src/components/NavigateComponents.jsx";
import Link from "@mui/material/Link";

const myname = Cookies.get("username"), myToken = Cookies.get("user_token");

let currentUserVar = null, settingsVar = JSON.parse(localStorage.getItem("chatSettings")) || {useMarkdown: false};
let usersVar = [], messagesVar = [];
let socket, stomp;

const uploadDraft = (contact, content) => {
	axios.post("/api/chat/draft/save", {contact: contact, content: content}, {
		headers: {
			"Content-Type": "application/json",
		},
	});
};

const uploadDraftThrottle = throttle(uploadDraft, 2000);

const saveDraft = throttle((contact, content, setUsers) => {
	setUsers(users => {
		usersVar = users.map(user => (
			user.username === contact ? ({
				...users.find(item => item.username === contact),
				draft: content,
			}) : user)
		);
		return usersVar;
	});
	uploadDraftThrottle(contact, content);
}, 100);

const UserItem = memo(({
	                       username, displayName, avatarVersion, badge,
	                       isOnline, newMessageCount, lastMessageTime, lastMessageText, draft, displayNameNode
                       }) => {
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
								boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
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
						<UserAvatar username={username} displayName={displayName} avatarVersion={avatarVersion}/>
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
						<UsernameWithBadge
							username={displayNameNode ? displayNameNode : displayName}
							badge={badge}
						/>
						{lastMessageTime && <Typography variant="body2" color="textSecondary">
							{convertDateToLocaleShortString(lastMessageTime)}
						</Typography>}
					</Grid>
				}
				secondary={draft ? (
					<Typography variant="body2" color="primary" noWrap textOverflow="ellipsis">
						[草稿] {draft.toString()}
					</Typography>
				) : (
					<Typography variant="body2" color="text.secondary" noWrap textOverflow="ellipsis">
						{lastMessageText}
					</Typography>
				)}
			/>
		</>
	);
});

UserItem.propTypes = {
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
	badge: PropTypes.string,
	isOnline: PropTypes.bool,
	newMessageCount: PropTypes.number,
	lastMessageTime: PropTypes.string,
	lastMessageText: PropTypes.string,
	draft: PropTypes.string,
	displayNameNode: PropTypes.node,
}

const Message = memo(({messageId, username, displayName, avatarVersion, badge, content, quote, setQuote, useMarkdown}) => {
	const [contextMenu, setContextMenu] = useState(null);
	const [onDialog, setOnDialog] = useState(false);
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
	
	const isMe = username === myname;
	
	return (
		<Grid container justifyContent={isMe ? 'flex-end' : 'flex-start'} alignItems="flex-start" sx={{my: 2}} id={"message-" + messageId}>
			{!isMe && <NavigateIconButton sx={{mr: 1, p: 0}} href={`/user/${username}`}>
				<UserAvatar username={username} displayName={displayName} avatarVersion={avatarVersion}/>
			</NavigateIconButton>}
			<Grid container direction="column" sx={{maxWidth: "75%"}} alignItems={isMe ? 'flex-end' : 'flex-start'} spacing={0.7}>
				<Paper
					elevation={3}
					sx={{
						padding: '8px 11px',
						borderRadius: '10px',
						backgroundColor: isMe ? '#1976d2' : 'normal',
						color: isMe ? 'white' : 'normal',
						wordBreak: 'break-word',
						userSelect: isSmallScreen ? "none" : "auto",
						maxWidth: "100%",
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
						{useMarkdown ? <ChatMarkdown>{content}</ChatMarkdown> : content}
					</Box>
				</Paper>
				{quote != null &&
					<Chip
						variant="outlined"
						avatar={<UserAvatar username={quote.username} displayName={quote.displayName} avatarVersion={quote.avatarVersion}/>}
						label={quote.displayName + ": " + quote.content}
						onClick={() => {
							if (document.getElementById("message-" + quote.id))
								document.getElementById("message-" + quote.id).scrollIntoView({behavior: "smooth"});
						}}
					/>
				}
			</Grid>
			{isMe && <NavigateIconButton sx={{ml: 1, p: 0}} href={`/user/${username}`}>
				<UserAvatar username={username} displayName={displayName} avatarVersion={avatarVersion}/>
			</NavigateIconButton>}
			<Dialog open={onDialog} onClose={() => setOnDialog(false)}>
				<DialogTitle>
					<UsernameWithBadge username={displayName} badge={badge} fontSize={20} size={22}/>
				</DialogTitle>
				<DialogContent>
					{useMarkdown ? <ChatMarkdown>{content}</ChatMarkdown> : content}
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
						avatarVersion: avatarVersion,
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
});

Message.propTypes = {
	messageId: PropTypes.number.isRequired,
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
	badge: PropTypes.string,
	content: PropTypes.string,
	quote: PropTypes.object,
	setQuote: PropTypes.func.isRequired,
	useMarkdown: PropTypes.bool,
}

const notify = (title, body, iconId, avatarVersion) => {
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
					icon: `/avatars/${iconId}.webp?v=${avatarVersion}`,
				});
			});
		});
	} catch (e) {
		console.log("你的浏览器不支持通知，人家也没办法呀……", e);
	}
};

const ChatToolBar = memo(({inputField}) => {
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
	
	const cursorSelection = useRef([]);
	
	const [onSettings, handleSettings] = useState(false);
	const [settings, setSettings] = useState(settingsVar);
	const settingItems = ["useMarkdown", "allowNotification", "allowPublicNotification", "allowCurrentNotification", "displayNotificationContent"];
	const settingItemsDisplay = ["启用Markdown+", "允许通知", "允许公共频道通知", "允许当前联系人通知", "通知显示消息内容"];
	
	const updateCursorSelection = useCallback(() => {
		cursorSelection.current = [inputField.current.selectionStart, inputField.current.selectionEnd];
	}, []);
	
	const insertText = useCallback((text, closeDialog) => {
		const start = cursorSelection.current[0], end = cursorSelection.current[1];
		inputField.current.value = inputField.current.value.slice(0, start) + text + inputField.current.value.slice(end);
		flushSync(closeDialog);
		inputField.current.focus();
		inputField.current.setSelectionRange(start + text.length, start + text.length);
	}, []);
	
	const MarkdownChecker = memo(() => {
		return settings.useMarkdown === false && (
			<Typography color="error">
				您还没有启用Markdown+，是否前往开启？
				<Link onClick={() => handleSettings(true)} sx={{cursor: 'pointer'}}>
					打开设置
				</Link>
			</Typography>
		);
	});
	
	return (
		<>
			<Box>
				<IconButton
					size="large"
					onClick={() => {
						updateCursorSelection();
						handleSpecialFont(true);
					}}
				>
					<FontDownloadOutlined/>
				</IconButton>
				<IconButton
					size="large"
					onClick={() => {
						updateCursorSelection();
						handleAddLink(true);
					}}
				>
					<AddLinkOutlined/>
				</IconButton>
				<IconButton
					size="large"
					onClick={() => {
						updateCursorSelection();
						handleAddImage(true);
					}}
				>
					<AddPhotoAlternateOutlined/>
				</IconButton>
				<IconButton
					size="large"
					onClick={() => {
						updateCursorSelection();
						handleEmojiPicker(true);
					}}
				>
					<AddReactionOutlined/>
				</IconButton>
				<IconButton
					size="large"
					onClick={() => {
						updateCursorSelection();
						handleSettings(true);
					}}
				>
					<SettingsOutlined/>
				</IconButton>
			</Box>
			<Dialog open={onSpecialFont} onClose={() => handleSpecialFont(false)} fullWidth>
				<DialogTitle>
					添加特殊字体
				</DialogTitle>
				<DialogContent>
					<MarkdownChecker/>
					<Grid container gap={1}>
						<FormControl margin="dense" sx={{mb: 0, minWidth: 80}}>
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
					<Button
						onClick={() => {
							if (fontStyle.length > 0 && fontStyle.charAt(0) === '#') {
								let start = cursorSelection.current[0], end = cursorSelection.current[1], text = fontStyle + " " + fontTextRef.current.value;
								
								flushSync(() => handleSpecialFont(false));
								inputField.current.focus();
								
								if (start > 0 && inputField.current.value[start - 1] !== "\n") {
									document.execCommand("insertLineBreak");
									start++;
									end++;
								}
								
								inputField.current.value = inputField.current.value.slice(0, start) + text + inputField.current.value.slice(end);
								inputField.current.setSelectionRange(start + text.length, start + text.length);
								
								document.execCommand("insertLineBreak");
							} else {
								insertText(fontStyle + fontTextRef.current.value + fontStyle, () => handleSpecialFont(false));
							}
						}}
					>
						确认
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={onAddLink} onClose={() => handleAddLink(false)} fullWidth>
				<DialogTitle>
					添加链接
				</DialogTitle>
				<DialogContent>
					<MarkdownChecker/>
					<Grid container gap={2}>
						<TextField label="链接地址" sx={{mt: 1}} fullWidth inputRef={linkHrefRef}/>
						<TextField label="显示文本" fullWidth inputRef={linkTextRef}/>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleAddLink(false)}>关闭</Button>
					<Button
						onClick={() => {
							insertText("[" + linkTextRef.current.value + "](" + linkHrefRef.current.value + ")",
								() => handleAddLink(false));
						}}
					>确认</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={onAddImage} onClose={() => handleAddImage(false)} fullWidth>
				<DialogTitle>
					添加图片
				</DialogTitle>
				<DialogContent>
					<MarkdownChecker/>
					<Grid container gap={2}>
						<TextField label="图片地址" sx={{mt: 1}} fullWidth inputRef={imageHrefRef}/>
						<TextField label="替代文字" fullWidth inputRef={imageAltRef}/>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleAddImage(false)}>关闭</Button>
					<Button
						onClick={() => {
							insertText("![" + imageAltRef.current.value + "](" + imageHrefRef.current.value + ")",
								() => handleAddImage(false));
						}}
					>
						确认
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={onEmojiPicker} onClose={() => handleEmojiPicker(false)} PaperProps={{sx: {borderRadius: "10px", margin: 0}}}>
				<Picker
					theme={binaryColorMode}
					locale="zh"
					onEmojiSelect={(emoji) => {
						insertText(emoji.native, () => handleEmojiPicker(false));
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
});

ChatToolBar.propTypes = {
	inputField: PropTypes.object.isRequired,
}

const ScrollTop = memo(({children, messageCard}) => {
	const [trigger, setTrigger] = useState(false);
	const [top, setTop] = useState(0);
	const [left, setLeft] = useState(0);
	
	useEffect(() => {
		messageCard.current.addEventListener("scroll", () => {
			if (messageCard.current.scrollTop + messageCard.current.clientHeight + 100 <= messageCard.current.scrollHeight)
				setTrigger(true);
			else
				setTrigger(false);
		});
		
		const observer = new ResizeObserver(() => {
			if (messageCard.current) {
				setTop(messageCard.current.clientHeight + messageCard.current.offsetTop - 50);
				setLeft(messageCard.current.clientWidth / 2 + messageCard.current.offsetLeft - 25);
			}
		});
		
		observer.observe(messageCard.current);
	}, [messageCard]);
	
	if (!messageCard.current || messageCard.current.display === "none") {
		return null;
	}
	
	return (
		<Zoom in={trigger}>
			<Box
				onClick={() => messageCard.current.scrollTo({top: messageCard.current.scrollHeight, behavior: "smooth"})}
				role="presentation"
				sx={{
					position: "absolute",
					top: top + "px",
					left: left + "px",
				}}
			>
				{children}
			</Box>
		</Zoom>
	);
});

ScrollTop.propTypes = {
	children: PropTypes.node,
	messageCard: PropTypes.object.isRequired,
}

export default function Chat() {
	document.title = "Chat - chy.web";
	
	const {username} = useParams();
	const navigate = useNavigate();
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
	
	const [users, setUsers] = useState(null);
	const [logged, setLogged] = useState(null);
	const [currentUser, setCurrentUser] = useState(null);
	const [currentUserDisplayName, setCurrentUserDisplayName] = useState(null);
	const [currentUserBadge, setCurrentUserBadge] = useState(null);
	const [messages, setMessages] = useState([]);
	const [lastOnline, setLastOnline] = useState("");
	const [quote, setQuote] = useState(null);
	const [matchList, setMatchList] = useState(null);
	const [abortController, setAbortController] = useState(null);
	const [showScrollTop, setShowScrollTop] = useState(false);
	const [contactsVersion, setContactsVersion] = useState(1);
	
	const messageCard = useRef(null);
	const messageInput = useRef(null);
	const userSearchField = useRef(null);
	
	const disconnectErrorBarKey = useRef(null);
	
	const {clientUser, setClientUser, clientUserLoading} = useClientUser();
	const clientUserRef = useRef(null);
	
	if (!clientUserLoading)
		clientUserRef.current = clientUser;
	
	const messagePageNumberCurrent = useRef(0);
	const messagePageNumberNew = useRef(0);
	const lastMessageRef = useRef(null);
	const messageLoadingObserver = useRef(new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting && messagePageNumberNew.current === messagePageNumberCurrent.current) {
			messagePageNumberNew.current = messagePageNumberCurrent.current + 1;
			getMessages(currentUserVar, messagePageNumberNew.current);
		}
	}));
	
	const userFindPageNumberCurrent = useRef(0);
	const userFindPageNumberNew = useRef(0);
	const lastUserFindingRef = useRef(null);
	const userFindingObserver = useRef(new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting && userFindPageNumberNew.current === userFindPageNumberCurrent.current) {
			userFindPageNumberNew.current = userFindPageNumberCurrent.current + 1;
			axios.get(`/api/user/find/${userFindPageNumberNew.current}`, {params: {key: userSearchField.current.value}}).then(res => {
				if (res.data.result.length > 0) {
					setMatchList(matchList => [...matchList, ...res.data.result]);
				}
			});
		}
	}));
	
	const contactPageNumberCurrent = useRef(0);
	const contactPageNumberNew = useRef(0);
	const lastContactRef = useRef(null);
	const contactFetchSuccess = useRef(true);
	const contactPageObserver = useRef(new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting && contactPageNumberNew.current === contactPageNumberCurrent.current) {
			contactPageNumberNew.current = contactPageNumberCurrent.current + 1;
			const fetchedPageNumber = contactPageNumberNew.current;
			axios.get(`/api/chat/contacts/${fetchedPageNumber}`).then(res => {
				if (res.data.result.length > 0 && fetchedPageNumber === contactPageNumberNew.current) {
					contactFetchSuccess.current = true;
					setUsers(users => {
						usersVar = [...users, ...res.data.result];
						return usersVar;
					});
				}
			});
		}
	}));
	
	const messageCardScrollTo = useCallback((bottom, behavior) => {
		messageCard.current.scrollTo({top: messageCard.current.scrollHeight - bottom, behavior: behavior});
		Promise.all(Array.prototype.slice.call(messageCard.current.getElementsByTagName("img")).map(img => new Promise(resolve => {
			img.addEventListener("load", () => resolve(img));
			img.addEventListener("error", () => resolve(img));
		}))).then(() => {
			messageCard.current.scrollTo({top: messageCard.current.scrollHeight - bottom, behavior: behavior});
		});
	}, []);
	
	const getMessages = useCallback((username, pageNumber = 0, doRefresh = false) => {
		if (!username || currentUserVar === username && pageNumber === 0 && !doRefresh)
			return;
		
		const isCurrentUser = currentUserVar === username;
		
		if (!isCurrentUser) {
			if (messageInput.current) {
				uploadDraft(currentUserVar, messageInput.current.value);
			}
			setShowScrollTop(false);
			currentUserVar = username;
			setCurrentUser(username);
			setQuote(null);
			messagePageNumberNew.current = 0;
			messagePageNumberCurrent.current = 0;
		}
		
		try {
			Notification.requestPermission();
		} catch (e) {
			console.log("你的浏览器不支持通知，人家也没办法呀……", e);
		}
		
		axios.get(`/api/chat/message/${username}/${pageNumber}`).then(res => {
			const userItem = usersVar.find(item => item.username === username);
			if (userItem) {
				if (clientUserRef.current) {
					setClientUser({
						...clientUserRef.current,
						newMessageCount: Math.max(0, clientUserRef.current.newMessageCount - userItem.newMessageCount),
					});
				}
				userItem.newMessageCount = 0;
				setUsers([...usersVar]);
				messageInput.current.value = userItem.draft ? userItem.draft : "";
			}
			let currentScrollBottom = !isCurrentUser ? 0 : messageCard.current.scrollHeight - messageCard.current.scrollTop;
			if (res.data.result && res.data.result.message && res.data.result.message.length > 0 || pageNumber === 0) {
				flushSync(() => {
					messagesVar = pageNumber === 0 ? res.data.result.message : [...res.data.result.message, ...messagesVar];
					setMessages([...messagesVar]);
				});
			}
			if (!isCurrentUser) {
				flushSync(() => {
					setCurrentUserDisplayName(res.data.result.displayName);
					setCurrentUserBadge(res.data.result.badge);
					setLastOnline(res.data.result.isOnline || username === myname ? "在线" : (
						res.data.result.lastOnline ? "上次上线：" + convertDateToLocaleShortString(res.data.result.lastOnline) : "从未上线"));
				});
				setShowScrollTop(true);
			}
			messageCardScrollTo(currentScrollBottom, "instant");
		});
	}, [messageCardScrollTo, setClientUser, isSmallScreen]);
	
	const [isContactsLoading, setIsContactsLoading] = useState(true);
	
	useEffect(() => {
		axios.get("/api/chat/contacts/0").then(res => {
			if (res.data.status !== 1) {
				setLogged(false);
				return;
			}
			setLogged(true);
			contactPageNumberNew.current = 0;
			contactPageNumberCurrent.current = 0;
			contactFetchSuccess.current = true;
			usersVar = res.data.result;
			setUsers([...usersVar]);
			setIsContactsLoading(false);
		});
	}, [contactsVersion]);
	
	useEffect(() => {
		if (!isContactsLoading) {
			currentUserVar = null;
			setCurrentUser(null);
			if (username) {
				getMessages(username, 0, true);
			}
		}
	}, [isContactsLoading, username]);
	
	useEffect(() => {
		return () => {
			if (document.getElementById("app-bar")) {
				document.getElementById("app-bar").style.display = "flex";
			}
			if (stomp) {
				stomp.onWebSocketClose = () => {
				};
				stomp.disconnect(() => stomp = null);
			}
		}
	}, []);
	
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
			useMarkdown: settingsVar.useMarkdown,
		}));
	}, [quote]);
	
	const updateUserItem = useCallback((username, displayName, avatarVersion, badge, content, time, isCurrent, sender) => {
		const userItem = usersVar.find(item => item.username === username);
		
		if (userItem) {
			userItem.lastMessageText = content;
			userItem.lastMessageTime = time;
			if (sender !== myname && !isCurrent)
				userItem.newMessageCount++;
			userItem.avatarVersion = avatarVersion;
			usersVar = [userItem, ...usersVar.filter(item => item.username !== username)];
			setUsers([...usersVar]);
		} else {
			axios.get(`/api/user/find/0`, {params: {key: username}}).then(res => {
				usersVar = [{
					username: username,
					displayName: displayName,
					avatarVersion: avatarVersion,
					badge: badge,
					isOnline: res.data.result[0].isOnline,
					lastMessageTime: time,
					lastMessageText: content,
					newMessageCount: sender !== myname && !isCurrent ? 1 : 0,
				}, ...usersVar];
				setUsers([...usersVar]);
			});
		}
		
		if (sender !== myname && !isCurrent && clientUserRef.current) {
			setClientUser({
				...clientUserRef.current,
				newMessageCount: clientUserRef.current.newMessageCount + 1,
			});
		}
	}, [setClientUser]);
	
	const newMessage = useCallback((data) => {
		axios.post("/api/chat/update-viewed", {target: currentUserVar}, {
			headers: {
				"Content-Type": "application/json",
			},
		});
		
		const content = data.recipient === "ChatRoomSystem" ? data.senderDisplayName + ": " + data.content : data.content;
		updateUserItem(data.recipient === "ChatRoomSystem" || data.sender === myname ? data.recipient : data.sender,
			data.recipient === "ChatRoomSystem" || data.sender === myname ? data.recipientDisplayName : data.senderDisplayName,
			data.recipient === "ChatRoomSystem" || data.sender === myname ? data.recipientAvatarVersion : data.senderAvatarVersion,
			data.recipient === "ChatRoomSystem" || data.sender === myname ? data.recipientBadge : data.senderBadge,
			content, data.time, true, data.sender);
		
		messagesVar = [...messagesVar, {
			id: data.id,
			username: data.sender,
			displayName: data.senderDisplayName,
			avatarVersion: data.senderAvatarVersion,
			badge: data.senderBadge,
			content: data.content,
			quote: data.quote,
			useMarkdown: data.useMarkdown,
			time: data.time,
		}];
		
		const {scrollTop, scrollHeight, clientHeight} = messageCard.current;
		flushSync(() => setMessages([...messagesVar]));
		if (scrollTop + clientHeight + 50 >= scrollHeight) {
			messageCardScrollTo(0, "smooth");
		}
	}, [messageCardScrollTo, updateUserItem]);
	
	let firstRebirth = useRef(false);
	
	const stompOnConnect = useCallback(() => {
		stomp.heartbeat.incoming = 10000;
		stomp.heartbeat.outgoing = 10000;
		
		firstRebirth.current = true;
		
		if (disconnectErrorBarKey.current) {
			closeSnackbar(disconnectErrorBarKey.current);
			getMessages(currentUserVar, 0, true);
			setContactsVersion(version => version + 1);
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
						settingsVar["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender, data.senderAvatarVersion);
			} else {
				updateUserItem(data.sender === myname ? data.recipient : data.sender,
					data.sender === myname ? data.recipientDisplayName : data.senderDisplayName,
					data.sender === myname ? data.recipientAvatarVersion : data.senderAvatarVersion,
					data.sender === myname ? data.recipientBadge : data.senderBadge,
					data.content, data.time, false, data.sender);
				if (settingsVar["allowNotification"] !== false && data.sender !== myname)
					notify("[私聊] " + data.sender + "说：",
						settingsVar["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender, data.senderAvatarVersion);
			}
		}, {"auto-delete": true});
		
		stomp.subscribe("/topic/chat.group.public.message", (message) => {
			const data = JSON.parse(message.body);
			if (currentUserVar === data.recipient) {
				newMessage(data);
				if (settingsVar["allowNotification"] !== false && settingsVar["allowPublicNotification"] !== false &&
					settingsVar["allowCurrentNotification"] !== false && data.sender !== myname)
					notify("[公共] " + data.sender + "说：",
						settingsVar["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender, data.senderAvatarVersion);
			} else {
				updateUserItem(data.recipient, data.recipientDisplayName, data.recipientAvatarVersion, data.recipientBadge,
					data.data.senderDisplayName + ": " + data.content, data.time, false, data.sender);
				if (settingsVar["allowNotification"] !== false && settingsVar["allowPublicNotification"] !== false && data.sender !== myname)
					notify("[公共] " + data.sender + "说：",
						settingsVar["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender, data.senderAvatarVersion);
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
			if (firstRebirth.current) {
				firstRebirth.current = false;
				if (!disconnectErrorBarKey.current)
					disconnectErrorBarKey.current = enqueueSnackbar("服务器连接已断开，正在尝试重连...", {
						variant: "error",
						anchorOrigin: {vertical: "bottom", horizontal: "center"},
						persist: true,
					});
				stompConnect();
			} else {
				setTimeout(stompConnect, 1000);
			}
		};
		
		if (logged && !stomp) {
			stompConnect();
		}
	}, [logged, stompOnConnect]);
	
	useEffect(() => {
		if (lastMessageRef.current) {
			messagePageNumberCurrent.current = messagePageNumberNew.current;
			messageLoadingObserver.current.disconnect();
			messageLoadingObserver.current.observe(lastMessageRef.current);
		}
	}, [messages]);
	
	useEffect(() => {
		if (lastUserFindingRef.current) {
			userFindPageNumberCurrent.current = userFindPageNumberNew.current;
			userFindingObserver.current.disconnect();
			userFindingObserver.current.observe(lastUserFindingRef.current);
		}
	}, [matchList]);
	
	useEffect(() => {
		if (!isContactsLoading && contactFetchSuccess.current && lastContactRef.current) {
			contactPageNumberCurrent.current = contactPageNumberNew.current;
			contactPageObserver.current.disconnect();
			contactPageObserver.current.observe(lastContactRef.current);
			contactFetchSuccess.current = false;
		}
	}, [users, isContactsLoading]);
	
	useEffect(() => {
		if (!username) {
			setCurrentUser(null);
			setCurrentUserDisplayName(null);
			setCurrentUserBadge(null);
			currentUserVar = null;
			setMessages([]);
			messagesVar = [];
		}
		if (document.getElementById("app-bar")) {
			document.getElementById("app-bar").style.display = username && isSmallScreen ? "none" : "flex";
		}
	}, [isSmallScreen, username]);
	
	if (logged === false) {
		return <SignUp/>;
	}
	
	return (
		<Grid container sx={{flex: 1, display: !users ? "none" : "flex", minHeight: 0}} gap={2}>
			<Card
				variant="outlined"
				sx={{
					width: isSmallScreen ? "100%" : 300,
					height: "100%",
					display: username && isSmallScreen ? "none" : "flex",
					flexDirection: "column",
				}}
			>
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
							axios.get(`/api/user/find/0`, {
								signal: controller.signal,
								params: {
									key: event.target.value,
								},
							}).then(res => {
								setMatchList(res.data.result);
								userFindPageNumberNew.current = 0;
								userFindPageNumberCurrent.current = 0;
							}).catch(() => null);
						}
					}}
				/>
				<Box sx={{overflowY: "auto"}}>
					<List>
						<ListItemButton
							onClick={() => navigate("/chat/ChatRoomSystem")}
							selected={currentUser === "ChatRoomSystem"}
						>
							{users != null && <UserItem
								username="ChatRoomSystem"
								displayName="公共"
								avatarVersion={1}
								badge={users.find(item => item.username === "ChatRoomSystem").badge}
								isOnline={false}
								newMessageCount={users.find(item => item.username === "ChatRoomSystem").newMessageCount}
								lastMessageTime={users.find(item => item.username === "ChatRoomSystem").lastMessageTime}
								draft={users.find(item => item.username === "ChatRoomSystem").draft}
								lastMessageText={users.find(item => item.username === "ChatRoomSystem").lastMessageText}
							/>}
						</ListItemButton>
					</List>
					<Divider/>
					<List sx={{display: matchList ? "none" : "block"}}>
						{users != null && users.map((user, userIndex) => (user.username !== "ChatRoomSystem" &&
							<ListItemButton
								key={user.username}
								ref={userIndex === users.length - 1 ? lastContactRef : undefined}
								onClick={() => navigate(`/chat/${user.username}`)}
								selected={currentUser === user.username}
							>
								<UserItem
									username={user.username}
									displayName={user.displayName}
									avatarVersion={user.avatarVersion}
									badge={user.badge}
									isOnline={user.isOnline}
									newMessageCount={user.newMessageCount}
									lastMessageTime={user.lastMessageTime}
									lastMessageText={user.lastMessageText}
									draft={user.draft}
								/>
							</ListItemButton>
						))}
					</List>
					{matchList && <List>
						{matchList.map((user, userIndex) => {
							const displayNameIndex = user.displayName.toLowerCase().indexOf(userSearchField.current.value.toLowerCase());
							const usernameIndex = user.username.toLowerCase().indexOf(userSearchField.current.value.toLowerCase());
							const keyLength = userSearchField.current.value.length;
							let beforeHighlight, highlight, afterHighlight;
							
							if (displayNameIndex !== -1) {
								beforeHighlight = user.displayName.slice(0, displayNameIndex);
								highlight = user.displayName.slice(displayNameIndex, displayNameIndex + keyLength);
								afterHighlight = `${user.displayName.slice(displayNameIndex + keyLength)} (@${user.username})`;
							} else if (usernameIndex !== -1) {
								beforeHighlight = `${user.displayName} (@${user.username.slice(0, usernameIndex)}`;
								highlight = user.username.slice(usernameIndex, usernameIndex + keyLength);
								afterHighlight = `${user.username.slice(usernameIndex + keyLength)})`;
							} else {
								return null;
							}
							
							return (
								<ListItemButton
									key={user.username}
									ref={userIndex === matchList.length - 1 ? lastUserFindingRef : undefined}
									onClick={() => navigate(`/chat/${user.username}`)}
									selected={currentUser === user.username}
								>
									<UserItem
										username={user.username}
										displayName={`${user.displayName} (@${user.username})`}
										avatarVersion={user.avatarVersion}
										badge={user.badge}
										isOnline={user.isOnline}
										newMessageCount={0}
										lastMessageTime={user.lastMessageTime}
										lastMessageText={user.lastMessageText || "\u00A0"}
										draft={user.draft}
										displayNameNode={
											<>
												{beforeHighlight}
												<Typography component="span" color="primary" fontWeight="bold">{highlight}</Typography>
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
			<Grid container
			      direction="column"
			      sx={{
				      flex: 1,
				      height: "100%",
				      display: !username && isSmallScreen ? "none" : "flex",
				      pt: isSmallScreen ? 2 : 0,
			      }}
			      gap={1.5}
			>
				{Boolean(currentUser) && <Card variant="outlined" sx={{width: "100%"}}>
					<Grid container direction="row" justifyContent="space-between" alignItems="center" padding={isSmallScreen ? 1 : 1.5} gap={1.5}>
						{isSmallScreen && <IconButton onClick={() => {
							setCurrentUser(null);
							setCurrentUserDisplayName(null);
							setCurrentUserBadge(null);
							currentUserVar = null;
							setMessages([]);
							messagesVar = [];
							navigate("/chat");
						}}>
							<ArrowBack/>
						</IconButton>}
						<Grid container direction="column" alignItems={isSmallScreen ? "center" : "flex-start"} sx={{flex: 1}}>
							<UsernameWithBadge username={currentUserDisplayName} badge={currentUserBadge}/>
							<Typography variant="body2" color="textSecondary" maxWidth="100%" noWrap overflow="hidden" textOverflow="ellipsis">
								{lastOnline}
							</Typography>
						</Grid>
						<Box>
							<IconButton onClick={async () => {
								let text = "", pageNumber = 0;
								while (true) {
									const res = await axios.get(`/api/chat/message/${currentUserVar}/${pageNumber}`);
									const message = res.data.result.message;
									if (!message.length)
										break;
									text = message.map((item) => (`## ${item.displayName} (@${item.username}) ${convertDateToLocaleAbsoluteString(item.time)}\n\n` + item.content)).join("\n\n")
										+ "\n\n" + text;
									pageNumber++;
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
							<NavigateIconButton href={`/user/${currentUser}`}>
								<MoreHoriz/>
							</NavigateIconButton>
						</Box>
					</Grid>
				</Card>}
				<Card variant="outlined" ref={messageCard} sx={{flex: 1, overflowY: "auto", px: 1, pt: 2, maxWidth: "100%"}}>
					{messages.map((message, messageIndex) => {
						const currentDate = new Date(message.time);
						const previousDate = new Date(!messageIndex ? 0 : messages[messageIndex - 1].time);
						const showTime = currentDate.getTime() - previousDate.getTime() > 5 * 60 * 1000;
						return (
							<Box ref={messageIndex === 0 ? lastMessageRef : undefined} key={message.id}>
								{showTime && <Grid container><Chip label={convertDateToLocaleAbsoluteString(currentDate)} sx={{mx: "auto"}}/></Grid>}
								<Message
									messageId={message.id}
									username={message.username}
									displayName={message.displayName}
									avatarVersion={message.avatarVersion}
									badge={message.badge}
									content={message.content}
									quote={message.quote}
									setQuote={setQuote}
									useMarkdown={message.useMarkdown}
								/>
							</Box>
						);
					})}
					{showScrollTop && <ScrollTop messageCard={messageCard}>
						<Fab size="small">
							<ArrowDownward/>
						</Fab>
					</ScrollTop>}
				</Card>
				{currentUser != null && <Box sx={{width: "100%"}}>
					{quote != null &&
						<Chip
							variant="outlined"
							avatar={<UserAvatar username={quote.username} displayName={quote.displayName} avatarVersion={quote.avatarVersion}/>}
							label={quote.displayName + ": " + quote.content}
							clickable
							onClick={() => document.getElementById("message-" + quote.id).scrollIntoView({behavior: "smooth"})}
							onDelete={() => setQuote(null)}
						/>
					}
					<Card variant="outlined" sx={{maxWidth: "100%"}}>
						<TextField
							inputRef={messageInput}
							placeholder="Message"
							multiline
							fullWidth
							maxRows={10}
							slotProps={{input: {style: {fontSize: 15, padding: 10}}}}
							onKeyDown={(event) => {
								if (!isSmallScreen && event.keyCode === 13) {
									event.preventDefault();
									if (event.metaKey || event.ctrlKey)
										document.execCommand("insertLineBreak");
									else
										sendMessage();
								}
							}}
							onChange={(event) => saveDraft(currentUserVar, event.target.value, setUsers)}
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
				</Box>}
			</Grid>
		</Grid>
	);
}