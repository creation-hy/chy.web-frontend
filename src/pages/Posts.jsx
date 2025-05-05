import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {Add, Delete, Edit, Visibility, VisibilityOff} from "@mui/icons-material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import {CardActionArea, CardActions, Switch, Tab, Tabs, useMediaQuery} from "@mui/material";
import {memo, useEffect, useMemo, useRef, useState} from "react";
import {LoadingButton} from "@mui/lab";
import axios from "axios";
import Grid from "@mui/material/Grid";
import {enqueueSnackbar} from "notistack";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import OutlinedInput from "@mui/material/OutlinedInput";
import {useNavigate, useParams} from "react-router";
import {useInfiniteQuery, useQueryClient} from "@tanstack/react-query";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import {UsernameWithBadge} from "src/components/UserComponents.jsx";
import IconButton from "@mui/material/IconButton";

const myId = Number(localStorage.getItem("user_id"));

const USER_SCOPE_LIST = ["all", "following", "mine"];

const PostItem = memo(function PostItem({userScope, id, title, author, content, visibility, createdAt}) {
	const queryClient = useQueryClient();
	
	const [isDeleting, setIsDeleting] = useState(false);
	
	return (
		<Card variant="outlined" key={id} sx={{width: "100%"}}>
			<CardActionArea>
				<CardContent>
					<Grid container justifyContent="space-between" mb={0.5} wrap="nowrap">
						<Grid container alignItems="center" height="max-content" gap={1}>
							{userScope === "mine" && (
								visibility === "PUBLIC" ? <Visibility/> : <VisibilityOff/>
							)}
							<Typography variant="h6" noWrap textOverflow="ellipsis" flex={1}>
								{title}
							</Typography>
						</Grid>
						<Grid container direction="column" alignItems="flex-end">
							<UsernameWithBadge
								username={author.displayName}
								badge={author.badge}
								fontWeight="normal"
								fontSize={14}
								size={16}
							/>
							<Typography variant="body2" color="textSecondary">
								{new Date(createdAt).toLocaleString()}
							</Typography>
						</Grid>
					</Grid>
					<Typography variant="body2" color="textSecondary">
						{content}
					</Typography>
				</CardContent>
			</CardActionArea>
			{author.id === myId && (
				<CardActions sx={{justifyContent: "flex-end"}}>
					<IconButton>
						<Edit/>
					</IconButton>
					<IconButton
						color="error"
						loading={isDeleting}
						onClick={() => {
							setIsDeleting(true);
							axios.delete(`/api/posts/${id}`).then(res => {
								if (res.status === 204) {
									setIsDeleting(false);
									for (let scope of USER_SCOPE_LIST) {
										queryClient.setQueryData(["posts", "get-list", scope], data => !data ? data : {
											pages: data.pages.map(page => page.filter(i => i.id !== id)),
											pageParams: data.pageParams,
										});
									}
								}
							});
						}}
					>
						<Delete/>
					</IconButton>
				</CardActions>
			)}
		</Card>
	);
});

PostItem.propTypes = {
	userScope: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	title: PropTypes.string,
	author: PropTypes.object.isRequired,
	content: PropTypes.string,
	visibility: PropTypes.string.isRequired,
	createdAt: PropTypes.string.isRequired,
}

const PostList = memo(function PostList({userScope}) {
	const postsData = useInfiniteQuery({
		queryKey: ["posts", "get-list", userScope],
		queryFn: ({pageParam}) => axios.get(`/api/posts`, {params: {userScope: userScope, page: pageParam}}).then(res => res.data),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages, lastPageParam) => lastPage.length === 0 ? undefined : lastPageParam + 1,
	});
	
	return (
		<Grid container direction="column" gap={1.5}>
			{postsData.data?.pages.map(page => page.map(item => (
				<PostItem
					key={item.id}
					userScope={userScope}
					id={item.id}
					title={item.title}
					author={item.author}
					content={item.content}
					visibility={item.visibility}
					createdAt={item.createdAt}
				/>
			)))}
		</Grid>
	);
});

PostList.propTypes = {
	userScope: PropTypes.string.isRequired,
}

export default function Posts() {
	const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("md"));
	const navigate = useNavigate();
	
	const tab = useParams().tab;
	const tabs = useMemo(() => ["all", "following", "mine"], []);
	const [tabValue, setTabValue] = useState(Math.max(tabs.indexOf(tab), 0));
	
	const titleRef = useRef(null);
	const contentRef = useRef(null);
	
	const [isPublic, setIsPublic] = useState(localStorage.getItem("postIsPublic") === "true");
	
	const [onCreatingArticle, setOnCreatingArticle] = useState(false);
	const [onUploadingArticle, setOnUploadingArticle] = useState(false);
	
	document.title = "ChyPost - chy.web";
	
	useEffect(() => {
		setTabValue(Math.max(tabs.indexOf(tab), 0));
		if (tabs.indexOf(tab) === -1 && tab) {
			navigate(`/posts`);
		}
	}, [tab, navigate, tabs]);
	
	return (
		<Box>
			<Grid
				container
				width="100%"
				justifyContent={isSmallScreen ? "center" : "space-between"}
				alignItems={"center"}
				gap={4}
				wrap="nowrap"
				sx={{mb: 2}}
			>
				<Tabs
					value={tabValue}
					onChange={(event, value) => {
						navigate(`/posts/${tabs[value]}`);
						setTabValue(value);
					}}
				>
					<Tab label="全部"/>
					<Tab label="关注"/>
					<Tab label="我的"/>
				</Tabs>
				{!isSmallScreen && (
					<Grid container display={isSmallScreen ? "none" : "flex"} direction="row" gap={1} wrap="nowrap">
						<OutlinedInput
							size="small"
							placeholder="搜索文章"
							sx={{flex: 1}}
							startAdornment={
								<InputAdornment position="start" sx={{color: 'text.primary'}}>
									<SearchRoundedIcon/>
								</InputAdornment>
							}
						/>
						<Button variant="contained" startIcon={<Add/>} onClick={() => setOnCreatingArticle(true)}>
							新建
						</Button>
					</Grid>
				)}
			</Grid>
			{isSmallScreen && (
				<Grid
					container
					direction="row"
					width="100%"
					sx={{
						gap: 1,
						mb: 1.5,
					}}
				>
					<OutlinedInput
						size="small"
						placeholder="搜索文章"
						sx={{flex: 1}}
						startAdornment={
							<InputAdornment position="start" sx={{color: 'text.primary'}}>
								<SearchRoundedIcon/>
							</InputAdornment>
						}
					/>
					<Button variant="contained" startIcon={<Add/>} onClick={() => setOnCreatingArticle(true)}>
						新建
					</Button>
				</Grid>
			)}
			<PostList userScope={tabs[tabValue]}/>
			<Dialog
				open={onCreatingArticle}
				fullWidth
				maxWidth="md"
				fullScreen={isSmallScreen}
				onClose={() => setOnCreatingArticle(false)}
			>
				<DialogTitle sx={{pb: 0}}>
					新建文章
				</DialogTitle>
				<DialogContent sx={{pb: 0}}>
					<TextField
						fullWidth
						inputRef={titleRef}
						placeholder="文章标题"
						sx={{mt: 2, mb: 1.5}}
					/>
					<TextField
						fullWidth
						inputRef={contentRef}
						multiline
						minRows={3}
						maxRows={20}
						placeholder="文章内容"
					/>
					<Grid container justifyContent="flex-end" mt={1.25} mb={1} gap={2}>
						<Grid container alignItems="center">
							<Switch
								checked={isPublic}
								onChange={(event, value) => {
									setIsPublic(value);
									localStorage.setItem("postIsPublic", value.toString());
								}}
							/>
							公开
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOnCreatingArticle(false)}>
						取消
					</Button>
					<LoadingButton
						loading={onUploadingArticle}
						onClick={() => {
							if (titleRef.current.value.length === 0) {
								enqueueSnackbar("标题不可为空", {variant: "error"});
								return;
							}
							
							if (titleRef.current.value.length > 100) {
								enqueueSnackbar("标题上限100字", {variant: "error"});
								return;
							}
							
							if (contentRef.current.value.length > 50000) {
								enqueueSnackbar("文章上限50000字", {variant: "error"});
								return;
							}
							
							setOnUploadingArticle(true);
							
							axios.post("/api/posts", {
								title: titleRef.current.value,
								content: contentRef.current.value,
								visibility: isPublic ? "PUBLIC" : "PRIVATE",
							}, {
								headers: {
									'Content-Type': 'application/json',
								},
							}).then(res => {
								if (res.status === 201) {
									setOnCreatingArticle(false);
									setOnUploadingArticle(false);
								}
							});
						}}
					>
						创建
					</LoadingButton>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
