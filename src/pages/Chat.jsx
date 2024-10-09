import {Fragment, useCallback, useEffect, useRef, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import {Alert, Badge, List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Paper} from "@mui/material";
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

const Message = ({messageId, isMe, username, content, timestamp, messagesRef}) => {
	const [contextMenu, setContextMenu] = useState(null);
	const [onDialog, setOnDialog] = useState(false);
	const [contentState, setContent] = useState(content);
	const queryClient = useQueryClient();
	
	return (
		<Grid container justifyContent={isMe ? 'flex-end' : 'flex-start'} alignItems="flex-start" sx={{my: 2}}>
			{!isMe && <IconButton sx={{mr: 1.5, p: 0}} href={"/user/" + username}><Avatar src={"/usericon/" + username + ".png"} alt={username}/></IconButton>}
			<Paper
				elevation={3}
				sx={{
					padding: '8px 16px',
					borderRadius: '16px',
					maxWidth: '60%',
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
					<style>{"h1, h2, h3, p, ul, li { margin: 0 }"}</style>
					<Markdown>{contentState.replace(/\n/g, "  \n")}</Markdown>
				</Box>
				<Typography variant="caption" display="block" textAlign={isMe ? "right" : "left"} mt={1}>
					{new Date(timestamp).toLocaleString()}
				</Typography>
			</Paper>
			{isMe && <IconButton sx={{ml: 1.5, p: 0}} href={"/user/" + username}><Avatar src={"/usericon/" + username + ".png"} alt={username}/></IconButton>}
			<Dialog open={onDialog} onClose={() => setOnDialog(false)}>
				<DialogContent>
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
					
				}}>
					<ListItemIcon>
						<FormatQuoteOutlined/>
					</ListItemIcon>
					<Typography>
						引用
					</Typography>
				</MenuItem>
				<MenuItem onClick={() => {
					axios.get("/api/chat/delete-message/" + messageId).then(res => {
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
	timestamp: PropTypes.string,
	messagesRef: PropTypes.object,
}

export default function Chat() {
	document.title = "Chat - chy.web";
	
	const [users, setUsers] = useState([]);
	const [publicChannel, setPublicChannel] = useState([]);
	const [logged, setLogged] = useState(null);
	const [currentUser, setCurrentUser] = useState("");
	const [messages, setMessages] = useState([]);
	const [lastOnline, setLastOnline] = useState("");
	const [stomp, setStomp] = useState(null);
	const queryClient = useQueryClient();
	const messageCard = useRef(null), messageInput = useRef(null);
	const currentUserRef = useRef("");
	const messagesRef = useRef([]);
	const myname = Cookies.get("username");
	
	const refreshContacts = useCallback(() => {
		queryClient.invalidateQueries({queryKey: ["contacts"]});
	}, [queryClient]);
	
	const getMessages = (username) => {
		currentUserRef.current = username;
		setCurrentUser(username);
		if (isMobile) {
			document.getElementById("contacts").style.display = "none";
			document.getElementById("chat-main").style.display = "flex";
		}
		axios.get("/api/chat/message/" + username + "/-1").then(res => {
			refreshContacts();
			messagesRef.current = res.data["result"]["message"];
			flushSync(() => {
				setLastOnline(res.data["result"]["onlineStatus"]);
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
		Notification.requestPermission().then(() => {
		});
		
		axios.get("/api/chat/update-viewed/" + currentUserRef.current).then(() => refreshContacts());
		messagesRef.current = [...messagesRef.current, {
			id: data.id,
			isMe: data.sender === myname,
			username: data.sender,
			text: data.content,
			time: data.time
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
			stomp.subscribe("/topic/chat/online", (message) => {
				refreshContacts();
				if (JSON.parse(message.body).username === currentUserRef.current)
					setLastOnline("对方在线");
			});
			
			stomp.subscribe("/topic/chat/offline", (message) => {
				refreshContacts();
				const data = JSON.parse(message.body);
				if (data.username === currentUserRef.current)
					setLastOnline(data.online);
			});
			
			// TODO: 新消息浏览器提示
			stomp.subscribe(`/user/${myname}/queue/chat/message`, (message) => {
				const data = JSON.parse(message.body);
				if (myname === data.sender && currentUserRef.current === data.recipient || myname === data.recipient && currentUserRef.current === data.sender)
					newMessage(data);
				else
					refreshContacts();
			});
			
			stomp.subscribe("/topic/chat/public-message", (message) => {
				refreshContacts();
				const data = JSON.parse(message.body);
				if (currentUserRef.current === data.recipient)
					newMessage(data);
				else
					refreshContacts();
			});
		});
	}, [myname, newMessage, refreshContacts]);
	
	const sendMessage = () => {
		const content = messageInput.current.value;
		if (content === "")
			return;
		messageInput.current.value = "";
		stomp.send("/app/chat/send-message", {}, JSON.stringify({
			recipient: currentUser,
			content: content,
		}));
	}
	
	// TODO: 联系人搜索，引用消息，删除消息，复制消息默认复制全文，消息右键框优化，上滑加载更多消息
	
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
				<Card>
					<Grid
						container direction="row" justifyContent="space-between" alignItems="center"
						sx={{display: currentUser === "" ? "none" : "flex"}} padding={isMobile ? 1 : 2}
					>
						<IconButton onClick={() => {
							document.getElementById("contacts").style.display = "flex";
							document.getElementById("chat-main").style.display = "none";
							setCurrentUser("");
							currentUserRef.current = "";
						}} sx={{display: isMobile ? "flex" : "none"}}>
							<ArrowBack/>
						</IconButton>
						<Grid container direction="column" alignItems={isMobile ? "center" : "flex-start"}>
							<Typography variant="h6">{currentUser}</Typography>
							<Typography>{lastOnline}</Typography>
						</Grid>
						<IconButton onClick={() => window.open("/user/" + currentUser)}>
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
							timestamp={message.time}
							messagesRef={messagesRef}
						/>
					))}
				</Card>
				<Card sx={{display: currentUser === "" ? "none" : "block"}}>
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
							<IconButton size="large"><SettingsOutlined/></IconButton>
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
		</Grid>
	) : <Alert severity="error">请先登录！</Alert>;
}