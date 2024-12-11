import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid2";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import {
	CheckCircle,
	Close,
	DeleteOutlined,
	DrawOutlined,
	ExpandMoreOutlined,
	FileDownloadOutlined,
	HourglassBottomOutlined,
	Info,
	Lock,
	LockOpenOutlined,
	NavigateBefore,
	NavigateNext,
	SelectAllOutlined,
	ThumbDownAlt,
	ThumbDownOffAlt,
	ThumbUpAlt,
	ThumbUpOffAlt,
	Visibility,
	VisibilityOffOutlined,
	VisibilityOutlined
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import {useInfiniteQuery, useQuery, useQueryClient} from "@tanstack/react-query";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Backdrop,
	Badge,
	ButtonBase,
	CircularProgress,
	Collapse,
	Drawer,
	Grow,
	ImageListItem,
	ImageListItemBar,
	InputLabel,
	List,
	ListItem,
	ListItemText,
	Slider,
	Switch,
	Tab,
	Tabs,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	useMediaQuery
} from "@mui/material";
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {convertDateToLocaleAbsoluteString, convertDateToLocaleOffsetString} from "src/assets/DateUtils.jsx";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import {LoadingButton} from "@mui/lab";
import Masonry from "react-masonry-css";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import {TransitionGroup} from "react-transition-group";
import {SimpleUserItem} from "src/components/UserComponents.jsx";
import {isIOS13} from "react-device-detect";
import {useNavigate, useParams} from "react-router";
import PropTypes from "prop-types";
import {LoadMoreIndicator} from "src/components/LoadMoreIndicator.jsx";
import {debounce} from "lodash";

const modelList = [
	"SweetSugarSyndrome_v15.safetensors",
	"MeinaMix_meinaV11.safetensors",
	"MeinaMix_v12Final.safetensors",
	"Anything-V3.0.ckpt",
	"AnythingXL_v50.safetensors",
	"CuteYukiMixAdorable_X.safetensors",
	"CuteYukiMixAdorable_naiV3style.safetensors",
	"CuteYukiMixAdorable_midchapter3.safetensors",
	"CounterfeitV30_v30.safetensors"
];
const modelDisplayNameList = [
	"SweetSugarSyndrome v1.5",
	"MeinaMix V11",
	"MeinaMix V12 Final",
	"Anything V3 Plus",
	"Anything V5",
	"CuteYukiMix X",
	"CuteYukiMix Nai V3Style",
	"CuteYukiMix MidChapter3",
	"Counterfeit V3"
];

const samplerList = [
	"euler",
	"euler_ancestral",
	"dpmpp_2m",
	"dpmpp_sde",
	"dpmpp_2m_sde",
	"dpmpp_3m_sde",
	"ddim",
	"uni_pc",
	"dpm_adaptive",
];
const samplerDisplayNameList = [
	"Euler",
	"Euler Ancestral",
	"DPM++ 2M",
	"DPM++ SDE",
	"DPM++ 2M SDE",
	"DPM++ 3M SDE",
	"DDIM",
	"UniPC",
	"DPM Adaptive",
];

const optimizationPositiveTags = "masterpiece, best quality, Amazing, finely detail, Depth of field, extremely detailed CG unity 8k wallpaper, ";
const optimizationNegativeTags = "multiple breasts, (mutated hands and fingers: 1.5), (long body: 1.3), (mutation, poorly drawn: 1.2) , black-white, bad anatomy, liquid body, liquid tongue, disfigured, malformed, mutated, anatomical nonsense, text font ui, error, malformed hands, long neck, blurred, lowers, lowres, bad anatomy, bad proportions, bad shadow, uncoordinated body, unnatural body, fused breasts, bad breasts, huge breasts, poorly drawn breasts, extra breasts, liquid breasts, heavy breasts, missing breasts, huge haunch, huge thighs, huge calf, bad hands, fused hand, missing hand, disappearing arms, disappearing thigh, disappearing calf, disappearing legs, fused ears, bad ears, poorly drawn ears, extra ears, liquid ears, heavy ears, missing ears, fused animal ears, bad animal ears, poorly drawn animal ears, extra animal ears, liquid animal ears, heavy animal ears, missing animal ears, text, ui, error, missing fingers, missing limb, fused fingers, one hand with more than 5 fingers, one hand with less than 5 fingers, one hand owith more than 5 digit, one hand with less than 5 digit, extra digit, fewer digits, fused digit, missing digit, bad digit, liquid digit, colorful tongue, black tongue, cropped, watermark, username, blurry, JPEG artifacts, signature, 3D, 3D game, 3D game scene, 3D character, malformed feet, extra feet, bad feet, poorly drawn feet, fused feet, missing feet, extra shoes, bad shoes, fused shoes, more than two shoes, poorly drawn shoes, bad gloves, poorly drawn gloves, fused gloves, bad cum, poorly drawn cum, fused cum, bad hairs, poorly drawn hairs, fused hairs, big muscles, ugly, bad face, fused face, poorly drawn face, cloned face, big face, long face, bad eyes, fused eyes poorly drawn eyes, extra eyes, malformed limbs, "

const myId = localStorage.getItem("user_id");

const MyRequests = () => {
	document.title = `我的请求 - AI绘图 - chy.web`;
	
	const [requestList, setRequestList] = useState(undefined);
	const [showInfo, setShowInfo] = useState(false);
	const [infoData, setInfoData] = useState(null);
	const [deletingId, setDeletingId] = useState(null);
	
	useEffect(() => {
		axios.get("/api/ai-art/request").then(res => {
			if (res.data.status === 0) {
				setRequestList(null);
			} else {
				setRequestList(res.data.result ?? []);
			}
		});
	}, []);
	
	if (!requestList) {
		return null;
	}
	
	if (requestList.length === 0)
		return <Typography alignSelf="center" sx={{mt: 2}} color="text.secondary">这里还空空如也呢~</Typography>;
	
	return (
		<>
			<Card variant="outlined" sx={{width: "100%"}}>
				<List sx={{p: 0}}>
					<TransitionGroup>
						{requestList.map((item, index) => (
							<Collapse key={item.id}>
								{index > 0 && <Divider/>}
								<ListItem>
									<ListItemText
										primary={<Typography noWrap>{item.positive}</Typography>}
										secondary={convertDateToLocaleAbsoluteString(item.time)}
									/>
									<Tooltip title={item.status === 1 ? "正在生成中..." : "正在排队中..."}>
										<IconButton disableTouchRipple>
											{item.status === 1 ? <CircularProgress size={24}/> : <HourglassBottomOutlined/>}
										</IconButton>
									</Tooltip>
									<IconButton onClick={() => {
										setInfoData(item);
										setShowInfo(true);
									}}>
										<Info/>
									</IconButton>
									<IconButton color="error" disabled={item.status === 1} onClick={() => {
										setDeletingId(item.id);
										axios.post("/api/ai-art/request/delete", {id: item.id}, {
											headers: {
												"Content-Type": "application/json",
											},
										}).then(res => {
											enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
											setDeletingId(null);
											if (res.data.status === 1) {
												setRequestList([...requestList].filter(current => current.id !== item.id));
											}
										});
									}}>
										{deletingId === item.id ? <CircularProgress size={24} color="error"/> : <DeleteOutlined/>}
									</IconButton>
								</ListItem>
							</Collapse>
						))}
					</TransitionGroup>
				</List>
				<Dialog open={showInfo} onClose={() => setShowInfo(false)}>
					<DialogTitle>详细信息</DialogTitle>
					{Boolean(infoData) && <DialogContent>
						模型：{modelDisplayNameList[modelList.indexOf(infoData.modelName)]}<br/>
						尺寸：{infoData.width}*{infoData.height}<br/>
						创建时间：{convertDateToLocaleOffsetString(infoData.time)}<br/>
						迭代步数：{infoData.step}<br/>
						CFG Scale：{infoData.cfg}<br/>
						种子：{infoData.seed}<br/>
						采样器：{`${samplerDisplayNameList[samplerList.indexOf(infoData.samplerName)]}
								${infoData.scheduler[0].toUpperCase()}${infoData.scheduler.slice(1)}`}<br/>
						图片数量：{infoData.batchSize}
						<Divider sx={{my: 1}}/>
						正面描述：{infoData.positive}<br/>
						负面描述：{infoData.negative}
					</DialogContent>}
					<DialogActions>
						<Button onClick={() => setShowInfo(false)}>关闭</Button>
					</DialogActions>
				</Dialog>
			</Card>
		</>
	);
}

const downloadImage = (authorId, imageId) => {
	const a = document.createElement('a');
	a.href = `/api/ai-art-works/${authorId}/${imageId}.webp`;
	a.download = `${imageId}.webp`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

const GeneratedResults = () => {
	document.title = `我的作品 - AI绘图 - chy.web`;
	
	const queryClient = useQueryClient();
	
	const [showImagePreview, setShowImagePreview] = useState(false);
	const [imagePreviewData, setImagePreviewData] = useState(null);
	const [showDeletingDialog, setShowDeletingDialog] = useState(false);
	const [deletingImageId, setDeletingImageId] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [imageList, setImageList] = useState(undefined);
	
	const [selectedImages, setSelectedImages] = useState(new Set());
	
	const [showMultipleDeletingDialog, setShowMultipleDeletingDialog] = useState(false);
	const [isMultipleDeleting, setIsMultipleDeleting] = useState(false);
	const [isBusy, setIsBusy] = useState(false);
	
	const [hoveredImage, setHoveredImage] = useState(null);
	const contextMenuTimeout = useRef(null);
	const isLongPress = useRef(false);
	
	const {data, fetchNextPage, isLoading, isFetching, hasNextPage} = useInfiniteQuery({
		queryKey: ["ai-art", "work"],
		queryFn: ({pageParam}) => axios.get(`/api/ai-art/work/${pageParam}`).then(res => res.data.result),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => lastPage.length === 0 ? undefined : allPages.length,
	});
	
	const loadMoreRef = useRef(null);
	
	useEffect(() => {
		if (loadMoreRef.current) {
			const pageLoadingObserver = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && !isFetching && hasNextPage) {
					fetchNextPage();
				}
			}, {
				rootMargin: "200px",
			});
			pageLoadingObserver.observe(loadMoreRef.current);
			return () => pageLoadingObserver.disconnect();
		}
	}, [fetchNextPage, hasNextPage, isFetching]);
	
	useLayoutEffect(() => {
		setImageList(data?.pages?.flat());
	}, [data]);
	
	const toggleSelectImage = (id) => {
		setSelectedImages(prevSelected => {
			const newSelected = new Set(prevSelected);
			if (newSelected.has(id)) {
				newSelected.delete(id);
			} else {
				newSelected.add(id);
			}
			return newSelected;
		});
	};
	
	useEffect(() => {
		window.addEventListener("keydown", (event) => {
			if (event.key === "Escape") {
				setSelectedImages(new Set());
			}
		});
	}, []);
	
	const updateImageList = useCallback((func) => {
		setImageList(imageList => imageList.map(func));
		queryClient.setQueryData(["ai-art", "work"], (data) => ({
			pages: data?.pages.map(page => page.map(func)),
			pageParams: data.pageParams,
		}));
	}, [queryClient]);
	
	const toggleIsBusy = useRef(debounce(isBusy => setIsBusy(isBusy), 100));
	
	if (!imageList) {
		return <LoadMoreIndicator isLoading={false} isFetching={true}/>;
	}
	
	if (imageList.length === 0) {
		return <Typography alignSelf="center" sx={{mt: 2}} color="text.secondary">这里还空空如也呢~</Typography>;
	}
	
	return (
		<Box>
			<Masonry
				breakpointCols={{
					default: 4,
					1000: 3,
					700: 2,
					350: 1,
				}}
				className="my-masonry-grid"
				columnClassName="my-masonry-grid_column"
			>
				{imageList.map((item) => (
					<Grow in={true} key={item.imageId}>
						<Box
							sx={{position: "relative"}}
							onPointerEnter={(event) => event.pointerType === "mouse" && setHoveredImage(item.imageId)}
							onPointerLeave={(event) => event.pointerType === "mouse" && setHoveredImage(null)}
						>
							<ButtonBase
								sx={{borderRadius: "15px", m: 0.5}}
								onClick={() => {
									if (selectedImages.size > 0) {
										toggleSelectImage(item.imageId);
									} else {
										setImagePreviewData(item);
										setShowImagePreview(true);
									}
								}}
								onContextMenu={(event) => {
									event.preventDefault();
									if (!isIOS13) {
										toggleSelectImage(item.imageId);
									}
								}}
								onTouchStart={() => {
									if (isIOS13 && !contextMenuTimeout.current) {
										contextMenuTimeout.current = setTimeout(() => {
											toggleSelectImage(item.imageId);
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
								<ImageListItem
									sx={{
										width: "100% !important",
										height: "100% !important",
										transform: selectedImages.has(item.imageId) ? "scale(0.9)" : "scale(1)",
										transition: "transform 150ms ease-in-out",
									}}
								>
									{selectedImages.has(item.imageId) &&
										<CheckCircle
											color="primary"
											sx={{
												position: "absolute",
												right: -8,
												top: -8,
												width: 32,
												height: 32,
												backgroundColor: (theme) => theme.palette.background.default,
												borderRadius: "50%",
											}}
										/>
									}
									{item.visibility === 1 &&
										<Visibility
											color="info"
											sx={{
												position: "absolute",
												left: 7,
												top: 2,
												width: 32,
												height: 32,
											}}
										/>
									}
									<img
										alt="Generated images"
										src={`/api/ai-art-works/${item.authorId}/${item.imageId}.webp`}
										style={{borderRadius: "15px", pointerEvents: "none"}}
									/>
									{hoveredImage === item.imageId &&
										<Box
											sx={{
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												height: "100%",
												background: `linear-gradient(to ${selectedImages.size === 0 ? "bottom" : "top"}, rgba(0, 0, 0, 0.5), rgba(255, 255, 255, 0) 30%)`,
												borderRadius: "15px",
											}}
										/>
									}
									<ImageListItemBar
										title={`${convertDateToLocaleOffsetString(item.creationDate)}`}
										sx={{
											borderBottomLeftRadius: "15px",
											borderBottomRightRadius: "15px",
										}}
									/>
								</ImageListItem>
							</ButtonBase>
							{hoveredImage === item.imageId &&
								<IconButton
									sx={{
										display: selectedImages.has(item.imageId) ? "none" : "flex",
										position: "absolute",
										right: 8,
										top: 8,
										width: 32,
										height: 32,
									}}
									onClick={(event) => {
										event.preventDefault();
										toggleSelectImage(item.imageId);
									}}
								>
									<CheckCircle sx={{color: (theme) => theme.palette.background.default}}/>
								</IconButton>
							}
						</Box>
					</Grow>
				))}
			</Masonry>
			<Box ref={loadMoreRef}>
				<LoadMoreIndicator isLoading={isLoading} isFetching={isFetching}/>
			</Box>
			<Backdrop open={isBusy} sx={{zIndex: 8964}}>
				<CircularProgress size={50}/>
			</Backdrop>
			<Drawer
				anchor="top"
				variant="persistent"
				open={selectedImages.size > 0}
				PaperProps={{
					sx: {
						borderBottomLeftRadius: "15px",
						borderBottomRightRadius: "15px",
						maxWidth: "max-content",
						mx: "auto",
					},
				}}
			>
				<Grid container padding={1} width="max-content">
					<IconButton
						sx={{flexDirection: "column", borderRadius: "50%", width: 100, height: 100, gap: 0.5}}
						onClick={() => {
							setSelectedImages(new Set());
						}}
					>
						<Close fontSize="large"/>
						<Typography fontSize={14}>取消</Typography>
					</IconButton>
					<IconButton
						sx={{flexDirection: "column", borderRadius: "50%", width: 100, height: 100, gap: 0.5}}
						onClick={() => {
							if (selectedImages.size !== imageList.length) {
								setSelectedImages(new Set(imageList.map((item) => item.imageId)));
							} else {
								setSelectedImages(new Set());
							}
						}}
					>
						<SelectAllOutlined fontSize="large"/>
						<Typography fontSize={14}>{selectedImages.size === imageList.length && "取消"}全选</Typography>
					</IconButton>
					<IconButton
						sx={{flexDirection: "column", borderRadius: "50%", width: 100, height: 100, gap: 0.5}}
						onClick={() => {
							setShowMultipleDeletingDialog(true);
						}}
					>
						<DeleteOutlined fontSize="large"/>
						<Typography fontSize={14}>删除</Typography>
					</IconButton>
					<IconButton
						sx={{flexDirection: "column", borderRadius: "50%", width: 100, height: 100, gap: 0.5}}
						onClick={() => {
							toggleIsBusy.current(true);
							
							axios.post("/api/ai-art/toggle-visibility", {idList: [...selectedImages], visibility: 1}, {
								headers: {
									"Content-Type": "application/json",
								},
							}).then(res => {
								toggleIsBusy.current(false);
								
								if (res.data.status === 0) {
									enqueueSnackbar(res.data.content, {variant: "error"});
								} else if (res.data.status === 1) {
									const succeededList = res.data.succeededList;
									
									for (const id of succeededList) {
										setSelectedImages(selectedImages => {
											selectedImages.delete(id);
											return selectedImages;
										});
									}
									
									updateImageList(item => succeededList.includes(item.imageId) ? {
										...item,
										visibility: 1,
									} : item);
								}
							});
						}}
					>
						<VisibilityOutlined fontSize="large"/>
						<Typography fontSize={14}>公开</Typography>
					</IconButton>
					<IconButton sx={{flexDirection: "column", borderRadius: "50%", width: 100, height: 100, gap: 0.5}} onClick={() => {
						toggleIsBusy.current(true);
						axios.post("/api/ai-art/toggle-visibility", {idList: [...selectedImages], visibility: 0}, {
							headers: {
								"Content-Type": "application/json",
							},
						}).then(res => {
							toggleIsBusy.current(false);
							
							if (res.data.status === 0) {
								enqueueSnackbar(res.data.content, {variant: "error"});
							} else if (res.data.status === 1) {
								const succeededList = res.data.succeededList;
								
								for (const id of succeededList) {
									setSelectedImages(selectedImages => {
										selectedImages.delete(id);
										return selectedImages;
									});
								}
								
								updateImageList(item => succeededList.includes(item.imageId) ? {
									...item,
									visibility: 0,
								} : item);
							}
						});
					}}>
						<VisibilityOffOutlined fontSize="large"/>
						<Typography fontSize={14}>隐藏</Typography>
					</IconButton>
					<IconButton
						sx={{flexDirection: "column", borderRadius: "50%", width: 100, height: 100, gap: 0.5}}
						onClick={() => {
							for (const id of selectedImages) {
								downloadImage(myId, id);
							}
						}}
					>
						<FileDownloadOutlined fontSize="large"/>
						<Typography fontSize={14}>下载</Typography>
					</IconButton>
				</Grid>
			</Drawer>
			<Dialog open={showMultipleDeletingDialog} onClose={() => setShowMultipleDeletingDialog(false)} disableScrollLock fullWidth>
				<DialogTitle>要删除这 {selectedImages.size} 张图片吗？</DialogTitle>
				<DialogActions>
					<Button onClick={() => setShowMultipleDeletingDialog(false)}>取消</Button>
					<LoadingButton color="error" loading={isMultipleDeleting} onClick={() => {
						setIsMultipleDeleting(true);
						axios.post("/api/ai-art/work/delete", {idList: [...selectedImages]}, {
							headers: {
								"Content-Type": "application/json",
							},
						}).then(res => {
							if (res.data.status === 0) {
								enqueueSnackbar(res.data.content, {variant: "error"});
							} else if (res.data.status === 1) {
								const succeededList = res.data.succeededList;
								
								for (const id of succeededList) {
									setSelectedImages(selectedImages => {
										selectedImages.delete(id);
										return selectedImages;
									});
								}
								
								setImageList(imageList => imageList.filter(item => !succeededList.includes(item.imageId)));
								
								setIsMultipleDeleting(false);
								setShowMultipleDeletingDialog(false);
								
								queryClient.setQueryData(["ai-art", "work"], (data) => ({
									pages: data?.pages.map(page => page.filter(item => !succeededList.includes(item.imageId))),
									pageParams: data.pageParams,
								}));
							}
						});
					}}>删除</LoadingButton>
				</DialogActions>
			</Dialog>
			<Dialog
				open={showImagePreview}
				onClose={() => setShowImagePreview(false)}
				fullScreen
				onKeyDown={(event) => {
					if (event.key === "ArrowLeft" && imageList[0].imageId !== imagePreviewData.imageId) {
						setImagePreviewData(imageList[imageList.indexOf(imagePreviewData) - 1]);
					} else if (event.key === "ArrowRight" && imageList[imageList.length - 1].imageId !== imagePreviewData.imageId) {
						setImagePreviewData(imageList[imageList.indexOf(imagePreviewData) + 1]);
					}
				}}
			>
				{imagePreviewData != null && <Grid container direction="column" sx={{width: "100%", height: "100%"}} wrap="nowrap">
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
						<Grow in={true}>
							<img
								src={`/api/ai-art-works/${imagePreviewData.authorId}/${imagePreviewData.imageId}.webp`}
								alt="Image preview"
								style={{
									width: "100%",
									height: "100%",
									objectFit: "contain",
									transform: "translate3d(0, 0, 0)",
								}}
							/>
						</Grow>
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
						{imageList[0].imageId !== imagePreviewData.imageId &&
							<IconButton
								onClick={() => setImagePreviewData(imageList[imageList.indexOf(imagePreviewData) - 1])}
								style={{
									position: "absolute",
									left: 10,
									color: "white",
									backgroundColor: "rgba(0, 0, 0, 0.5)",
								}}
							>
								<NavigateBefore/>
							</IconButton>
						}
						{imageList[imageList.length - 1].imageId !== imagePreviewData.imageId &&
							<IconButton
								onClick={() => setImagePreviewData(imageList[imageList.indexOf(imagePreviewData) + 1])}
								style={{
									position: "absolute",
									right: 10,
									color: "white",
									backgroundColor: "rgba(0, 0, 0, 0.5)",
								}}
							>
								<NavigateNext/>
							</IconButton>
						}
						<Grid
							container
							gap={1}
							sx={{
								position: "absolute",
								bottom: 10,
								right: 10,
							}}
						>
							{imagePreviewData.visibility === 1 && <Tooltip title={`${imagePreviewData.promptVisibility === 1 ? "隐藏" : "公开"}提示词`}>
								<IconButton
									onClick={() => {
										const newVisibility = 1 - imagePreviewData.promptVisibility;
										
										axios.post("/api/ai-art/toggle-prompt-visibility", {
											id: imagePreviewData.imageId,
											visibility: newVisibility,
										}, {
											headers: {
												"Content-Type": "application/json",
											},
										}).then(res => {
											enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
											if (res.data.status === 1) {
												const newImagePreviewData = {
													...imagePreviewData,
													promptVisibility: newVisibility,
												};
												
												setImagePreviewData(newImagePreviewData);
												updateImageList(item => item.imageId === newImagePreviewData.imageId ? newImagePreviewData : item);
											}
										});
									}}
									style={{
										color: "white",
										backgroundColor: "rgba(0, 0, 0, 0.5)",
									}}
								>
									{imagePreviewData.promptVisibility === 1 ? <LockOpenOutlined/> : <Lock/>}
								</IconButton>
							</Tooltip>}
							<Tooltip title="下载图片">
								<IconButton
									onClick={() => {
										downloadImage(imagePreviewData.authorId, imagePreviewData.imageId);
									}}
									style={{
										color: "white",
										backgroundColor: "rgba(0, 0, 0, 0.5)",
									}}
								>
									<FileDownloadOutlined/>
								</IconButton>
							</Tooltip>
							<Tooltip title="删除图片">
								<IconButton
									onClick={() => {
										setDeletingImageId(imagePreviewData.imageId);
										setShowDeletingDialog(true);
									}}
									color="error"
									style={{
										backgroundColor: "rgba(0, 0, 0, 0.5)",
									}}
								>
									<DeleteOutlined/>
								</IconButton>
							</Tooltip>
						</Grid>
						<Grid
							container
							spacing={1}
							sx={{
								position: "absolute",
								bottom: 10,
								left: 10,
							}}
						>
							<Tooltip title="赞">
								<Badge
									badgeContent={imagePreviewData.likes}
									color="primary"
									overlap="circular"
								>
									<IconButton
										onClick={() => {
											axios.post("/api/ai-art/community/toggle-liked", {imageId: imagePreviewData.imageId}, {
												headers: {
													"Content-Type": "application/json",
												},
											}).then(res => {
												if (res.data.status === 0) {
													enqueueSnackbar(res.data.content, {variant: "error"});
												} else if (res.data.status === 1) {
													const newImagePreviewData = {
														...imagePreviewData,
														imageId: imagePreviewData.imageId,
														alreadyLiked: !imagePreviewData.alreadyLiked,
														alreadyDisliked: false,
														likes: imagePreviewData.likes + (imagePreviewData.alreadyLiked ? -1 : 1),
														dislikes: imagePreviewData.dislikes - imagePreviewData.alreadyDisliked,
													};
													setImagePreviewData(newImagePreviewData);
													updateImageList(item => (item.imageId === newImagePreviewData.imageId ? newImagePreviewData : item));
												}
											});
										}}
										style={{
											color: "white",
											backgroundColor: "rgba(0, 0, 0, 0.5)",
										}}
									>
										{imagePreviewData.alreadyLiked ? <ThumbUpAlt/> : <ThumbUpOffAlt/>}
									</IconButton>
								</Badge>
							</Tooltip>
							<Tooltip title="踩">
								<Badge
									badgeContent={imagePreviewData.dislikes}
									color="primary"
									overlap="circular"
								>
									<IconButton
										onClick={() => {
											axios.post("/api/ai-art/community/toggle-disliked", {imageId: imagePreviewData.imageId}, {
												headers: {
													"Content-Type": "application/json",
												},
											}).then(res => {
												if (res.data.status === 0) {
													enqueueSnackbar(res.data.content, {variant: "error"});
												} else if (res.data.status === 1) {
													const newImagePreviewData = {
														...imagePreviewData,
														imageId: imagePreviewData.imageId,
														alreadyDisliked: !imagePreviewData.alreadyDisliked,
														alreadyLiked: false,
														dislikes: imagePreviewData.dislikes + (imagePreviewData.alreadyDisliked ? -1 : 1),
														likes: imagePreviewData.likes - imagePreviewData.alreadyLiked,
													};
													setImagePreviewData(newImagePreviewData);
													updateImageList(item => (item.imageId === newImagePreviewData.imageId ? newImagePreviewData : item));
												}
											});
										}}
										style={{
											color: "white",
											backgroundColor: "rgba(0, 0, 0, 0.5)",
										}}
									>
										{imagePreviewData.alreadyDisliked ? <ThumbDownAlt/> : <ThumbDownOffAlt/>}
									</IconButton>
								</Badge>
							</Tooltip>
						</Grid>
					</Box>
					<Accordion variant="outlined" sx={{border: 0}} disableGutters>
						<AccordionSummary expandIcon={<ExpandMoreOutlined/>}>
							详细信息
						</AccordionSummary>
						<AccordionDetails sx={{maxHeight: "calc(40vh - 48px)", overflowY: "auto"}}>
							模型：{modelDisplayNameList[modelList.indexOf(imagePreviewData.modelName)]}<br/>
							尺寸：{imagePreviewData.width}*{imagePreviewData.height}<br/>
							生成时间：{convertDateToLocaleOffsetString(imagePreviewData.creationDate)}<br/>
							{imagePreviewData.visibility === 0 ? "暂未公开" : `首次公开时间：${convertDateToLocaleOffsetString(imagePreviewData.firstPublicationDate)}`}<br/>
							迭代步数：{imagePreviewData.step}<br/>
							CFG Scale：{imagePreviewData.cfg}<br/>
							种子：{imagePreviewData.seed}<br/>
							采样器：{`${samplerDisplayNameList[samplerList.indexOf(imagePreviewData.samplerName)]}
								${imagePreviewData.scheduler[0].toUpperCase()}${imagePreviewData.scheduler.slice(1)}`}
							<Divider sx={{my: 1}}/>
							正面描述：{imagePreviewData.positive}<br/>
							负面描述：{imagePreviewData.negative}
						</AccordionDetails>
					</Accordion>
				</Grid>}
			</Dialog>
			<Dialog open={showDeletingDialog} onClose={() => setShowDeletingDialog(false)}>
				<DialogTitle>
					要删除这张图片吗？
				</DialogTitle>
				<img src={`/api/ai-art-works/${myId}/${deletingImageId}.webp`} alt="Deleting Image"/>
				<DialogActions>
					<Button onClick={() => setShowDeletingDialog(false)}>取消</Button>
					<LoadingButton color="error" loading={isDeleting} onClick={() => {
						setIsDeleting(true);
						axios.post("/api/ai-art/work/delete", {idList: [deletingImageId]}, {
							headers: {
								"Content-Type": "application/json",
							},
						}).then(res => {
							if (res.data.status === 0) {
								enqueueSnackbar(res.data.content, {variant: "error"});
							} else if (res.data.status === 1) {
								if (res.data.succeededList.length === 1) {
									setImageList(imageList => imageList.filter(item => item.imageId !== deletingImageId));
									
									queryClient.setQueryData(["ai-art", "work"], (data) => ({
										pages: data?.pages.map(page => page.filter(item => item.imageId !== deletingImageId)),
										pageParams: data.pageParams,
									}));
									``
									setIsDeleting(false);
									setShowDeletingDialog(false);
									setShowImagePreview(false);
								}
							}
						});
					}}>删除</LoadingButton>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

const TextToImageUI = () => {
	document.title = `文生图 - AI绘图 - chy.web`;
	
	const drawingParams = useMemo(() => JSON.parse(localStorage.getItem("aiArtDrawing")) || {}, []);
	const updateDrawingParams = useCallback(() => localStorage.setItem("aiArtDrawing", JSON.stringify(drawingParams)), [drawingParams]);
	
	const [positivePrompt, setPositivePrompt] = useState(drawingParams.positive ?? "");
	const [negativePrompt, setNegativePrompt] = useState(drawingParams.negative ?? "");
	
	const [width, setWidth] = useState(drawingParams.width ?? 512);
	const [height, setHeight] = useState(drawingParams.height ?? 512);
	const [batchSize, setBatchSize] = useState(drawingParams.batchSize ?? 1)
	
	const [professionalMode, setProfessionalMode] = useState(drawingParams.professionalMode ?? false);
	const [steps, setSteps] = useState(drawingParams.steps ?? 30);
	const [cfg, setCfg] = useState(drawingParams.cfg ?? 7);
	
	const [modelName, setModelName] = useState(drawingParams.modelName ?? modelList[0]);
	const [samplerName, setSamplerName] = useState(drawingParams.samplerName ?? "dpmpp_2m");
	const [scheduler, setScheduler] = useState(drawingParams.scheduler ?? "karras");
	const [usePromptOptimization, setUsePromptOptimization] = useState(drawingParams.promptOptimization ?? false);
	
	const [submitLoading, setSubmitLoading] = useState(false);
	
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
	
	return (
		<Grid
			container
			spacing={2}
			component="form"
			direction={isSmallScreen ? "column-reverse" : "row"}
			justifyContent="flex-end"
			flex={1}
			height="100%"
			onSubmit={(event) => {
				event.preventDefault();
				setSubmitLoading(true);
				const formData = new FormData(event.currentTarget);
				if (usePromptOptimization) {
					formData.set("positive", optimizationPositiveTags + formData.get("positive"));
					formData.set("negative", optimizationNegativeTags + formData.get("negative"));
				}
				axios.post("/api/ai-art/submit", formData, {
					headers: {
						"Content-Type": "application/json",
					},
				}).then(res => {
					enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
					setSubmitLoading(false);
				});
			}}
		>
			<Card variant="outlined" sx={{width: isSmallScreen ? "100%" : 300, px: 3, py: 2.5}}>
				<Grid container direction="column" spacing={2}>
					<Grid container wrap="nowrap" alignItems="center" spacing={2}>
						<Typography>宽度</Typography>
						<Slider
							name="width"
							value={width}
							min={128}
							step={64}
							max={1024}
							onChange={(event, value) => {
								setWidth(value);
								drawingParams.width = value;
								updateDrawingParams();
							}}
							sx={{flex: 1}}
						/>
						<Typography>{width}</Typography>
					</Grid>
					<Grid container wrap="nowrap" alignItems="center" spacing={2}>
						<Typography>高度</Typography>
						<Slider
							name="height"
							value={height}
							min={128}
							step={64}
							max={1024}
							onChange={(event, value) => {
								setHeight(value);
								drawingParams.height = value;
								updateDrawingParams();
							}}
							sx={{flex: 1}}
						/>
						<Typography>{height}</Typography>
					</Grid>
					<Grid container alignItems="center" spacing={1}>
						图片数量：
						<ToggleButtonGroup
							sx={{flex: 1, height: 40}}
							color="primary"
							value={batchSize}
							exclusive
							onChange={(event, value) => {
								setBatchSize(value);
								drawingParams.batchSize = value;
								updateDrawingParams();
							}}
						>
							<ToggleButton value={1} sx={{flex: 1}}>1</ToggleButton>
							<ToggleButton value={2} sx={{flex: 1}}>2</ToggleButton>
							<ToggleButton value={3} sx={{flex: 1}}>3</ToggleButton>
							<ToggleButton value={4} sx={{flex: 1}}>4</ToggleButton>
						</ToggleButtonGroup>
						<TextField name="batchSize" value={batchSize} sx={{display: "none"}}/>
					</Grid>
					<Divider/>
					<Grid container alignItems="center" sx={{mt: -0.5}} spacing={1}>
						高级
						<Switch checked={professionalMode} onChange={(event, value) => {
							setProfessionalMode(value);
							drawingParams.professionalMode = value;
							updateDrawingParams();
						}}/>
					</Grid>
					<Grid container direction="column" spacing={2} display={professionalMode ? "flex" : "none"}>
						<Grid container wrap="nowrap" alignItems="center" spacing={2}>
							<Typography>步数</Typography>
							<Slider
								name="step"
								value={steps}
								min={10}
								max={40}
								onChange={(event, value) => {
									setSteps(value);
									drawingParams.steps = value;
									updateDrawingParams();
								}}
								sx={{flex: 1}}
							/>
							<Typography>{steps}</Typography>
						</Grid>
						<Grid container wrap="nowrap" alignItems="center" spacing={2}>
							<Typography>CFG</Typography>
							<Slider
								name="cfg"
								value={cfg}
								min={0}
								max={30}
								onChange={(event, value) => {
									setCfg(value);
									drawingParams.cfg = value;
									updateDrawingParams();
								}}
								sx={{flex: 1}}
							/>
							<Typography>{cfg}</Typography>
						</Grid>
						<Grid container direction="column" spacing={2.5} sx={{mt: 1}}>
							<FormControl fullWidth>
								<InputLabel id="model-label">模型</InputLabel>
								<Select
									labelId="model-label"
									label="模型"
									name="modelName"
									variant="outlined"
									value={modelName}
									onChange={(event) => {
										setModelName(event.target.value);
										drawingParams.modelName = event.target.value;
										updateDrawingParams();
									}}
								>
									{modelList.map((item, index) => (
										<MenuItem key={item} value={item}>{modelDisplayNameList[index]}</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControl fullWidth>
								<InputLabel id="sampler-label">采样器</InputLabel>
								<Select
									labelId="sampler-label"
									label="采样器"
									name="samplerName"
									variant="outlined"
									value={samplerName}
									onChange={(event) => {
										setSamplerName(event.target.value);
										drawingParams.samplerName = event.target.value;
										updateDrawingParams();
									}}
								>
									{samplerList.map((item, index) => (
										<MenuItem key={item} value={item}>{samplerDisplayNameList[index]}</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControl fullWidth>
								<InputLabel id="scheduler-label">调度器</InputLabel>
								<Select
									labelId="scheduler-label"
									label="调度器"
									name="scheduler"
									variant="outlined"
									value={scheduler}
									onChange={(event) => {
										setScheduler(event.target.value);
										drawingParams.scheduler = event.target.value;
										updateDrawingParams();
									}}
								>
									<MenuItem value="normal">Normal</MenuItem>
									<MenuItem value="karras">Karras</MenuItem>
									<MenuItem value="exponential">Exponential</MenuItem>
								</Select>
							</FormControl>
							<TextField label="种子" fullWidth name="seed"/>
						</Grid>
					</Grid>
				</Grid>
			</Card>
			<Card variant="outlined" sx={{padding: 2.5, flex: isSmallScreen ? "normal" : 1}}>
				<Grid container direction="column" spacing={2}>
					<TextField
						name="positive"
						label="图片描述"
						placeholder="英文单词或短语，用逗号隔开"
						value={positivePrompt}
						onChange={(event) => {
							setPositivePrompt(event.target.value);
							drawingParams.positive = event.target.value;
							updateDrawingParams();
						}}
						multiline
						maxRows={10}
						minRows={3}
						fullWidth
						sx={{mb: 0.5}}
					/>
					<TextField
						name="negative"
						label="负面描述"
						placeholder="英文单词或短语，用逗号隔开"
						value={negativePrompt}
						onChange={(event) => {
							setNegativePrompt(event.target.value);
							drawingParams.negative = event.target.value;
							updateDrawingParams();
						}}
						multiline
						maxRows={10}
						minRows={2}
						fullWidth
					/>
					<Grid container justifyContent="space-between">
						<Grid container alignItems="center" spacing={1}>
							提示词增强
							<Switch checked={usePromptOptimization} onChange={(event, value) => {
								setUsePromptOptimization(value);
								drawingParams.promptOptimization = value;
								updateDrawingParams();
							}}/>
						</Grid>
						<LoadingButton
							variant="contained"
							type="submit"
							startIcon={<DrawOutlined/>}
							loading={submitLoading}
							loadingPosition="start"
						>
							绘制
						</LoadingButton>
					</Grid>
				</Grid>
			</Card>
		</Grid>
	);
}

const Community = () => {
	document.title = `创意工坊 - AI绘图 - chy.web`;
	
	const {workId} = useParams();
	
	const communityParams = useMemo(() => JSON.parse(localStorage.getItem("aiArtCommunity")) || {}, []);
	const updateCommunityParams = useCallback(() => localStorage.setItem("aiArtCommunity", JSON.stringify(communityParams)), [communityParams]);
	
	const [viewRange, setViewRange] = useState(communityParams.viewRange ?? "get-all");
	const [sortMethod, setSortMethod] = useState(communityParams.sortMethod ?? "latest");
	
	const {data, isLoading, error} = useQuery({
		queryKey: [`ai-art-community-${viewRange}-${sortMethod}`],
		queryFn: () => axios.get(`/api/ai-art/community/${viewRange}/${sortMethod}/0`).then(res => res.data),
		staleTime: Infinity,
	});
	
	const [imageList, setImageList] = useState(null);
	const [showImagePreview, setShowImagePreview] = useState(false);
	const [imagePreviewData, setImagePreviewData] = useState(null);
	const [hoveredImage, setHoveredImage] = useState(null);
	const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("lg"));
	
	const pageNumberCurrent = useRef(0);
	const pageNumberNew = useRef(0);
	const lastImageRef = useRef(null);
	const pageLoadingObserver = useMemo(() => new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting && pageNumberNew.current === pageNumberCurrent.current) {
			pageNumberNew.current = pageNumberCurrent.current + 1;
			axios.get(`/api/ai-art/community/${viewRange}/${sortMethod}/${pageNumberNew.current}`).then(res => {
				if (res.data.result && res.data.result.length > 0)
					setImageList(imageList => [...imageList, ...res.data.result]);
			});
		}
	}), [viewRange, sortMethod]);
	
	useEffect(() => {
	}, [workId]);
	
	useEffect(() => {
		if (data)
			setImageList(data.result);
	}, [data]);
	
	useEffect(() => {
		if (lastImageRef.current) {
			pageNumberCurrent.current = pageNumberNew.current;
			pageLoadingObserver.disconnect();
			pageLoadingObserver.observe(lastImageRef.current);
		}
	}, [imageList, pageLoadingObserver]);
	
	if (isLoading || error || !imageList)
		return null;
	
	return (
		<Grid container direction="column" alignItems="flex-end" wrap="nowrap" width="100%">
			<Grid container spacing={1} sx={{mt: isSmallScreen ? 0 : -7, mb: isSmallScreen ? 1 : 2}}>
				<FormControl>
					<InputLabel id="sort-method-label">排序规则</InputLabel>
					<Select
						variant="outlined"
						size={isSmallScreen ? "medium" : "small"}
						labelId="sort-method-label"
						label="排序规则"
						value={sortMethod}
						onChange={(event) => {
							setSortMethod(event.target.value);
							communityParams.sortMethod = event.target.value;
							updateCommunityParams();
						}}
					>
						<MenuItem value="latest">最新</MenuItem>
						<MenuItem value="most-popular">最受欢迎</MenuItem>
					</Select>
				</FormControl>
				<FormControl>
					<InputLabel id="view-range-label">查看范围</InputLabel>
					<Select
						variant="outlined"
						size={isSmallScreen ? "medium" : "small"}
						labelId="view-range-label"
						label="查看范围"
						value={viewRange}
						onChange={(event) => {
							setViewRange(event.target.value);
							communityParams.viewRange = event.target.value;
							updateCommunityParams();
							pageNumberNew.current = 0;
							pageNumberCurrent.current = 0;
						}}
					>
						<MenuItem value="get-all">所有人</MenuItem>
						<MenuItem value="get-followed">关注的人</MenuItem>
					</Select>
				</FormControl>
			</Grid>
			{imageList.length === 0 ? (
				<Typography alignSelf="center" sx={{mt: 2}} color="text.secondary">这里还空空如也呢~</Typography>
			) : (<>
				<Masonry
					breakpointCols={{
						default: 4,
						1000: 3,
						700: 2,
						350: 1,
					}}
					className="my-masonry-grid"
					columnClassName="my-masonry-grid_column"
				>
					{imageList.map((item, imageIndex) => (
						<Grow in={true} key={item.imageId}>
							<ButtonBase
								ref={imageIndex === imageList.length - 1 ? lastImageRef : undefined}
								sx={{borderRadius: "15px", m: 0.5}}
								onClick={() => {
									setImagePreviewData(item);
									setShowImagePreview(true);
								}}
								onContextMenu={(event) => event.preventDefault()}
							>
								<ImageListItem
									sx={{
										width: "100% !important",
										height: "100% !important",
									}}
									onPointerEnter={(event) => event.pointerType === "mouse" && setHoveredImage(item.imageId)}
									onPointerLeave={(event) => event.pointerType === "mouse" && setHoveredImage(null)}
								>
									<img
										alt="Generated images"
										src={`/api/ai-art-works/${item.authorId}/${item.imageId}.webp`}
										style={{borderRadius: "15px", pointerEvents: "none"}}
									/>
									{hoveredImage === item.imageId &&
										<Box
											sx={{
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												height: "100%",
												background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(255, 255, 255, 0) 30%)`,
												borderRadius: "15px",
											}}
										/>
									}
									<ImageListItemBar
										title={
											<Grid container justifyContent="space-between" alignItems="center" wrap="nowrap" gap={0.25}>
												<SimpleUserItem username={item.username} displayName={item.displayName}
												                avatarVersion={item.avatarVersion} badge={item.badge} disableNavigate/>
												<Typography variant="caption">
													{convertDateToLocaleOffsetString(item.firstPublicationDate)}
												</Typography>
											</Grid>
										}
										sx={{
											borderBottomLeftRadius: "15px",
											borderBottomRightRadius: "15px",
											'& .MuiImageListItemBar-titleWrap': {
												px: 1.5,
												pt: "6px",
												pb: "6px",
											},
										}}
									/>
								</ImageListItem>
							</ButtonBase>
						</Grow>
					))}
				</Masonry>
				<Dialog
					open={showImagePreview}
					onClose={() => setShowImagePreview(false)}
					fullScreen
					onKeyDown={(event) => {
						if (event.key === "ArrowLeft" && imageList[0].imageId !== imagePreviewData.imageId) {
							setImagePreviewData(imageList[imageList.indexOf(imagePreviewData) - 1]);
						} else if (event.key === "ArrowRight" && imageList[imageList.length - 1].imageId !== imagePreviewData.imageId) {
							setImagePreviewData(imageList[imageList.indexOf(imagePreviewData) + 1]);
						}
					}}
				>
					{imagePreviewData != null && <Grid container direction="column" sx={{width: "100%", height: "100%"}} wrap="nowrap">
						<Box sx={{
							flex: 1,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							overflow: "hidden",
							position: "relative",
						}}>
							<Grow in={true}>
								<img
									src={`/api/ai-art-works/${imagePreviewData.authorId}/${imagePreviewData.imageId}.webp`}
									alt="Image preview"
									style={{
										width: "100%",
										height: "100%",
										objectFit: "contain",
										transform: "translate3d(0, 0, 0)",
									}}
								/>
							</Grow>
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
							{imageList[0].imageId !== imagePreviewData.imageId &&
								<IconButton
									onClick={() => setImagePreviewData(imageList[imageList.indexOf(imagePreviewData) - 1])}
									style={{
										position: "absolute",
										left: 10,
										color: "white",
										backgroundColor: "rgba(0, 0, 0, 0.5)",
									}}
								>
									<NavigateBefore/>
								</IconButton>
							}
							{imageList[imageList.length - 1].imageId !== imagePreviewData.imageId &&
								<IconButton
									onClick={() => setImagePreviewData(imageList[imageList.indexOf(imagePreviewData) + 1])}
									style={{
										position: "absolute",
										right: 10,
										color: "white",
										backgroundColor: "rgba(0, 0, 0, 0.5)",
									}}
								>
									<NavigateNext/>
								</IconButton>
							}
							<Grid
								container
								spacing={1}
								sx={{
									position: "absolute",
									bottom: 10,
									right: 10,
								}}
							>
								<Tooltip title="下载图片">
									<IconButton
										onClick={() => {
											downloadImage(imagePreviewData.authorId, imagePreviewData.imageId);
										}}
										style={{
											color: "white",
											backgroundColor: "rgba(0, 0, 0, 0.5)",
										}}
									>
										<FileDownloadOutlined/>
									</IconButton>
								</Tooltip>
								<Tooltip title="赞">
									<Badge
										badgeContent={imagePreviewData.likes}
										color="primary"
										overlap="circular"
									>
										<IconButton
											onClick={() => {
												axios.post("/api/ai-art/community/toggle-liked", {imageId: imagePreviewData.imageId}, {
													headers: {
														"Content-Type": "application/json",
													},
												}).then(res => {
													if (res.data.status === 0) {
														enqueueSnackbar(res.data.content, {variant: "error"});
													} else if (res.data.status === 1) {
														const newImagePreviewData = {
															...imagePreviewData,
															imageId: imagePreviewData.imageId,
															alreadyLiked: !imagePreviewData.alreadyLiked,
															alreadyDisliked: false,
															likes: imagePreviewData.likes + (imagePreviewData.alreadyLiked ? -1 : 1),
															dislikes: imagePreviewData.dislikes - imagePreviewData.alreadyDisliked,
														};
														setImagePreviewData(newImagePreviewData);
														setImageList(imageList =>
															imageList.map(item => (item.imageId === newImagePreviewData.imageId ? newImagePreviewData : item)));
													}
												});
											}}
											style={{
												color: "white",
												backgroundColor: "rgba(0, 0, 0, 0.5)",
											}}
										>
											{imagePreviewData.alreadyLiked ? <ThumbUpAlt/> : <ThumbUpOffAlt/>}
										</IconButton>
									</Badge>
								</Tooltip>
								<Tooltip title="踩">
									<Badge
										badgeContent={imagePreviewData.dislikes}
										color="primary"
										overlap="circular"
									>
										<IconButton
											onClick={() => {
												axios.post("/api/ai-art/community/toggle-disliked", {imageId: imagePreviewData.imageId}, {
													headers: {
														"Content-Type": "application/json",
													},
												}).then(res => {
													if (res.data.status === 0) {
														enqueueSnackbar(res.data.content, {variant: "error"});
													} else if (res.data.status === 1) {
														const newImagePreviewData = {
															...imagePreviewData,
															imageId: imagePreviewData.imageId,
															alreadyDisliked: !imagePreviewData.alreadyDisliked,
															alreadyLiked: false,
															dislikes: imagePreviewData.dislikes + (imagePreviewData.alreadyDisliked ? -1 : 1),
															likes: imagePreviewData.likes - imagePreviewData.alreadyLiked,
														};
														setImagePreviewData(newImagePreviewData);
														setImageList(imageList =>
															imageList.map(item => (item.imageId === newImagePreviewData.imageId ? newImagePreviewData : item)));
													}
												});
											}}
											style={{
												color: "white",
												backgroundColor: "rgba(0, 0, 0, 0.5)",
											}}
										>
											{imagePreviewData.alreadyDisliked ? <ThumbDownAlt/> : <ThumbDownOffAlt/>}
										</IconButton>
									</Badge>
								</Tooltip>
							</Grid>
						</Box>
						<Accordion variant="outlined" sx={{border: 0}} disableGutters>
							<AccordionSummary expandIcon={<ExpandMoreOutlined/>}>
								详细信息
							</AccordionSummary>
							<AccordionDetails sx={{maxHeight: "calc(40vh - 48px)", overflowY: "auto"}}>
								<Grid container alignItems="center">
									<Typography sx={{mt: -0.25}}>
										作者：
									</Typography>
									<SimpleUserItem username={imagePreviewData.username} displayName={imagePreviewData.displayName}
									                avatarVersion={imagePreviewData.avatarVersion} badge={imagePreviewData.badge}/>
								</Grid>
								<Typography>
									模型：{modelDisplayNameList[modelList.indexOf(imagePreviewData.modelName)]}
								</Typography>
								<Typography>
									尺寸：{imagePreviewData.width}*{imagePreviewData.height}
								</Typography>
								<Typography>
									生成时间：{convertDateToLocaleOffsetString(imagePreviewData.creationDate)}
								</Typography>
								<Typography>
									首次公开时间：{convertDateToLocaleOffsetString(imagePreviewData.firstPublicationDate)}
								</Typography>
								<Typography>
									迭代步数：{imagePreviewData.step}
								</Typography>
								<Typography>
									CFG Scale：{imagePreviewData.cfg}
								</Typography>
								<Typography>
									种子：{imagePreviewData.seed}
								</Typography>
								<Typography>
									采样器：{`${samplerDisplayNameList[samplerList.indexOf(imagePreviewData.samplerName)]}
									${imagePreviewData.scheduler[0].toUpperCase()}${imagePreviewData.scheduler.slice(1)}`}
								</Typography>
								<Divider sx={{my: 1}}/>
								<Typography>
									正面描述：{imagePreviewData.positive}
								</Typography>
								<Typography>
									负面描述：{imagePreviewData.negative}
								</Typography>
							</AccordionDetails>
						</Accordion>
					</Grid>}
				</Dialog>
			</>)}
		</Grid>
	);
}

export default function AIArt({fixedTab}) {
	const tab = useParams().tab ?? fixedTab;
	const navigate = useNavigate();
	
	const tabs = useMemo(() => ["text-to-image", "requests", "works", "community"], []);
	const [tabValue, setTabValue] = useState(Math.max(tabs.indexOf(tab), 0));
	
	useEffect(() => {
		setTabValue(Math.max(tabs.indexOf(tab), 0));
		if (tabs.indexOf(tab) === -1 && tab) {
			navigate(`/ai-art`);
		}
	}, [tab, navigate, tabs]);
	
	return (
		<Grid container direction="column" sx={{flex: 1}}>
			<Box sx={{mb: 2}} maxWidth="100%">
				<Tabs
					value={tabValue}
					onChange={(event, value) => {
						navigate(`/ai-art/${tabs[value]}`);
						setTabValue(value);
						localStorage.setItem("aiArtPageIndex", value.toString());
					}}
					centered
				>
					<Tab label="文生图"/>
					<Tab label="我的请求"/>
					<Tab label="我的作品"/>
					<Tab label="创意工坊"/>
				</Tabs>
			</Box>
			{tabValue === 0 ? <TextToImageUI/> : (tabValue === 1 ? <MyRequests/> : (tabValue === 2 ? <GeneratedResults/> : <Community/>))}
		</Grid>
	);
}

AIArt.propTypes = {
	fixedTab: PropTypes.string,
}