import {memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import axios from "axios";
import {
	Backdrop,
	Badge,
	CircularProgress,
	Fab,
	InputLabel,
	List,
	ListItemAvatar,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	MenuList,
	Paper,
	Switch,
	Tooltip,
	useMediaQuery,
	Zoom
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import PropTypes from "prop-types";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography"
import {
	AddReactionOutlined,
	ArrowBack,
	ArrowDownward,
	BrokenImageOutlined,
	Cancel,
	CloudDownload,
	ContentCopyOutlined,
	DeleteOutline,
	Filter,
	FontDownloadOutlined,
	FormatQuoteOutlined,
	InsertDriveFileOutlined,
	MoreHoriz,
	PersonSearch,
	Search,
	Send,
	SettingsOutlined,
	UploadFileOutlined,
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
import {debounce, throttle} from "lodash";
import {UserAvatar, UsernameWithBadge} from "src/components/UserComponents.jsx";
import {NavigateIconButton} from "src/components/NavigateComponents.jsx";
import Link from "@mui/material/Link";
import {LoadingButton} from "@mui/lab";
import {isIOS13, isMobile} from "react-device-detect";

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
	if (content.length > 2000) {
		return;
	}
	
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

const UserItem = memo(function UserItem({
	                                        username, displayName, avatarVersion, badge,
	                                        isOnline, newMessageCount, lastMessageTime, lastMessageText, draft, displayNameNode
                                        }) {
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

export const MessageFile = memo(function MessageFile({url, fileName, fileSize, deleted, disableTouchRipple, ...props}) {
	const [showBrokenDialog, setShowBrokenDialog] = useState(false);
	
	if (/\.(jpg|jpeg|jfif|pjepg|pjp|png|webp|gif|avif|apng|bmp)$/i.test(fileName) && deleted === false) {
		return <img src={url} alt={fileName}
		            style={{maxWidth: "min(100%, 300px)", maxHeight: "min(100%, 300px)", objectFit: "contain", borderRadius: "4px"}} {...props} />;
	}
	
	if (/\.(mp4|webm|ogg|ogv)$/i.test(fileName) && deleted === false) {
		return <video src={url} controls
		              style={{maxWidth: "min(100%, 300px)", maxHeight: "min(100%, 300px)", objectFit: "contain", borderRadius: "4px"}} {...props} />;
	}
	
	return (
		<Paper variant="outlined" sx={{maxWidth: "100%"}} {...props}>
			<ListItemButton
				disableTouchRipple={disableTouchRipple}
				sx={{borderRadius: "8px"}}
				onClick={!url ? undefined : () => {
					if (!deleted) {
						window.open(url);
					} else {
						setShowBrokenDialog(true);
					}
				}}
			>
				<Grid container gap={1.5} wrap="nowrap" alignItems="center">
					{!deleted ? <InsertDriveFileOutlined fontSize="large"/> : <BrokenImageOutlined fontSize="large"/>}
					<ListItemText
						primary={
							<Typography
								overflow="hidden"
								textOverflow="ellipsis"
								sx={{
									lineHeight: "21px",
									wordWrap: "break-word",
									maxHeight: "42px",
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
								}}
							>
								{fileName}
							</Typography>
						}
						secondary={
							<Typography fontSize={14} color="textSecondary" overflow="hidden" textOverflow="ellipsis" noWrap>
								{fileSize < 1024 ? `${fileSize} Bytes` :
									(fileSize < 1024 * 1024 ? `${Math.round(fileSize / 1024)} KB` : `${Math.round(fileSize / 1024 / 1024)} MB`)}
							</Typography>
						}
					/>
				</Grid>
			</ListItemButton>
			<Dialog open={showBrokenDialog} onClose={() => setShowBrokenDialog(false)}>
				<DialogTitle>
					文件已失效！
				</DialogTitle>
				<DialogActions>
					<Button onClick={() => setShowBrokenDialog(false)}>关闭</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	)
});

MessageFile.propTypes = {
	url: PropTypes.string,
	fileName: PropTypes.string.isRequired,
	fileSize: PropTypes.number.isRequired,
	deleted: PropTypes.bool,
	disableTouchRipple: PropTypes.bool,
}

const Message = memo(function Message({
	                                      messageId,
	                                      type,
	                                      username,
	                                      displayName,
	                                      avatarVersion,
	                                      badge,
	                                      content,
	                                      file,
	                                      quote,
	                                      setQuote,
	                                      useMarkdown,
	                                      setMessages,
	                                      messagePageNumberNew,
	                                      messagePageNumberCurrent
                                      }) {
	const [contextMenu, setContextMenu] = useState(null);
	const [onDialog, setOnDialog] = useState(false);
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
	
	const contextMenuTimeout = useRef(null);
	const isLongPress = useRef(false);
	
	const [isMessageSearchScrollLoading, setIsMessageSearchScrollLoading] = useState(false);
	const toggleMessageSearchScrollLoading = useRef(debounce((isLoading) => {
		setIsMessageSearchScrollLoading(isLoading);
	}, 100));
	
	const isMe = username === myname;
	
	return (
		<Grid container justifyContent={isMe ? 'flex-end' : 'flex-start'} alignItems="flex-start" sx={{my: 2}} id={"message-" + messageId}>
			<Backdrop open={isMessageSearchScrollLoading} sx={{zIndex: 8964}}>
				<CircularProgress size={50}/>
			</Backdrop>
			{!isMe && <NavigateIconButton sx={{mr: 1, p: 0}} href={`/user/${username}`}>
				<UserAvatar username={username} displayName={displayName} avatarVersion={avatarVersion}/>
			</NavigateIconButton>}
			<Grid container direction="column" sx={{maxWidth: "75%"}} alignItems={isMe ? 'flex-end' : 'flex-start'} spacing={0.7}>
				{type === 1 ? (
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
							if (!isIOS13) {
								setContextMenu(contextMenu ? null : {
									mouseX: event.clientX + 2,
									mouseY: event.clientY - 6,
								});
							}
						}}
						onTouchStart={(event) => {
							if (isIOS13 && !contextMenuTimeout.current) {
								contextMenuTimeout.current = setTimeout(() => {
									setContextMenu(contextMenu ? null : {
										mouseX: event.changedTouches[0].clientX + 2,
										mouseY: event.changedTouches[0].clientY - 6,
									});
									isLongPress.current = true;
								}, 300);
							}
						}}
						onTouchEnd={(event) => {
							if (contextMenuTimeout.current) {
								window.clearTimeout(contextMenuTimeout.current);
								contextMenuTimeout.current = null;
							}
							if (isLongPress.current === true) {
								event.preventDefault();
								isLongPress.current = false;
							}
						}}
					>
						<Box>
							<ChatMarkdown useMarkdown={useMarkdown}>{content}</ChatMarkdown>
						</Box>
					</Paper>
				) : (
					<MessageFile
						url={file.url}
						fileName={file.fileName}
						fileSize={file.fileSize}
						deleted={file.deleted}
						onContextMenu={(event) => {
							event.preventDefault();
							setContextMenu(contextMenu ? null : {
								mouseX: event.clientX + 2,
								mouseY: event.clientY - 6,
							});
						}}
						onTouchStart={(event) => {
							if (isIOS13 && !contextMenuTimeout.current) {
								contextMenuTimeout.current = setTimeout(() => {
									setContextMenu(contextMenu ? null : {
										mouseX: event.changedTouches[0].clientX + 2,
										mouseY: event.changedTouches[0].clientY - 6,
									});
									isLongPress.current = true;
								}, 300);
							}
						}}
						onTouchEnd={(event) => {
							if (contextMenuTimeout.current) {
								window.clearTimeout(contextMenuTimeout.current);
								contextMenuTimeout.current = null;
							}
							if (isLongPress.current === true) {
								event.preventDefault();
								isLongPress.current = false;
							}
						}}
					/>
				)}
				{quote != null &&
					<Chip
						variant="outlined"
						avatar={<UserAvatar username={quote.username} displayName={quote.displayName} avatarVersion={quote.avatarVersion}/>}
						label={quote.displayName + ": " + quote.content}
						onClick={async () => {
							if (!messagesVar.find(item => item.id === quote.id)) {
								toggleMessageSearchScrollLoading.current(true);
								
								let currentMessageList;
								
								do {
									messagePageNumberNew.current = messagePageNumberCurrent.current = messagePageNumberCurrent.current + 1;
									currentMessageList = await axios.get(`/api/chat/message/${currentUserVar}/${messagePageNumberNew.current}`)
										.then(res => res.data.result.message);
									messagesVar = [...currentMessageList, ...messagesVar];
								} while (!currentMessageList.find(item => item.id === quote.id));
								
								flushSync(() => setMessages([...messagesVar]));
								
								toggleMessageSearchScrollLoading.current(false);
							}
							
							if (document.getElementById(`message-${quote.id}`)) {
								document.getElementById(`message-${quote.id}`).scrollIntoView({behavior: "smooth"});
							} else {
								enqueueSnackbar("消息不存在", {variant: "error"});
							}
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
				{type === 1 ? (
					<DialogContent>
						<ChatMarkdown useMarkdown={useMarkdown}>{content}</ChatMarkdown>
					</DialogContent>
				) : (
					<DialogContent sx={{display: "grid"}}>
						<MessageFile
							url={file.url}
							fileName={file.fileName}
							fileSize={file.fileSize}
							deleted={file.deleted}
							onContextMenu={(event) => event.preventDefault()}
						/>
					</DialogContent>
				)}
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
				{username === myname && <MenuItem onClick={() => {
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
				</MenuItem>}
			</Menu>
		</Grid>
	);
});

Message.propTypes = {
	messageId: PropTypes.number.isRequired,
	type: PropTypes.number.isRequired,
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
	badge: PropTypes.string,
	content: PropTypes.string,
	file: PropTypes.object,
	quote: PropTypes.object,
	setQuote: PropTypes.func.isRequired,
	useMarkdown: PropTypes.bool,
	setMessages: PropTypes.func.isRequired,
	messagePageNumberCurrent: PropTypes.object.isRequired,
	messagePageNumberNew: PropTypes.object.isRequired,
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

const ChatToolBar = memo(function ChatToolBar({inputField, quote, setQuote, sendFiles, setMessages, messagePageNumberNew, messagePageNumberCurrent}) {
	const [binaryColorMode] = useBinaryColorMode();
	const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("md"));
	
	const [onSpecialFont, handleSpecialFont] = useState(false);
	const [fontStyle, setFontStyle] = useState("");
	const fontTextRef = useRef(null);
	
	const [onMessageSearching, setOnMessageSearching] = useState(false);
	const [messageSearchResults, setMessageSearchResults] = useState(null);
	const [isMessageSearchScrollLoading, setIsMessageSearchScrollLoading] = useState(false);
	const toggleMessageSearchScrollLoading = useRef(debounce((isLoading) => {
		setIsMessageSearchScrollLoading(isLoading);
	}, 100));
	
	const [messageSearchKeywords, setMessageSearchKeywords] = useState("");
	const messageSearchInputRef = useRef(null);
	const lastMessageSearchTime = useRef(null);
	const messageSearchResultBodyRef = useRef(null);
	const messageSearchResultBodyScrollTop = useRef(0);
	
	const messageSearchRegex = useMemo(() => {
		return new RegExp(`(${messageSearchKeywords === "" ? "?!" : messageSearchKeywords?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "i");
	}, [messageSearchKeywords]);
	
	const messageSearchPageNumberCurrent = useRef(0);
	const messageSearchPageNumberNew = useRef(0);
	const lastMatchedMessageRef = useRef(null);
	const messageSearchObserver = useRef(new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting && messageSearchPageNumberNew.current === messageSearchPageNumberCurrent.current) {
			messageSearchPageNumberNew.current = messageSearchPageNumberCurrent.current + 1;
			axios.get(`/api/chat/message/match/${currentUserVar}/${messageSearchPageNumberNew.current}`, {params: {key: messageSearchInputRef.current.value}}).then(res => {
				if (res.data?.result?.length > 0) {
					setMessageSearchResults(result => result ? [...result, ...res.data.result] : res.data.result);
				}
			});
		}
	}));
	
	const [showUploadFileConfirmation, setShowUploadFileConfirmation] = useState(false);
	const [isFileUploading, setIsFileUploading] = useState(false);
	const [showFileTypeSelector, setShowFileTypeSelector] = useState(false);
	const [files, setFiles] = useState([]);
	
	const [onEmojiPicker, handleEmojiPicker] = useState(false);
	
	const cursorSelection = useRef([]);
	
	const [onSettings, handleSettings] = useState(false);
	const [settings, setSettings] = useState(settingsVar);
	const settingItems = ["useMarkdown", "allowNotification", "allowPublicNotification", "allowCurrentNotification", "displayNotificationContent"];
	const settingItemsDisplay = ["启用Markdown+", "允许通知", "允许公共频道通知", "允许当前联系人通知", "通知显示消息内容"];
	
	const updateCursorSelection = useCallback(() => {
		cursorSelection.current = [inputField.current.selectionStart, inputField.current.selectionEnd];
	}, [inputField]);
	
	const insertText = useCallback((text, closeDialog) => {
		const start = cursorSelection.current[0], end = cursorSelection.current[1];
		inputField.current.value = inputField.current.value.slice(0, start) + text + inputField.current.value.slice(end);
		flushSync(closeDialog);
		inputField.current.focus();
		inputField.current.setSelectionRange(start + text.length, start + text.length);
	}, [inputField]);
	
	useEffect(() => {
		if (lastMatchedMessageRef.current) {
			messageSearchPageNumberCurrent.current = messageSearchPageNumberNew.current;
			messageSearchObserver.current.disconnect();
			messageSearchObserver.current.observe(lastMatchedMessageRef.current);
		}
	}, [messageSearchResults]);
	
	const MarkdownChecker = memo(function MarkdownChecker() {
		return settings.useMarkdown === false && (
			<Typography color="error">
				您还没有启用Markdown+，是否前往开启？
				<Link onClick={() => handleSettings(true)} sx={{cursor: 'pointer'}}>
					打开设置
				</Link>
			</Typography>
		);
	});
	
	sendFiles.current = useCallback((files) => {
		for (const file of files) {
			if (file.size > 20 * 1024 * 1024) {
				enqueueSnackbar("文件大小不能超过20MB！", {variant: "error"});
				return;
			}
		}
		
		setFiles(files);
		setShowUploadFileConfirmation(true);
	}, []);
	
	const searchMessage = useRef(debounce((key) => {
		const currentTime = Date.now();
		lastMessageSearchTime.current = currentTime;
		
		if (!key || key === "") {
			setMessageSearchResults(null);
			setMessageSearchKeywords("");
		} else {
			axios.get(`/api/chat/message/match/${currentUserVar}/0`, {params: {key: key}}).then(res => {
				if (lastMessageSearchTime.current !== currentTime) {
					return;
				}
				messageSearchPageNumberNew.current = 0;
				messageSearchPageNumberCurrent.current = 0;
				flushSync(() => setMessageSearchResults(res.data.result));
				if (messageSearchResultBodyRef.current) {
					messageSearchResultBodyRef.current.scrollTo({top: 0, behavior: "instant"});
				}
			});
		}
	}, 200));
	
	const closeMessageSearchDialog = () => {
		messageSearchResultBodyScrollTop.current = messageSearchResultBodyRef.current?.scrollTop ?? 0;
		setOnMessageSearching(false);
	};
	
	return (
		<>
			<Box>
				<Tooltip title={"添加表情"}>
					<IconButton
						sx={{m: 0.5}}
						onClick={() => {
							updateCursorSelection();
							handleEmojiPicker(true);
						}}
					>
						<AddReactionOutlined/>
					</IconButton>
				</Tooltip>
				<Tooltip title={"上传文件"}>
					<IconButton
						sx={{m: 0.5}}
						onClick={() => {
							if (isMobile) {
								setShowFileTypeSelector(true);
							} else {
								const input = document.createElement("input");
								input.type = "file";
								input.multiple = true;
								input.onchange = (event) => {
									sendFiles.current(Array.from(event.target.files));
									event.target.value = null;
								}
								input.click();
							}
						}}
					>
						<UploadFileOutlined/>
					</IconButton>
				</Tooltip>
				<Tooltip title={"特殊字体"}>
					<IconButton
						sx={{m: 0.5}}
						onClick={() => {
							updateCursorSelection();
							handleSpecialFont(true);
						}}
					>
						<FontDownloadOutlined/>
					</IconButton>
				</Tooltip>
				<Tooltip title={"搜索聊天记录"}>
					<IconButton
						sx={{m: 0.5}}
						onClick={() => {
							flushSync(() => setOnMessageSearching(true));
							if (lastMatchedMessageRef.current) {
								messageSearchResultBodyRef.current?.scrollTo({top: messageSearchResultBodyScrollTop.current});
								
								[...messageSearchResultBodyRef.current.getElementsByTagName("img"), ...messageSearchResultBodyRef.current.getElementsByTagName("video")].map(element => {
									const resizeObserver = new ResizeObserver(() => {
										messageSearchResultBodyRef.current?.scrollTo({top: messageSearchResultBodyScrollTop.current});
									});
									resizeObserver.observe(element);
								});
								
								messageSearchPageNumberCurrent.current = messageSearchPageNumberNew.current;
								messageSearchObserver.current.disconnect();
								messageSearchObserver.current.observe(lastMatchedMessageRef.current);
							}
						}}
					>
						<Search/>
					</IconButton>
				</Tooltip>
				<Tooltip title={"设置"}>
					<IconButton
						sx={{m: 0.5}}
						onClick={() => {
							updateCursorSelection();
							handleSettings(true);
						}}
					>
						<SettingsOutlined/>
					</IconButton>
				</Tooltip>
			</Box>
			<Dialog open={showFileTypeSelector} onClose={() => setShowFileTypeSelector(false)}>
				<MenuList>
					<MenuItem
						sx={{height: 48}}
						onClick={() => {
							const input = document.createElement("input");
							input.type = "file";
							input.accept = "image/*,video/*";
							input.multiple = true;
							input.onchange = (event) => {
								sendFiles.current(Array.from(event.target.files));
								event.target.value = null;
								setShowFileTypeSelector(false);
							}
							input.click();
						}}
					>
						<ListItemIcon>
							<Filter/>
						</ListItemIcon>
						<ListItemText>上传图片/视频</ListItemText>
					</MenuItem>
					<MenuItem
						sx={{height: 48}}
						onClick={() => {
							const input = document.createElement("input");
							input.type = "file";
							input.multiple = true;
							input.onchange = (event) => {
								sendFiles.current(Array.from(event.target.files));
								event.target.value = null;
								setShowFileTypeSelector(false);
							}
							input.click();
						}}
					>
						<ListItemIcon>
							<UploadFileOutlined/>
						</ListItemIcon>
						<ListItemText>上传文件</ListItemText>
					</MenuItem>
				</MenuList>
			</Dialog>
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
			<Backdrop open={isMessageSearchScrollLoading} sx={{zIndex: 8964}}>
				<CircularProgress size={50}/>
			</Backdrop>
			<Dialog
				open={onMessageSearching}
				onClose={closeMessageSearchDialog}
				fullWidth
				fullScreen={isSmallScreen}
			>
				<Grid container direction="column" justifyContent="space-between" height="100%" minHeight={0} wrap="nowrap">
					<DialogTitle sx={{pb: 1.5}}>
						<Grid container direction="column" gap={1}>
							<Typography variant="h6">
								聊天记录搜索
							</Typography>
							<OutlinedInput
								autoFocus
								inputRef={messageSearchInputRef}
								value={messageSearchKeywords}
								inputProps={{style: {paddingTop: 10, paddingBottom: 10, marginTop: 1}}}
								fullWidth
								placeholder={"消息内容或发送者昵称"}
								startAdornment={
									<InputAdornment position="start">
										<Search/>
									</InputAdornment>
								}
								endAdornment={
									<InputAdornment position="end">
										{messageSearchKeywords && <Cancel
											fontSize="small"
											sx={{cursor: "pointer"}}
											onClick={() => {
												lastMessageSearchTime.current = -1;
												setMessageSearchKeywords("");
												searchMessage.current("");
												setMessageSearchResults(null);
											}}
										/>}
									</InputAdornment>
								}
								onChange={(event) => {
									setMessageSearchKeywords(event.target.value);
									searchMessage.current(event.target.value);
								}}
							/>
						</Grid>
					</DialogTitle>
					{messageSearchResults && messageSearchResults.length > 0 && <Divider/>}
					{messageSearchResults && (
						messageSearchResults.length === 0 ? (
							<Typography align={"center"} color={"textSecondary"} sx={{py: 1}}>
								没有找到相关消息呢……
							</Typography>
						) : (
							<DialogContent ref={messageSearchResultBodyRef} sx={{py: 1}}>
								<List sx={{py: 0}}>
									{messageSearchResults.map((message, messageIndex) => (
										<ListItemButton
											key={message.id}
											ref={messageIndex === messageSearchResults.length - 1 ? lastMatchedMessageRef : null}
											sx={{borderRadius: 1, px: 1}}
											onClick={async () => {
												if (!messagesVar.find(item => item.id === message.id)) {
													toggleMessageSearchScrollLoading.current(true);
													
													let currentMessageList;
													
													do {
														messagePageNumberNew.current = messagePageNumberCurrent.current = messagePageNumberCurrent.current + 1;
														currentMessageList = await axios.get(`/api/chat/message/${currentUserVar}/${messagePageNumberNew.current}`)
															.then(res => res.data.result.message);
														messagesVar = [...currentMessageList, ...messagesVar];
													} while (!currentMessageList.find(item => item.id === message.id));
													
													flushSync(() => setMessages([...messagesVar]));
													
													toggleMessageSearchScrollLoading.current(false);
												}
												
												if (document.getElementById(`message-${message.id}`)) {
													document.getElementById(`message-${message.id}`).scrollIntoView({behavior: "smooth"});
													closeMessageSearchDialog();
												} else {
													enqueueSnackbar("消息不存在", {variant: "error"});
												}
											}}
										>
											<ListItemAvatar sx={{alignSelf: "flex-start", mt: 0.5}}>
												<UserAvatar username={message.username} avatarVersion={message.avatarVersion}/>
											</ListItemAvatar>
											<Grid container direction="column" width="100%">
												<Grid container justifyContent="space-between" wrap="nowrap">
													<UsernameWithBadge
														username={
															message.displayName.split(messageSearchRegex).map((content, index) => {
																if (messageSearchRegex?.test(content)) {
																	return (
																		<Typography key={index} component="span" color="primary" fontSize="inherit"
																		            fontWeight="inherit">
																			{content}
																		</Typography>
																	);
																}
																return content;
															})
														}
														badge={message.badge}
													/>
													<Typography fontSize={13} color="textSecondary">
														{convertDateToLocaleAbsoluteString(message.time)}
													</Typography>
												</Grid>
												<Box fontSize={15} maxWidth="100%" sx={{wordBreak: "break-word"}}>
													{message.type === 1 ? (
														<ChatMarkdown useMarkdown={message.useMarkdown} keyword={messageSearchKeywords}>
															{message.content}
														</ChatMarkdown>
													) : (
														<MessageFile
															url={message.file.url}
															fileName={message.file.fileName}
															fileSize={message.file.fileSize}
															deleted={message.file.deleted}
															disableTouchRipple
														/>
													)}
												</Box>
											</Grid>
										</ListItemButton>
									))}
								</List>
							</DialogContent>
						)
					)}
					{messageSearchResults && messageSearchResults.length > 0 && <Divider/>}
					<DialogActions>
						<Button onClick={closeMessageSearchDialog}>关闭</Button>
					</DialogActions>
				</Grid>
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
			<Dialog open={showUploadFileConfirmation} onClose={() => setShowUploadFileConfirmation(false)}>
				<DialogTitle>要发送这些文件吗？</DialogTitle>
				<DialogContent>
					<Grid container direction="column" gap={1}>
						{files.map((file, index) => (
							<MessageFile key={index} fileName={file.name} fileSize={file.size}/>
						))}
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowUploadFileConfirmation(false)}>
						取消
					</Button>
					<LoadingButton
						loading={isFileUploading}
						onClick={async () => {
							setIsFileUploading(true);
							setQuote(null);
							
							let successCount = 0;
							
							for (const file of files) {
								await axios.post("/api/chat/file/upload", {
									file: file,
									recipient: currentUserVar,
									quoteId: quote?.id,
								}, {
									headers: {
										"Content-Type": "multipart/form-data",
									},
								}).then(res => {
									if (res.data.status === 1) {
										successCount++;
									}
								});
							}
							
							if (successCount !== files.length) {
								enqueueSnackbar(`发送成功 ${successCount} 个，失败 ${files.length - successCount} 个`, {variant: "info"});
							}
							
							setShowUploadFileConfirmation(false);
							setIsFileUploading(false);
						}}
					>
						确认
					</LoadingButton>
				</DialogActions>
			</Dialog>
		</>
	);
});

ChatToolBar.propTypes = {
	inputField: PropTypes.object.isRequired,
	quote: PropTypes.object,
	setQuote: PropTypes.func.isRequired,
	sendFiles: PropTypes.object.isRequired,
	setMessages: PropTypes.func.isRequired,
	messagePageNumberNew: PropTypes.any.isRequired,
	messagePageNumberCurrent: PropTypes.any.isRequired,
}

const ScrollTop = memo(function ScrollTop({children, messageCard}) {
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
	
	const [isDragging, setIsDragging] = useState(false);
	const sendFiles = useRef(null);
	const lastDragEntered = useRef(null);
	
	const messageCard = useRef(null);
	const messageInput = useRef(null);
	const userSearchField = useRef(null);
	
	const disconnectErrorBarKey = useRef(null);
	
	const {setClientUser} = useClientUser();
	
	const messagePageNumberCurrent = useRef(0);
	const messagePageNumberNew = useRef(0);
	const lastMessageRef = useRef(null);
	
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
		messageCard.current?.scrollTo({top: messageCard.current.scrollHeight - bottom, behavior: behavior});
		[...messageCard.current.getElementsByTagName("img"), ...messageCard.current.getElementsByTagName("video")].map(element => {
			const resizeObserver = new ResizeObserver(() => {
				messageCard.current?.scrollTo({top: messageCard.current.scrollHeight - bottom, behavior: behavior});
			});
			resizeObserver.observe(element);
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
			if (res.data.status === 0) {
				navigate("/chat");
				return;
			}
			
			const userItem = usersVar.find(item => item.username === username);
			
			if (userItem) {
				setClientUser(clientUser => ({
					...clientUser,
					newMessageCount: Math.max(0, clientUser.newMessageCount - userItem.newMessageCount),
				}));
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
	}, [messageCardScrollTo, navigate, setClientUser]);
	
	const messageLoadingObserver = useMemo(() => new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting && messagePageNumberNew.current === messagePageNumberCurrent.current) {
			messagePageNumberNew.current = messagePageNumberCurrent.current + 1;
			getMessages(currentUserVar, messagePageNumberNew.current);
		}
	}), [getMessages]);
	
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
			setIsContactsLoading(false);
			
			if (!username || res.data.result.find(item => item.username === username)) {
				usersVar = res.data.result;
				setUsers([...usersVar]);
			} else {
				axios.get(`/api/user/find/0`, {params: {key: username}}).then(currentUserRes => {
					const info = currentUserRes.data.result[0];
					
					usersVar = info.username === username ? [{
						username: username,
						displayName: info.displayName,
						avatarVersion: info.avatarVersion,
						badge: info.badge,
						isOnline: info.isOnline,
						lastMessageText: "\u00A0",
						newMessageCount: 0,
					}, ...res.data.result] : res.data.result;
					
					setUsers([...usersVar]);
				});
			}
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
	}, [getMessages, isContactsLoading, username]);
	
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
		const content = messageInput.current.value.trim();
		
		if (content.length === 0) {
			return;
		}
		
		if (content.length <= 2000) {
			messageInput.current.focus();
			document.execCommand("selectAll");
			document.execCommand("delete");
			setQuote(null);
			
			stomp.send("/app/chat.message", {}, JSON.stringify({
				recipient: currentUserVar,
				content: content,
				quoteId: quote?.id,
				useMarkdown: settingsVar.useMarkdown,
			}));
			
			uploadDraft(currentUserVar, "");
		} else {
			enqueueSnackbar("消息长度不能超过 2000 字", {variant: "error"});
		}
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
		
		if (sender !== myname && !isCurrent) {
			setClientUser(clientUser => ({
				...clientUser,
				newMessageCount: clientUser.newMessageCount + 1,
			}));
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
			type: data.type,
			username: data.sender,
			displayName: data.senderDisplayName,
			avatarVersion: data.senderAvatarVersion,
			badge: data.senderBadge,
			content: data.content,
			file: data.file,
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
			if (messagePageNumberNew.current === 0) {
				getMessages(currentUserVar, 0, true);
			}
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
					data.senderDisplayName + ": " + data.content, data.time, false, data.sender);
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
				item.type = 1;
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
				item.type = 1;
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
			messageLoadingObserver.disconnect();
			messageLoadingObserver.observe(lastMessageRef.current);
		}
	}, [messageLoadingObserver, messages]);
	
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
	
	useLayoutEffect(() => {
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
					borderTop: 0,
				}}
			>
				<OutlinedInput
					inputRef={userSearchField}
					startAdornment={
						<InputAdornment position="start">
							<PersonSearch sx={{fontSize: 22}}/>
						</InputAdornment>
					}
					endAdornment={
						<InputAdornment position="end">
							{Boolean(matchList) && <Cancel
								fontSize="small"
								sx={{cursor: "pointer"}}
								onClick={() => {
									userSearchField.current.value = "";
									setMatchList(null);
								}}
							/>}
						</InputAdornment>
					}
					placeholder="搜索用户"
					sx={{fontSize: 15, mt: "1px"}}
					onFocus={() => {
						if (!matchList)
							setMatchList([]);
					}}
					onBlur={() => {
						if (userSearchField.current.value === "") {
							setMatchList(null);
						}
					}}
					onChange={(event) => {
						if (abortController)
							abortController.abort();
						if (event.target.value === "")
							setMatchList([]);
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
							const regex = new RegExp(`(${userSearchField.current?.value?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "i");
							
							if (!regex.test(user.username) && !regex.test(user.displayName)) {
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
										newMessageCount={user.newMessageCount}
										lastMessageTime={user.lastMessageTime}
										lastMessageText={user.lastMessageText || "\u00A0"}
										draft={user.draft}
										displayNameNode={
											(regex.test(user.displayName) ? user.displayName : "@" + user.username).split(regex).map((content, index) => {
												if (regex?.test(content)) {
													return (
														<Typography key={index} component="span" color="primary" fontSize="inherit"
														            fontWeight="inherit">
															{content}
														</Typography>
													);
												}
												return content;
											})
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
									type={message.type}
									username={message.username}
									displayName={message.displayName}
									avatarVersion={message.avatarVersion}
									badge={message.badge}
									content={message.content}
									file={message.file}
									quote={message.quote}
									setQuote={setQuote}
									useMarkdown={message.useMarkdown}
									setMessages={setMessages}
									messagePageNumberCurrent={messagePageNumberCurrent}
									messagePageNumberNew={messagePageNumberNew}
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
					<Card variant="outlined" sx={{maxWidth: "100%", borderTop: 0}}>
						<TextField
							inputRef={messageInput}
							placeholder="Message"
							multiline
							fullWidth
							maxRows={10}
							slotProps={{input: {style: {padding: 10, marginTop: 1}}}}
							sx={{
								borderRadius: "8px",
								backgroundColor: isDragging ? (theme) => theme.palette.divider : "normal",
							}}
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
							onDragEnter={(event) => {
								lastDragEntered.current = event.target;
								setIsDragging(true);
							}}
							onDragLeave={(event) => {
								if (event.target === lastDragEntered.current) {
									setIsDragging(false);
								}
							}}
							onDragOver={(event) => {
								event.preventDefault();
							}}
							onDrop={(event) => {
								event.preventDefault();
								setIsDragging(false);
								if (sendFiles.current) {
									const files = [];
									
									for (const item of event.dataTransfer.items) {
										if (item.webkitGetAsEntry().isFile) {
											files.push(item.getAsFile());
										}
									}
									
									sendFiles.current(files);
								}
							}}
						/>
						<Grid container justifyContent="space-between">
							<ChatToolBar
								inputField={messageInput}
								quote={quote}
								setQuote={setQuote}
								sendFiles={sendFiles}
								setMessages={setMessages}
								messagePageNumberNew={messagePageNumberNew}
								messagePageNumberCurrent={messagePageNumberCurrent}
							/>
							<Button variant="contained" startIcon={<Send/>} sx={{my: "auto", mr: 0.75}} onClick={sendMessage}>发送</Button>
						</Grid>
					</Card>
				</Box>}
			</Grid>
		</Grid>
	);
}