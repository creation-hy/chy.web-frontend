import {Fragment, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import axios from "axios";
import {
	Backdrop,
	Badge,
	ButtonBase,
	CircularProgress,
	Collapse,
	Fab,
	List,
	ListItemAvatar,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	MenuList,
	Paper,
	Skeleton,
	Switch,
	Tooltip,
	useMediaQuery,
	Zoom
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import PropTypes from "prop-types";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography"
import {
	AddReactionOutlined,
	ArrowBack,
	ArrowDownward,
	Block,
	BrokenImageOutlined,
	Cancel,
	Close,
	CloudDownload,
	ContentCopyOutlined,
	DeleteOutline,
	FileDownloadOutlined,
	Filter,
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
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {closeSnackbar, enqueueSnackbar} from "notistack";
import Chip from "@mui/material/Chip";
import DialogTitle from "@mui/material/DialogTitle";
import Picker from "@emoji-mart/react";
import {useBinaryColorMode} from "src/components/ColorMode.jsx";
import {ChatMarkdown} from "src/components/ChatMarkdown.jsx";
import {useLocation, useNavigate, useParams} from "react-router";
import {useClientUser} from "src/components/ClientUser.jsx";
import {convertDateToLocaleAbsoluteString, convertDateToLocaleShortString} from "src/assets/DateUtils.jsx";
import {debounce, throttle} from "lodash";
import {UserAvatar, UsernameWithBadge} from "src/components/UserComponents.jsx";
import {NavigateIconButton, NavigateListItemButton} from "src/components/NavigateComponents.jsx";
import {isIOS13, isMobile} from "react-device-detect";
import {keepPreviousData, useInfiniteQuery, useQueryClient} from "@tanstack/react-query";
import {LoadMoreIndicator} from "src/components/LoadMoreIndicator.jsx";
import {AnimatePresence, motion} from "framer-motion";

const myname = localStorage.getItem("username");

let currentUserVar = null, settingsVar = JSON.parse(localStorage.getItem("chatSettings")) || {useMarkdown: false};
let usersVar = [], messagesVar = [];
let lastMessageScrollBottom = 0, enableScrollAnimation = false;
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
	                                        username,
	                                        displayName,
	                                        displayNameString,
	                                        avatarVersion,
	                                        badge,
	                                        isOnline,
	                                        newMessageCount,
	                                        lastMessageTime,
	                                        lastMessageText,
	                                        draft,
	                                        selected,
	                                        isMessageAllowed,
                                        }) {
	return (
		<ButtonBase
			sx={{width: "100%"}}
			onClick={() => {
				lastMessageScrollBottom = -1;
			}}
		>
			<NavigateListItemButton
				href={`/chat/${username}`}
				selected={selected}
			>
				<ListItemAvatar>
					<Badge
						badgeContent={newMessageCount}
						overlap="circular"
						color="error"
					>
						{isMessageAllowed ? (
							<Badge
								badgeContent={isOnline === true ? " " : 0}
								overlap="circular"
								color="success"
								variant="dot"
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
								<UserAvatar username={username} displayName={displayNameString} avatarVersion={avatarVersion}/>
							</Badge>
						) : (
							<Badge
								badgeContent={<Block fontSize="small"/>}
								overlap="circular"
								color="error"
								anchorOrigin={{vertical: "bottom", horizontal: "right"}}
								sx={{
									'& .MuiBadge-badge': {
										width: 20,
										height: 20,
										borderRadius: "50%",
									}
								}}
							>
								<UserAvatar username={username} displayName={displayNameString} avatarVersion={avatarVersion}/>
							</Badge>
						)}
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
								username={displayName}
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
			</NavigateListItemButton>
		</ButtonBase>
	);
});

UserItem.propTypes = {
	username: PropTypes.string.isRequired,
	displayName: PropTypes.node,
	displayNameString: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
	badge: PropTypes.string,
	isOnline: PropTypes.bool,
	newMessageCount: PropTypes.number,
	lastMessageTime: PropTypes.string,
	lastMessageText: PropTypes.string,
	draft: PropTypes.string,
	selected: PropTypes.bool.isRequired,
	isMessageAllowed: PropTypes.bool.isRequired,
}

export const MessageFile = memo(function MessageFile({url, fileName, fileSize, fileWidth, fileHeight, deleted, disableMediaEvent, ...props}) {
	const [showBrokenDialog, setShowBrokenDialog] = useState(false);
	
	const [showImagePreview, setShowImagePreview] = useState(false);
	
	const [loaded, setLoaded] = useState(false);
	
	const [width, setWidth] = useState(fileWidth);
	const [height, setHeight] = useState(fileHeight);
	
	const containerRef = useRef(null);
	
	useLayoutEffect(() => {
		const maxSize = 300;
		let width = fileWidth;
		let height = fileHeight;
		
		if (fileWidth && fileHeight && fileWidth > maxSize) {
			width = maxSize;
			height = fileHeight / fileWidth * maxSize;
		}
		
		const updateScale = () => {
			if (containerRef.current && width && height) {
				const containerWidth = containerRef.current.offsetWidth;
				const scale = containerWidth / width;
				
				if (scale < 1) {
					width *= scale;
					height *= scale;
				}
				
				setWidth(width);
				setHeight(Math.min(height, 800));
			}
		};
		
		window.addEventListener("resize", updateScale);
		updateScale();
		
		return () => window.removeEventListener("resize", updateScale);
	}, [fileHeight, fileWidth]);
	
	if (/\.(jpg|jpeg|jfif|pjepg|pjp|png|webp|gif|bmp|ico)$/i.test(fileName) && deleted === false) {
		return (
			<Grid
				container
				ref={containerRef}
				direction="column"
				sx={{
					flex: 1,
					width: "100%",
					alignItems: "inherit",
				}}
			>
				{!loaded && (
					<Skeleton
						variant="rectangular"
						width={width}
						height={height}
						sx={{borderRadius: 0.5}}
					/>
				)}
				<ButtonBase
					sx={{
						display: "grid",
						alignItems: "stretch",
						visibility: loaded ? "visible" : "hidden",
						height: loaded ? undefined : 0,
						width: loaded ? width : undefined,
						borderRadius: 0.5,
					}}
					onClick={disableMediaEvent ? undefined : () => {
						setShowImagePreview(true);
					}}
					disableRipple={disableMediaEvent}
				>
					<img
						src={url}
						alt={fileName}
						width={width}
						height={loaded ? height : 0}
						style={{
							maxWidth: width ? undefined : "min(100%, 300px)",
							maxHeight: height ? undefined : "800px",
							objectFit: width && height ? "cover" : "contain",
							borderRadius: 4,
						}}
						onLoad={() => setLoaded(true)}
						{...props}
					/>
				</ButtonBase>
				<Dialog
					open={showImagePreview}
					onClose={() => setShowImagePreview(false)}
					fullScreen
				>
					<Grid container direction="column" sx={{width: "100%", height: "100%"}} wrap="nowrap">
						<Box
							sx={{
								flex: 1,
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								overflow: "hidden",
								position: "relative",
							}}
						>
							<img
								src={url}
								alt="Image preview"
								style={{
									width: "100%",
									height: "100%",
									objectFit: "contain",
								}}
							/>
							<IconButton
								onClick={() => setShowImagePreview(false)}
								style={{
									position: "absolute",
									top: 10,
									right: 10,
									color: "white",
									backgroundColor: "rgba(0, 0, 0, 0.5)",
								}}
							>
								<Close/>
							</IconButton>
							<Grid
								container
								gap={1}
								sx={{
									position: "absolute",
									bottom: 10,
									right: 10,
								}}
							>
								<Tooltip title="下载图片">
									<IconButton
										onClick={() => {
											const a = document.createElement('a');
											a.href = url;
											a.download = fileName;
											document.body.appendChild(a);
											a.click();
											document.body.removeChild(a);
										}}
										style={{
											color: "white",
											backgroundColor: "rgba(0, 0, 0, 0.5)",
										}}
									>
										<FileDownloadOutlined/>
									</IconButton>
								</Tooltip>
							</Grid>
						</Box>
					</Grid>
				</Dialog>
			</Grid>
		);
	}
	
	if (/\.(mp4|webm)$/i.test(fileName) && deleted === false) {
		return (
			<Grid
				container
				ref={containerRef}
				direction="column"
				sx={{
					flex: 1,
					width: "100%",
					alignItems: "inherit",
				}}
			>
				{!loaded && (
					<Skeleton
						variant="rectangular"
						width={width}
						height={height}
						sx={{borderRadius: 0.5}}
					/>
				)}
				<Box
					sx={{
						display: "grid",
						alignItems: "stretch",
						visibility: loaded ? "visible" : "hidden",
						height: loaded ? undefined : 0,
						width: loaded ? width : undefined,
						borderRadius: 0.5,
					}}
				>
					<video
						src={url}
						controls={loaded}
						width={width}
						height={loaded ? height : 0}
						style={{
							maxWidth: width ? undefined : "min(100%, 300px)",
							maxHeight: height ? undefined : "800px",
							objectFit: "cover",
							borderRadius: 4,
							visibility: loaded ? "visible" : "hidden",
						}}
						onLoadedData={() => setLoaded(true)}
						{...props}
					/>
				</Box>
			</Grid>
		);
	}
	
	if (/\.(mp3|wav|aac|flac)$/i.test(fileName) && deleted === false) {
		return (
			<audio
				src={url}
				controls
				style={{maxWidth: "100%"}}
				{...props}
			/>
		);
	}
	
	return (
		<Paper variant="outlined" sx={{maxWidth: "100%"}} {...props}>
			<ListItemButton
				disableTouchRipple={disableMediaEvent}
				sx={{borderRadius: "8px"}}
				onClick={disableMediaEvent ? undefined : () => {
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
	fileWidth: PropTypes.number,
	fileHeight: PropTypes.number,
	deleted: PropTypes.bool,
	disableMediaEvent: PropTypes.bool,
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
	                                      messageData
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
		<Grid
			container
			justifyContent={isMe ? "flex-end" : "flex-start"}
			alignItems="flex-start"
			sx={{my: 1}}
			id={"message-" + messageId}
		>
			<Backdrop open={isMessageSearchScrollLoading} sx={{zIndex: 8964}}>
				<CircularProgress size={50}/>
			</Backdrop>
			{!isMe && <NavigateIconButton sx={{mr: 1, p: 0}} href={`/user/${username}`}>
				<UserAvatar username={username} displayName={displayName} avatarVersion={avatarVersion}/>
			</NavigateIconButton>}
			<Grid container direction="column" sx={{maxWidth: "75%", flex: 1}} alignItems={isMe ? "flex-end" : "flex-start"}>
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
							<ChatMarkdown useMarkdown={useMarkdown} fontColor={isMe ? "white" : "normal"}>
								{content}
							</ChatMarkdown>
						</Box>
					</Paper>
				) : (
					<MessageFile
						url={file.url}
						fileName={file.fileName}
						fileSize={file.fileSize}
						fileWidth={file.fileWidth}
						fileHeight={file.fileHeight}
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
						sx={{mt: 0.75}}
						onClick={async () => {
							if (!messagesVar.find(item => item.id === quote.id)) {
								toggleMessageSearchScrollLoading.current(true);
								
								while (true) {
									const data = (await messageData.fetchNextPage()).data.pages.map(page => page.message).flat();
									if (data.find(item => item.id === quote.id)) {
										break;
									}
								}
								
								toggleMessageSearchScrollLoading.current(false);
							}
							
							setTimeout(() => {
								if (document.getElementById(`message-${quote.id}`)) {
									document.getElementById(`message-${quote.id}`).scrollIntoView({behavior: "smooth"});
								} else {
									enqueueSnackbar("消息不存在", {variant: "error"});
								}
							}, 50);
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
							fileWidth={file.fileWidth}
							fileHeight={file.fileHeight}
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
	messageData: PropTypes.object.isRequired,
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

const ChatToolBar = memo(function ChatToolBar({
	                                              inputField,
	                                              setInputValue,
	                                              setUsers,
	                                              quote,
	                                              setQuote,
	                                              sendFiles,
	                                              messageData,
	                                              currentUser
                                              }) {
	const [binaryColorMode] = useBinaryColorMode();
	const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("md"));
	
	const [onMessageSearching, setOnMessageSearching] = useState(false);
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
	
	const {data, fetchNextPage, isFetching, isFetched, hasNextPage} = useInfiniteQuery({
		queryKey: ["chat", "message", "match", currentUser, messageSearchKeywords],
		queryFn: ({pageParam}) => !currentUser ? [] : axios.get(`/api/chat/message/match/${currentUser}/${pageParam}`,
			{params: {key: messageSearchKeywords}}).then(res => res.data?.result ?? []),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages, lastPageParam) => lastPage.length === 0 ? undefined : lastPageParam + 1,
	});
	
	const loadMoreRef = useRef(null);
	
	useEffect(() => {
		const pageLoadingObserver = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !isFetching && hasNextPage) {
				fetchNextPage();
			}
		}, {
			rootMargin: "200px",
		});
		
		setTimeout(() => {
			if (loadMoreRef.current) {
				pageLoadingObserver.observe(loadMoreRef.current);
			}
		}, 0);
		
		return () => pageLoadingObserver.disconnect();
	}, [fetchNextPage, hasNextPage, isFetching, onMessageSearching]);
	
	const [showUploadFileConfirmation, setShowUploadFileConfirmation] = useState(false);
	const [isFileUploading, setIsFileUploading] = useState(false);
	const [showFileTypeSelector, setShowFileTypeSelector] = useState(false);
	const [files, setFiles] = useState([]);
	
	const [onEmojiPicker, handleEmojiPicker] = useState(false);
	
	const cursorSelection = useRef([]);
	
	const [onSettings, handleSettings] = useState(false);
	const [settings, setSettings] = useState(settingsVar);
	
	const updateCursorSelection = useCallback(() => {
		cursorSelection.current = [inputField.current.selectionStart, inputField.current.selectionEnd];
	}, [inputField]);
	
	const insertText = useCallback((text, closeDialog) => {
		const start = cursorSelection.current[0], end = cursorSelection.current[1];
		flushSync(() => {
			setInputValue(value => {
				value = value.slice(0, start) + text + value.slice(end);
				saveDraft(currentUserVar, value, setUsers);
				return value;
			});
			closeDialog();
		});
		inputField.current.focus();
		inputField.current.setSelectionRange(start + text.length, start + text.length);
	}, [inputField, setInputValue, setUsers]);
	
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
	
	const closeMessageSearchDialog = () => {
		messageSearchResultBodyScrollTop.current = messageSearchResultBodyRef.current?.scrollTop ?? 0;
		setOnMessageSearching(false);
	};
	
	useLayoutEffect(() => {
		setMessageSearchKeywords("");
		messageSearchResultBodyScrollTop.current = 0;
	}, [currentUser]);
	
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
				<Tooltip title={"搜索聊天记录"}>
					<IconButton
						sx={{m: 0.5}}
						onClick={() => {
							flushSync(() => setOnMessageSearching(true));
							if (messageSearchResultBodyRef.current) {
								messageSearchResultBodyRef.current.scrollTo({top: messageSearchResultBodyScrollTop.current});
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
								inputProps={{style: {paddingTop: 10, paddingBottom: 10}}}
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
											}}
										/>}
									</InputAdornment>
								}
								onChange={(event) => {
									setMessageSearchKeywords(event.target.value);
								}}
							/>
						</Grid>
					</DialogTitle>
					{(isFetched ? (
						data.pages.flat().length === 0 ? (
							<Typography align={"center"} color={"textSecondary"} sx={{py: 2}}>
								没有找到相关消息呢……
							</Typography>
						) : (
							<>
								<Divider/>
								<DialogContent ref={messageSearchResultBodyRef} sx={{py: 1}}>
									<List sx={{py: 0}}>
										{data.pages.map(page => page.map(message => (
											<ListItemButton
												key={message.id}
												sx={{borderRadius: 1, px: 1}}
												onClick={async () => {
													if (!messagesVar.find(item => item.id === message.id)) {
														toggleMessageSearchScrollLoading.current(true);
														
														while (true) {
															const data = (await messageData.fetchNextPage()).data.pages.map(page => page.message).flat();
															if (data.find(item => item.id === message.id)) {
																break;
															}
														}
														
														toggleMessageSearchScrollLoading.current(false);
													}
													
													setTimeout(() => {
														if (document.getElementById(`message-${message.id}`)) {
															document.getElementById(`message-${message.id}`).scrollIntoView({behavior: "smooth"});
															closeMessageSearchDialog();
														} else {
															enqueueSnackbar("消息不存在", {variant: "error"});
														}
													}, 50);
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
																fileWidth={message.file.fileWidth}
																fileHeight={message.file.fileHeight}
																deleted={message.file.deleted}
																disableMediaEvent
															/>
														)}
													</Box>
												</Grid>
											</ListItemButton>
										)))}
									</List>
									<Box ref={loadMoreRef} sx={{mt: 1}}>
										<LoadMoreIndicator isFetching={isFetching}/>
									</Box>
								</DialogContent>
								<Divider/>
							</>
						)
					) : (
						<LoadMoreIndicator isFetching={true} sx={{mt: 2, mb: 2}}/>
					))}
					<DialogActions>
						<Button onClick={closeMessageSearchDialog}>关闭</Button>
					</DialogActions>
				</Grid>
			</Dialog>
			<Dialog
				open={onEmojiPicker}
				onClose={() => handleEmojiPicker(false)}
				slotProps={{paper: {sx: {borderRadius: "10px", margin: 0}}}}
			>
				<Picker
					theme={binaryColorMode}
					locale="zh"
					onEmojiSelect={(emoji) => {
						insertText(emoji.native, () => handleEmojiPicker(false));
					}}
				/>
			</Dialog>
			<Dialog open={onSettings} onClose={() => handleSettings(false)} fullWidth maxWidth="xs">
				<DialogTitle>
					设置
				</DialogTitle>
				<Card variant="outlined" sx={{mx: 3, mb: 2, px: 1}}>
					<Grid container alignItems="center" justifyContent="space-between" sx={{p: 1}} wrap="nowrap">
						<Typography>
							启用Markdown+
						</Typography>
						<Switch
							checked={settings["useMarkdown"] !== false}
							onChange={(event) => {
								const newSettings = {...settings, useMarkdown: event.target.checked};
								setSettings(newSettings);
								settingsVar = newSettings;
								localStorage.setItem("chatSettings", JSON.stringify(newSettings));
							}}
						/>
					</Grid>
				</Card>
				<DialogActions>
					<Button onClick={() => handleSettings(false)}>关闭</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={showUploadFileConfirmation} onClose={() => setShowUploadFileConfirmation(false)}>
				<DialogTitle>要发送这些文件吗？</DialogTitle>
				<DialogContent>
					<Grid container direction="column" gap={1}>
						{files.map((file, index) => (
							<MessageFile
								key={index}
								url={URL.createObjectURL(file)}
								fileName={file.name}
								fileSize={file.size}
								deleted={false}
							/>
						))}
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowUploadFileConfirmation(false)}>
						取消
					</Button>
					<Button
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
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
});

ChatToolBar.propTypes = {
	inputField: PropTypes.object.isRequired,
	setInputValue: PropTypes.func.isRequired,
	setUsers: PropTypes.func.isRequired,
	quote: PropTypes.object,
	setQuote: PropTypes.func.isRequired,
	sendFiles: PropTypes.object.isRequired,
	messageData: PropTypes.object.isRequired,
	currentUser: PropTypes.string,
}

const ScrollTop = memo(function ScrollTop({children, messageCard}) {
	const [trigger, setTrigger] = useState(false);
	const [top, setTop] = useState(0);
	const [left, setLeft] = useState(0);
	
	useEffect(() => {
		const card = messageCard.current;
		
		const updateTrigger = () => {
			setTrigger(card.scrollTop + card.clientHeight + 100 <= card.scrollHeight);
		}
		
		card.addEventListener("scroll", updateTrigger);
		
		const observer = new ResizeObserver(() => {
			if (card) {
				setTop(card.clientHeight + card.offsetTop - 50);
				setLeft(card.clientWidth / 2 + card.offsetLeft - 25);
			}
		});
		
		observer.observe(card);
		updateTrigger();
		
		return () => {
			card.removeEventListener("scroll", updateTrigger);
			observer.disconnect();
		}
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

export const ChatNotificationClient = memo(function ChatNotificationClient() {
	const socket = useRef(null);
	
	const stomp = useRef(null);
	
	const firstLevelLocation = useLocation().pathname.split("/")[1];
	const {setClientUser} = useClientUser();
	
	const updateClientUser = useRef((offset) => {
		setClientUser(clientUser => ({
			...clientUser,
			newMessageCount: clientUser.newMessageCount + offset,
		}));
	});
	
	const stompOnConnect = useRef(() => {
		stomp.current.subscribe(`/user/queue/chat.message`, (message) => {
			settingsVar = JSON.parse(localStorage.getItem("chatSettings")) || {useMarkdown: false};
			
			const data = JSON.parse(message.body);
			
			if (data.sender !== myname) {
				updateClientUser.current(1);
				
				if (settingsVar["allowNotification"] !== false) {
					notify("[私聊] " + data.sender + "说：",
						settingsVar["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender, data.senderAvatarVersion);
				}
			}
		}, {"auto-delete": true});
		
		stomp.current.subscribe("/topic/chat.group.public.message", (message) => {
			settingsVar = JSON.parse(localStorage.getItem("chatSettings")) || {useMarkdown: false};
			
			const data = JSON.parse(message.body);
			
			if (data.sender !== myname) {
				updateClientUser.current(1);
				
				if (settingsVar["allowNotification"] !== false && settingsVar["allowPublicNotification"] !== false) {
					notify("[公共] " + data.sender + "说：",
						settingsVar["displayNotificationContent"] === false ? "由于权限被关闭，无法显示消息内容" : data.content, data.sender, data.senderAvatarVersion);
				}
			}
		});
	});
	
	useEffect(() => {
		const stompConnect = () => {
			if (firstLevelLocation === "" || firstLevelLocation === "chat") {
				return;
			}
			
			socket.current = new SockJS(window.location.origin + "/api/websocket");
			socket.onclose = stompReconnect;
			
			stomp.current = Stomp.over(() => socket.current);
			stomp.current.heartbeat.incoming = 10000;
			stomp.current.heartbeat.outgoing = 10000;
			
			if (myname) {
				stomp.current.connect({
					Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
				}, stompOnConnect.current, null, stompReconnect);
			}
		};
		
		const stompReconnect = async () => {
			setTimeout(stompConnect, 1000);
		};
		
		const inChat = firstLevelLocation === "" || firstLevelLocation === "chat";
		
		if (!stomp.current && !inChat) {
			stompConnect();
		} else if (stomp.current && inChat) {
			stomp.current.onWebSocketClose = () => {
			};
			stomp.current.disconnect(() => stomp.current = null);
		}
	}, [firstLevelLocation]);
	
	return null;
});

const PAGE_SIZE = 20;

export default function Chat() {
	const {username} = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
	
	const initialUsername = useRef(username);
	
	const [users, setUsersState] = useState(null);
	const [currentUser, setCurrentUser] = useState(null);
	const [currentUserDisplayName, setCurrentUserDisplayName] = useState(null);
	const [currentUserBadge, setCurrentUserBadge] = useState(null);
	const [isCurrentUserMessageAllowed, setCurrentUserMessageAllowed] = useState(true);
	const [showMessageBlockAlert, setShowMessageBlockAlert] = useState(false);
	
	const [messages, setMessagesState] = useState([]);
	
	const [lastOnline, setLastOnline] = useState("");
	const [quote, setQuote] = useState(null);
	const [showScrollTop, setShowScrollTop] = useState(true);
	
	const [isDragging, setIsDragging] = useState(false);
	const sendFiles = useRef(null);
	const lastDragEntered = useRef(null);
	
	const messageCard = useRef(null);
	const messageInput = useRef(null);
	const [inputValue, setInputValue] = useState("");
	
	const [onUserSearching, setOnUserSearching] = useState(false);
	const [userSearchKey, setUserSearchKey] = useState("");
	
	const disconnectErrorBarKey = useRef(null);
	
	const {setClientUser} = useClientUser();
	
	const setUsers = useCallback((param) => {
		setUsersState(users => {
			const newUsers = param instanceof Function ? param(users) : param;
			const tmp = newUsers instanceof Array ? [...newUsers] : newUsers;
			const pages = [];
			
			while (tmp?.length > PAGE_SIZE) {
				pages.push(tmp.splice(0, PAGE_SIZE));
			}
			
			if (tmp?.length > 0) {
				if (pages.length > 0) {
					pages[0] = pages[0].concat(tmp);
				} else {
					pages.push(tmp);
				}
			}
			
			queryClient.setQueryData(["chat", "contacts", initialUsername.current], data => ({
				pages: pages,
				pageParams: data?.pageParams,
			}));
			
			return newUsers;
		});
	}, [queryClient]);
	
	const contactsData = useInfiniteQuery({
		queryKey: ["chat", "contacts", initialUsername],
		queryFn: ({pageParam}) => axios.get(`/api/chat/contacts/${pageParam}`,
			{params: {extraContactName: initialUsername.current}}).then(res => res.data?.result ?? []),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages, lastPageParam) => lastPage.length === 0 ? undefined : lastPageParam + 1,
	});
	
	const contactsLoadMoreRef = useRef(null);
	
	useEffect(() => {
		const pageLoadingObserver = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !contactsData.isFetching && contactsData.hasNextPage) {
				contactsData.fetchNextPage();
			}
		}, {
			rootMargin: "200px",
		});
		if (contactsLoadMoreRef.current) {
			pageLoadingObserver.observe(contactsLoadMoreRef.current);
		}
		return () => pageLoadingObserver.disconnect();
	}, [contactsData, contactsData.fetchNextPage, contactsData.hasNextPage, contactsData.isFetching]);
	
	useLayoutEffect(() => {
		usersVar = contactsData.data?.pages?.flat();
		setUsers(usersVar ? [...usersVar] : null);
	}, [contactsData.data?.pages, setUsers]);
	
	const userFindData = useInfiniteQuery({
		queryKey: ["user", "find", userSearchKey],
		queryFn: ({pageParam}) => userSearchKey === "" ? [] : axios.get(`/api/user/find/${pageParam}`,
			{params: {key: userSearchKey}}).then(res => res.data?.result ?? []),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages, lastPageParam) => lastPage.length === 0 ? undefined : lastPageParam + 1,
		placeholderData: keepPreviousData,
	});
	
	const userFindLoadMoreRef = useRef(null);
	
	useEffect(() => {
		const pageLoadingObserver = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !userFindData.isFetching && userFindData.hasNextPage) {
				userFindData.fetchNextPage();
			}
		}, {
			rootMargin: "200px",
		});
		if (userFindLoadMoreRef.current) {
			pageLoadingObserver.observe(userFindLoadMoreRef.current);
		}
		return () => pageLoadingObserver.disconnect();
	}, [userFindData, userFindData.fetchNextPage, userFindData.hasNextPage, userFindData.isFetching]);
	
	const messageCardScrollTo = useCallback((bottom, behavior) => {
		messageCard.current?.scrollTo({top: messageCard.current.scrollHeight - bottom, behavior: behavior});
	}, []);
	
	const messageQueryFn = useCallback(({pageParam}) => {
		return !currentUser ? [] : axios.get(`/api/chat/message/${currentUser}/${pageParam}`).then(res => {
			if (res.data.status === 0) {
				navigate("/chat");
				return {};
			}
			return res.data?.result ?? {};
		});
	}, [navigate, currentUser]);
	
	const messageData = useInfiniteQuery({
		queryKey: ["chat", "message", currentUser],
		queryFn: messageQueryFn,
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages, lastPageParam) => !lastPage.message || lastPage.message.length === 0 ? undefined : lastPageParam + 1,
		staleTime: Infinity,
		refetchOnMount: "always",
		select: data => ({
			pages: [...data.pages].reverse(),
			pageParams: [...data.pageParams].reverse(),
		}),
	});
	
	const messageLoadMoreRef = useRef(null);
	
	useEffect(() => {
		const pageLoadingObserver = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !messageData.isFetching && messageData.hasNextPage) {
				messageData.fetchNextPage();
			}
		}, {
			rootMargin: "200px",
		});
		if (messageLoadMoreRef.current) {
			pageLoadingObserver.observe(messageLoadMoreRef.current);
		}
		return () => pageLoadingObserver.disconnect();
	}, [messageData, messageData.fetchNextPage, messageData.hasNextPage, messageData.isFetching]);
	
	const setMessages = useCallback((param) => {
		setMessagesState(messages => {
			const newMessages = param instanceof Function ? param(messages) : param;
			const tmp = newMessages instanceof Array ? [...newMessages] : newMessages;
			const pages = [];
			
			if (tmp?.length % 30 > 0) {
				pages.push(tmp.splice(0, tmp.length % 30));
			}
			
			while (tmp?.length >= 30) {
				pages.push(tmp.splice(0, 30));
			}
			
			if (pages.length > 0) {
				queryClient.setQueryData(["chat", "message", currentUserVar], data => ({
					pages: pages.map(page => ({
						message: page,
						userInfo: data?.pages.at(-1).userInfo,
					})),
					pageParams: data?.pageParams,
				}));
			}
			
			return newMessages;
		});
	}, [queryClient]);
	
	useEffect(() => {
		if (!messageData.data || messageData.data.pages.flat().length === 0) {
			messagesVar = [];
			setMessagesState([]);
			return;
		}
		
		const data = messageData.data;
		
		const userInfo = data.pages[data.pages.length - 1]?.userInfo;
		
		if (userInfo && data.pages.length === 1) {
			setCurrentUserMessageAllowed(userInfo.isMessageAllowed);
			
			setClientUser(clientUser => ({
				...clientUser,
				newMessageCount: clientUser ? Math.max(0, clientUser.newMessageCount - userInfo.newMessageCount) : 0,
			}));
			
			setUsers(users => {
				usersVar = users?.map(user => user.username !== userInfo.username ? user : {
					...user,
					newMessageCount: 0,
				});
				
				return usersVar;
			});
		}
		
		setShowScrollTop(true);
		
		if (userInfo) {
			flushSync(() => {
				setCurrentUserDisplayName(userInfo.displayName);
				setCurrentUserBadge(userInfo.badge);
				setCurrentUserMessageAllowed(userInfo.isMessageAllowed);
				
				setUsers(users => {
					usersVar = users?.map(user => user.username !== userInfo.username ? user : {
						...user,
						displayName: userInfo.displayName,
						badge: userInfo.badge,
						isMessageAllowed: userInfo.isMessageAllowed,
					});
					return usersVar;
				});
			});
		}
		
		messagesVar = data.pages.map(page => page.message).flat();
		flushSync(() => setMessagesState([...messagesVar]));
		
		requestAnimationFrame(() => {
			lastMessageScrollBottom = Math.max(0, lastMessageScrollBottom);
			messageCardScrollTo(lastMessageScrollBottom, enableScrollAnimation ? "smooth" : "instant");
			enableScrollAnimation = false;
		});
	}, [messageCardScrollTo, messageData.data, messageData.data?.pages, setClientUser, setUsers]);
	
	const getMessages = useCallback((username, doRefresh = false) => {
		if (!username || currentUserVar === username && !doRefresh)
			return;
		
		const isCurrentUser = currentUserVar === username;
		
		const userItem = usersVar?.find(item => item.username === username) ??
			userFindData.data?.pages.flat().find(item => item.username === username);
		
		if (userItem) {
			setCurrentUserDisplayName(userItem.displayName);
			setLastOnline(userItem.isOnline || username === myname ? "在线" : (
				userItem.lastOnline ? "上次上线：" + convertDateToLocaleShortString(userItem.lastOnline) : "从未上线"));
			setCurrentUserBadge(userItem.badge);
			setCurrentUserMessageAllowed(userItem.isMessageAllowed);
			setInputValue(userItem.draft ? userItem.draft : "");
		}
		
		if (!isCurrentUser) {
			if (messageInput.current) {
				uploadDraft(currentUserVar, messageInput.current.value);
			}
			flushSync(() => setShowScrollTop(false));
			currentUserVar = username;
			setCurrentUser(username);
			setQuote(null);
		}
		
		try {
			Notification.requestPermission();
		} catch (e) {
			console.log("你的浏览器不支持通知，人家也没办法呀……", e);
		}
	}, [userFindData.data?.pages]);
	
	useLayoutEffect(() => {
		if (!contactsData.isLoading) {
			currentUserVar = null;
			setCurrentUser(null);
			if (username) {
				getMessages(username, true);
			}
		}
	}, [getMessages, contactsData.isLoading, username]);
	
	useEffect(() => {
		return () => {
			if (document.getElementById("app-bar")) {
				document.getElementById("app-bar").style.display = "flex";
			}
			if (stomp) {
				stomp.onWebSocketClose = () => {
				};
				stomp.disconnect(() => stomp = null);
				
				if (disconnectErrorBarKey.current) {
					closeSnackbar(disconnectErrorBarKey.current);
				}
			}
		}
	}, []);
	
	const sendMessage = useCallback(() => {
		const content = messageInput.current.value.trim();
		
		if (!isCurrentUserMessageAllowed) {
			setShowMessageBlockAlert(true);
			return;
		}
		
		if (content.length === 0) {
			return;
		}
		
		if (content.length <= 2000) {
			flushSync(() => setInputValue(""));
			saveDraft(currentUserVar, "", setUsers);
			
			if (document.activeElement === messageInput.current) {
				messageInput.current.focus();
			}
			
			setQuote(null);
			
			stomp.send("/app/chat.message", {}, JSON.stringify({
				recipient: currentUserVar,
				content: content,
				quoteId: quote?.id,
				useMarkdown: settingsVar.useMarkdown,
			}));
		} else {
			enqueueSnackbar("消息长度不能超过 2000 字", {variant: "error"});
		}
	}, [isCurrentUserMessageAllowed, setUsers, quote?.id]);
	
	const updateUserItem = useCallback((username, displayName, avatarVersion, badge, content, time, isCurrent, sender) => {
		const userItem = usersVar?.find(item => item.username === username);
		
		if (userItem) {
			userItem.lastMessageText = content;
			userItem.lastMessageTime = time;
			if (sender !== myname && !isCurrent)
				userItem.newMessageCount++;
			userItem.avatarVersion = avatarVersion;
			if (usersVar) {
				usersVar = [userItem, ...usersVar.filter(item => item.username !== username)];
			}
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
					isMessageAllowed: res.data.result[0].isMessageAllowed,
				}, ...usersVar];
				setUsers([...usersVar]);
			});
		}
		
		if (sender !== myname && !isCurrent) {
			setClientUser(clientUser => ({
				...clientUser,
				newMessageCount: clientUser ? clientUser.newMessageCount + 1 : 0,
			}));
		}
		
		queryClient.refetchQueries({queryKey: ["chat", "message", username]});
	}, [queryClient, setClientUser, setUsers]);
	
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
		if (scrollTop + clientHeight + 100 >= scrollHeight) {
			lastMessageScrollBottom = 0;
			enableScrollAnimation = true;
		}
		
		flushSync(() => setMessagesState([...messagesVar]));
	}, [updateUserItem]);
	
	let firstRebirth = useRef(false);
	
	const stompOnConnect = useCallback(() => {
		stomp.heartbeat.incoming = 10000;
		stomp.heartbeat.outgoing = 10000;
		
		firstRebirth.current = true;
		
		if (disconnectErrorBarKey.current) {
			closeSnackbar(disconnectErrorBarKey.current);
			contactsData.refetch();
			queryClient.invalidateQueries({
				predicate: query => {
					const key = query.queryKey;
					return Array.isArray(key) && key.length === 3 && key[0] === "chat" && key[1] === "message";
				}
			});
			disconnectErrorBarKey.current = null;
		}
		
		stomp.subscribe("/topic/chat.online", (message) => {
			const username = JSON.parse(message.body).username;
			const userItem = usersVar?.find(item => item.username === username);
			if (userItem) {
				userItem.isOnline = true;
				setUsers([...usersVar]);
			}
			if (username === currentUserVar)
				setLastOnline("在线");
		});
		
		stomp.subscribe("/topic/chat.offline", (message) => {
			const data = JSON.parse(message.body);
			const userItem = usersVar?.find(item => item.username === data.username);
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
			} else {
				queryClient.refetchQueries({queryKey: ["chat", "message", data.sender === myname ? data.recipient : data.sender]});
			}
			
			if (data["isLatest"]) {
				const userItem = usersVar?.find(item => item.username === (data.sender === myname ? data.recipient : data.sender));
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
			} else {
				queryClient.refetchQueries({queryKey: ["chat", "message", "ChatRoomSystem"]});
			}
			
			if (data["isLatest"]) {
				const userItem = usersVar?.find(item => item.username === "ChatRoomSystem");
				if (userItem) {
					userItem.lastMessageText = data.displayName + ": 消息已撤回";
					setUsers([...usersVar]);
				}
			}
		});
	}, [contactsData, newMessage, queryClient, setMessages, setUsers, updateUserItem]);
	
	useEffect(() => {
		const stompConnect = () => {
			socket = new SockJS(window.location.origin + "/api/websocket");
			stomp = Stomp.over(() => socket);
			
			if (myname) {
				stomp.connect({
					Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
				}, stompOnConnect, null, stompReconnect);
			}
			
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
		
		if (!stomp) {
			stompConnect();
		}
	}, [stompOnConnect]);
	
	useLayoutEffect(() => {
		if (document.getElementById("app-bar")) {
			document.getElementById("app-bar").style.display = username && isSmallScreen ? "none" : "flex";
		}
	}, [isSmallScreen, username]);
	
	document.title = (currentUserDisplayName ? `和 ${currentUserDisplayName} 的聊天` : "聊天") + " - chy.web";
	
	return (
		<Grid container sx={{flex: 1, display: !users ? "none" : "flex", minHeight: 0}} gap={2}>
			<Card
				variant="outlined"
				sx={{
					width: isSmallScreen ? "100%" : 300,
					height: "100%",
					display: username && isSmallScreen ? "none" : "flex",
					flexDirection: "column",
					overflow: "visible",
				}}
			>
				<OutlinedInput
					value={userSearchKey}
					startAdornment={
						<InputAdornment position="start">
							<PersonSearch sx={{fontSize: 22}}/>
						</InputAdornment>
					}
					endAdornment={
						<InputAdornment position="end">
							{onUserSearching && <Cancel
								fontSize="small"
								sx={{cursor: "pointer"}}
								onClick={() => {
									setUserSearchKey("");
									setOnUserSearching(false);
								}}
							/>}
						</InputAdornment>
					}
					placeholder="搜索用户"
					sx={{fontSize: 15, mx: "-1px", mt: "-1px"}}
					onFocus={() => {
						setOnUserSearching(true);
					}}
					onBlur={() => {
						if (userSearchKey === "") {
							setOnUserSearching(false);
						}
					}}
					onChange={(event) => {
						setUserSearchKey(event.target.value);
					}}
				/>
				<Box sx={{overflowY: "auto"}}>
					<List>
						{users != null && (
							<UserItem
								username="ChatRoomSystem"
								displayName="公共"
								displayNameString="公共"
								avatarVersion={1}
								badge={users.find(item => item.username === "ChatRoomSystem").badge}
								isOnline={false}
								newMessageCount={users.find(item => item.username === "ChatRoomSystem").newMessageCount}
								lastMessageTime={users.find(item => item.username === "ChatRoomSystem").lastMessageTime}
								draft={users.find(item => item.username === "ChatRoomSystem").draft}
								lastMessageText={users.find(item => item.username === "ChatRoomSystem").lastMessageText}
								selected={currentUser === "ChatRoomSystem"}
								isMessageAllowed={users.find(item => item.username === "ChatRoomSystem").isMessageAllowed}
							/>
						)}
					</List>
					<Divider/>
					<Collapse in={!onUserSearching}>
						<List>
							{users != null && users.map(user => user.username !== "ChatRoomSystem" && (
								<UserItem
									key={user.username}
									username={user.username}
									displayName={user.displayName}
									displayNameString={user.displayName}
									avatarVersion={user.avatarVersion}
									badge={user.badge}
									isOnline={user.isOnline}
									newMessageCount={user.newMessageCount}
									lastMessageTime={user.lastMessageTime}
									lastMessageText={user.lastMessageText || "\u00A0"}
									draft={user.draft}
									selected={currentUser === user.username}
									isMessageAllowed={user.isMessageAllowed}
								/>
							))}
						</List>
					</Collapse>
					<Box ref={contactsLoadMoreRef} sx={{pb: 1, display: onUserSearching ? "none" : "block"}}>
						<LoadMoreIndicator isFetching={contactsData.isFetching}/>
					</Box>
					{onUserSearching && (
						<List>
							<AnimatePresence>
								{userFindData.data?.pages.map(page => page.map(user => {
									const regex = new RegExp(`(${userSearchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "i");
									
									if (!regex.test(user.username) && !regex.test(user.displayName)) {
										return null;
									}
									
									return (
										<motion.div
											key={user.username}
											initial={{opacity: 0, height: 0}}
											animate={{opacity: 1, height: "auto"}}
											exit={{opacity: 0, height: 0}}
											transition={{duration: 0.3}}
										>
											<UserItem
												username={user.username}
												displayName={
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
												displayNameString={user.displayName}
												avatarVersion={user.avatarVersion}
												badge={user.badge}
												isOnline={user.isOnline}
												newMessageCount={user.newMessageCount}
												lastMessageTime={user.lastMessageTime}
												lastMessageText={user.lastMessageText || "\u00A0"}
												draft={user.draft}
												selected={currentUser === user.username}
												isMessageAllowed={user.isMessageAllowed}
											/>
										</motion.div>
									);
								}))}
							</AnimatePresence>
						</List>
					)}
					<Box ref={userFindLoadMoreRef} sx={{pb: 1, display: userSearchKey !== "" ? "block" : "none"}}>
						<LoadMoreIndicator isFetching={userFindData.isFetching}/>
					</Box>
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
				<Card
					variant="outlined"
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "flex-end",
						maxWidth: "100%",
					}}
				>
					<Grid
						container
						ref={messageCard}
						sx={{
							overflowY: "auto",
							px: 1,
							py: 1,
							maxWidth: "100%",
							flexDirection: "column",
							flexWrap: "nowrap",
						}}
						onScroll={() => {
							if (lastMessageScrollBottom !== -1) {
								lastMessageScrollBottom = messageCard.current.scrollHeight - messageCard.current.scrollTop;
							}
						}}
					>
						<Box ref={messageLoadMoreRef} sx={{py: 1, display: username ? "block" : "none"}}>
							<LoadMoreIndicator isFetching={messageData.isFetching}/>
						</Box>
						{messages.map((message, messageIndex) => {
							const currentDate = new Date(message.time);
							const previousDate = new Date(messageIndex === 0 ? 0 : messages[messageIndex - 1].time);
							const showTime = currentDate.getTime() - previousDate.getTime() > 5 * 60 * 1000;
							
							return (
								<Fragment key={message.id}>
									{showTime && <Grid container my={1}><Chip label={convertDateToLocaleAbsoluteString(currentDate)} sx={{mx: "auto"}}/></Grid>}
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
										messageData={messageData}
									/>
								</Fragment>
							);
						})}
					</Grid>
					{showScrollTop && <ScrollTop messageCard={messageCard}>
						<Fab size="small">
							<ArrowDownward/>
						</Fab>
					</ScrollTop>}
				</Card>
				<Box sx={{width: "100%", display: currentUser ? "block" : "none"}}>
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
					<Card variant="outlined" sx={{maxWidth: "100%", overflow: "visible", boxSizing: "border-box"}}>
						<TextField
							inputRef={messageInput}
							placeholder="Message"
							value={inputValue}
							multiline
							fullWidth
							maxRows={10}
							slotProps={{input: {style: {padding: 10}}}}
							sx={{
								mt: "-1px",
								mx: "-1px",
								width: "calc(100% + 2px)",
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
							onChange={(event) => {
								setInputValue(event.target.value);
								saveDraft(currentUserVar, event.target.value, setUsers);
							}}
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
						<Grid container justifyContent="space-between" alignItems="center">
							<ChatToolBar
								inputField={messageInput}
								setInputValue={setInputValue}
								setUsers={setUsers}
								quote={quote}
								setQuote={setQuote}
								sendFiles={sendFiles}
								messageData={messageData}
								currentUser={currentUser}
							/>
							<Dialog open={showMessageBlockAlert} onClose={() => setShowMessageBlockAlert(false)}>
								<DialogTitle>
									对方暂时不想接收您的消息呢QAQ
								</DialogTitle>
								<DialogActions>
									<Button onClick={() => setShowMessageBlockAlert(false)}>
										关闭
									</Button>
								</DialogActions>
							</Dialog>
							<Tooltip title={isCurrentUserMessageAllowed ? undefined : "对方暂时不想接收您的消息呢QAQ"}>
								<Box height="max-content">
									<Button
										variant="contained"
										startIcon={isCurrentUserMessageAllowed ? <Send/> : <Block/>}
										disabled={!isCurrentUserMessageAllowed}
										sx={{my: "auto", mr: 0.75}}
										onClick={sendMessage}
									>
										发送
									</Button>
								</Box>
							</Tooltip>
						</Grid>
					</Card>
				</Box>
			</Grid>
		</Grid>
	);
}