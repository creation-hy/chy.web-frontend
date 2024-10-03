import {Fragment, useEffect, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import {Alert, Badge, List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Paper, useMediaQuery} from "@mui/material";
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
	ContentCopyOutlined,
	DeleteOutline,
	FormatQuoteOutlined,
	MoreHoriz,
	SearchOutlined,
	Send,
	SettingsOutlined,
	TitleOutlined
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Markdown from "react-markdown";
import IconButton from "@mui/material/IconButton";
import {useTheme} from "@mui/material/styles";
import {flushSync} from "react-dom";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SockJS from "sockjs-client";
import {Stomp} from "@stomp/stompjs";
import Cookies from "js-cookie";

function UserItem({username, info}) {
	return (
		<Fragment>
			<ListItemAvatar>
				<Badge badgeContent={info["newMessageCount"]} overlap="circular" color="error">
					<Badge
						badgeContent={info["isOnline"] || username === "ChatRoomSystem" ? " " : 0} overlap="circular"
						anchorOrigin={{vertical: "bottom", horizontal: "right"}} color="success"
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

const Message = ({isMe, username, content, timestamp}) => {
	const [selectedText, setSelectedText] = useState("");
	const [contextMenu, setContextMenu] = useState(null);
	
	return (
		<Box
			display="flex"
			justifyContent={isMe ? 'flex-end' : 'flex-start'}
			alignItems="flex-start"
			mb={2}
		>
			{!isMe && <Avatar src={"/usericon/" + username + ".png"} alt={username} sx={{mr: 1.5}}/>}
			<Paper
				elevation={3}
				sx={{
					padding: '8px 16px',
					borderRadius: '16px',
					maxWidth: '60%',
					backgroundColor: isMe ? '#1976d2' : 'normal',
					color: isMe ? 'white' : 'normal',
					wordBreak: 'break-word',
				}}
				onContextMenu={(event) => {
					event.preventDefault();
					setSelectedText(window.getSelection().toString());
					setContextMenu(contextMenu ? null : {
						mouseX: event.clientX + 2,
						mouseY: event.clientY - 6,
					});
				}}
			>
				<Box>
					<style>{"h1, h2, h3, p, ul, li { margin: 0 }"}</style>
					<Markdown>{content.replace(/\n/g, "  \n")}</Markdown>
				</Box>
				<Typography variant="caption" display="block" textAlign="right" mt={1}>
					{new Date(timestamp).toLocaleString()}
				</Typography>
				<Menu
					open={Boolean(contextMenu)}
					onClose={() => setContextMenu(null)}
					onClick={() => setContextMenu(null)}
					anchorReference="anchorPosition"
					anchorPosition={contextMenu ? {top: contextMenu.mouseY, left: contextMenu.mouseX} : undefined}
				>
					<MenuItem onClick={() => navigator.clipboard.writeText(selectedText)}>
						<ListItemIcon>
							<ContentCopyOutlined/>
						</ListItemIcon>
						<Typography>
							复制
						</Typography>
					</MenuItem>
					<MenuItem>
						<ListItemIcon>
							<FormatQuoteOutlined/>
						</ListItemIcon>
						<Typography>
							引用
						</Typography>
					</MenuItem>
					<MenuItem>
						<ListItemIcon>
							<DeleteOutline/>
						</ListItemIcon>
						<Typography>
							删除
						</Typography>
					</MenuItem>
				</Menu>
			</Paper>
			{isMe && <Avatar src={"/usericon/" + username + ".png"} alt={username} sx={{ml: 1.5}}/>}
		</Box>
	);
};

Message.propTypes = {
	isMe: PropTypes.bool,
	username: PropTypes.string,
	content: PropTypes.string,
	timestamp: PropTypes.string,
}

export default function Chat() {
	document.title = "Chat - chy.web";
	
	const [users, setUsers] = useState([]);
	const [publicChannel, setPublicChannel] = useState([]);
	const [logged, setLogged] = useState(null);
	const [currentUser, setCurrentUser] = useState("");
	const [messages, setMessages] = useState([]);
	const [lastOnline, setLastOnline] = useState("");
	const [username, setUsername] = useState(null);
	const [stomp, setStomp] = useState(null);
	const isMobile = useMediaQuery(useTheme().breakpoints.down("sm"));
	const queryClient = useQueryClient();
	let currentUserVar = "";
	
	const getMessages = (username) => {
		currentUserVar = username;
		setCurrentUser(username);
		if (isMobile) {
			document.getElementById("contacts").style.display = "none";
			document.getElementById("chat-main").style.display = "flex";
		}
		axios.get("/api/chat/message/" + username + "/-1").then(res => {
			console.log(res.data["result"]);
			setLastOnline(res.data["result"]["onlineStatus"]);
			flushSync(() => setMessages(res.data["result"]["message"]));
			document.getElementById("message-card").lastElementChild.scrollIntoView({behavior: "instant"});
		});
	}
	
	const {data, isLoading, error} = useQuery({
		queryKey: ["contacts"],
		queryFn: () => axios.get("/api/chat/contacts").then(res => res.data),
	});
	
	useEffect(() => {
		if (!isLoading && !error) {
			if (data["status"] !== 1) {
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
			setPublicChannel(data["result"]["public"]);
			setUsers(data["result"]["users"]);
			
			const stomp = Stomp.over(() => new SockJS(window.location.origin + "/api/websocket"));
			const username = Cookies.get("username");
			setUsername(username);
			setStomp(stomp);
		}
	}, [data, error, isLoading, isMobile]);
	
	if (stomp != null && username != null) {
		stomp.connect({}, () => {
			stomp.subscribe("/topic/chat/online", (message) => {
				queryClient.invalidateQueries({queryKey: ["contacts"]});
				console.log(message);
				if (message.body === currentUserVar)
					setLastOnline("对方在线");
			});
			stomp.subscribe("/topic/chat/offline", (message) => {
				queryClient.invalidateQueries({queryKey: ["contacts"]});
				console.log(message);
				if (message.body === currentUserVar)
					setLastOnline("对方已离线");
			});
		});
	}
	
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
								key={user["displayName"]}
								onClick={() => getMessages(user["displayName"])}
								selected={currentUser === user["displayName"]}
							>
								<UserItem username={user["displayName"]} info={user}/>
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
							currentUserVar = "";
						}} sx={{display: isMobile ? "flex" : "none"}}>
							<ArrowBack/>
						</IconButton>
						<Grid container direction="column" alignItems={isMobile ? "center" : "flex-start"}>
							<Typography variant="h6">{currentUser}</Typography>
							<Typography id="last-online">{lastOnline}</Typography>
						</Grid>
						<IconButton onClick={() => window.open("/user/" + currentUser)}>
							<MoreHoriz/>
						</IconButton>
					</Grid>
				</Card>
				<Card id="message-card" sx={{flex: 1, overflowY: "auto", p: 1}}>
					{messages.map((message) => (
						<Box key={message["id"]}>
							<Message
								isMe={message["isMe"]}
								username={message["username"]}
								content={message["text"]}
								timestamp={message["time"]}
							/>
						</Box>
					))}
				</Card>
				<Card>
					<TextField
						id="message-text"
						placeholder="Message"
						multiline
						fullWidth
						maxRows={5}
						sx={{flex: 1}}
					/>
					<Grid container justifyContent="space-between">
						<Box>
							<IconButton size="large"><TitleOutlined/></IconButton>
							<IconButton size="large"><AddLinkOutlined/></IconButton>
							<IconButton size="large"><AddPhotoAlternateOutlined/></IconButton>
							<IconButton size="large"><AddReactionOutlined/></IconButton>
							<IconButton size="large"><SettingsOutlined/></IconButton>
						</Box>
						<IconButton sx={{justifySelf: "flex-end"}} size="large" color="primary"><Send/></IconButton>
					</Grid>
				</Card>
			</Grid>
		</Grid>
	) : <Alert severity="error">请先登录！</Alert>;
}