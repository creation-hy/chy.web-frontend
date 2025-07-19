import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {Add, BookmarkBorder, ChatBubbleOutline, Delete, Edit, FavoriteBorder, ShareOutlined, Visibility, VisibilityOff} from "@mui/icons-material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import {List, ListItem, ListItemAvatar, ListItemText, Switch, Tab, Tabs, Tooltip, useMediaQuery} from "@mui/material";
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
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import {UserAvatar, UserBadge} from "src/components/UserComponents.jsx";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import {convertDateToLocaleOffsetString} from "src/assets/DateUtils.jsx";
import {NavigateButtonBase, NavigateLink} from "src/components/NavigateComponents.jsx";
import {LoadMoreIndicator} from "src/components/LoadMoreIndicator.jsx";

const myId = Number(localStorage.getItem("user_id"));

const USER_SCOPE_LIST = ["all", "following", "mine"];

const PostItem = memo(function PostItem({userScope, id, title, author, content, visibility, createdAt}) {
	const queryClient = useQueryClient();
	
	const [isDeleting, setIsDeleting] = useState(false);
	
	return (
		<ListItem key={id} sx={{width: "100%", flexDirection: "column", alignItems: "flex-start", px: 0.5}}>
			<Grid container justifyContent="space-between" width="100%" alignItems="center" wrap="nowrap" gap={1.5}>
				<Grid container alignItems="center" wrap="nowrap" flex={1}>
					<ListItemAvatar>
						<NavigateButtonBase href={`/user/${author.username}`} sx={{borderRadius: "50%"}}>
							<UserAvatar username={author.username} displayName={author.displayName} avatarVersion={author.avatarVersion}/>
						</NavigateButtonBase>
					</ListItemAvatar>
					<ListItemText>
						<Grid container alignItems="center" wrap="nowrap" gap={0.25}>
							<NavigateLink href={`/user/${author.username}`} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
								<Typography fontWeight="bold" noWrap alignItems="center">
									{author.displayName}
								</Typography>
							</NavigateLink>
							<UserBadge badge={author.badge} fontSize={18}/>
						</Grid>
						<Typography
							fontSize={14}
							color="textSecondary"
							noWrap
							overflow="hidden"
							textOverflow="ellipsis"
							maxWidth="100%"
						>
							<NavigateLink href={`/user/${author.username}`} underline="none">
								@{author.username}
							</NavigateLink>
						</Typography>
					</ListItemText>
				</Grid>
				<Grid container alignItems="center" gap={1}>
					{userScope === "mine" && (
						visibility === "PUBLIC" ? <Visibility color="action"/> : <VisibilityOff color="action"/>
					)}
					<Typography variant="body2" color="textSecondary" noWrap>
						{convertDateToLocaleOffsetString(createdAt)}
					</Typography>
				</Grid>
			</Grid>
			<Typography
				sx={{
					mt: 0.5,
					mb: 1,
					display: "-webkit-box",
					WebkitBoxOrient: "vertical",
					WebkitLineClamp: 5,
					overflow: "hidden",
					textOverflow: "ellipsis",
					wordBreak: "break-word",
				}}
			>
				{content}
			</Typography>
			<Grid container width="100%" sx={{justifyContent: "space-between"}}>
				<Box>
					<Tooltip title="评论">
						<IconButton>
							<ChatBubbleOutline/>
						</IconButton>
					</Tooltip>
					<Tooltip title="喜欢">
						<IconButton>
							<FavoriteBorder/>
						</IconButton>
					</Tooltip>
					<Tooltip title="收藏">
						<IconButton>
							<BookmarkBorder/>
						</IconButton>
					</Tooltip>
					<Tooltip title="分享">
						<IconButton>
							<ShareOutlined/>
						</IconButton>
					</Tooltip>
				</Box>
				{author.id === myId && (
					<Box>
						<Tooltip title="编辑">
							<IconButton>
								<Edit/>
							</IconButton>
						</Tooltip>
						<Tooltip title="删除">
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
						</Tooltip>
					</Box>
				)}
			</Grid>
		</ListItem>
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
	const {data, isFetching, fetchNextPage, hasNextPage} = useInfiniteQuery({
		queryKey: ["posts", "get-list", userScope],
		queryFn: ({pageParam}) => axios.get(`/api/posts`, {params: {userScope: userScope, page: pageParam}}).then(res => res.data),
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
		pageLoadingObserver.observe(loadMoreRef.current);
		return () => pageLoadingObserver.disconnect();
	}, [fetchNextPage, hasNextPage, isFetching]);
	
	return (
		<List>
			{data?.pages.map(page => page.map(item => (
				<>
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
					<Divider/>
				</>
			)))}
			<Box ref={loadMoreRef} sx={{pt: 1.5}}>
				<LoadMoreIndicator isFetching={isFetching}/>
			</Box>
		</List>
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
			<Grid
				container
				width="100%"
				justifyContent={isSmallScreen ? "center" : "space-between"}
				alignItems={"center"}
				gap={4}
				wrap="nowrap"
			>
				<Tabs
					value={tabValue}
					onChange={(event, value) => {
						navigate(`/posts/${tabs[value]}`);
						setTabValue(value);
					}}
				>
					<Tab label="推荐"/>
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
