import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid2";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import {Close, DeleteOutlined, DrawOutlined, ExpandMoreOutlined, Info} from "@mui/icons-material";
import Box from "@mui/material/Box";
import {useQuery} from "@tanstack/react-query";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alert,
	ButtonBase,
	CircularProgress,
	Collapse,
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
	useMediaQuery
} from "@mui/material";
import {useEffect, useState} from "react";
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

const optimizationPositiveTags = "masterpiece, best quality, best quality, Amazing, finely detail, Depth of field, extremely detailed CG unity 8k wallpaper, ";
const optimizationNegativeTags = "multiple breasts, (mutated hands and fingers:1.5 ), (long body :1.3), (mutation, poorly drawn :1.2) , black-white, bad anatomy, liquid body, liquid tongue, disfigured, malformed, mutated, anatomical nonsense, text font ui, error, malformed hands, long neck, blurred, lowers, lowres, bad anatomy, bad proportions, bad shadow, uncoordinated body, unnatural body, fused breasts, bad breasts, huge breasts, poorly drawn breasts, extra breasts, liquid breasts, heavy breasts, missing breasts, huge haunch, huge thighs, huge calf, bad hands, fused hand, missing hand, disappearing arms, disappearing thigh, disappearing calf, disappearing legs, fused ears, bad ears, poorly drawn ears, extra ears, liquid ears, heavy ears, missing ears, fused animal ears, bad animal ears, poorly drawn animal ears, extra animal ears, liquid animal ears, heavy animal ears, missing animal ears, text, ui, error, missing fingers, missing limb, fused fingers, one hand with more than 5 fingers, one hand with less than 5 fingers, one hand owith more than 5 digit, one hand with less than 5 digit, extra digit, fewer digits, fused digit, missing digit, bad digit, liquid digit, colorful tongue, black tongue, cropped, watermark, username, blurry, JPEG artifacts, signature, 3D, 3D game, 3D game scene, 3D character, malformed feet, extra feet, bad feet, poorly drawn feet, fused feet, missing feet, extra shoes, bad shoes, fused shoes, more than two shoes, poorly drawn shoes, bad gloves, poorly drawn gloves, fused gloves, bad cum, poorly drawn cum, fused cum, bad hairs, poorly drawn hairs, fused hairs, big muscles, ugly, bad face, fused face, poorly drawn face, cloned face, big face, long face, bad eyes, fused eyes poorly drawn eyes, extra eyes, malformed limbs, "

const MyRequests = () => {
	const {data, isLoading, error} = useQuery({
		queryKey: ["ai-draw-request"],
		queryFn: () => axios.get("/api/ai-draw/request").then(res => res.data),
	});
	
	const [requestList, setRequestList] = useState([]);
	const [showInfo, setShowInfo] = useState(false);
	const [infoData, setInfoData] = useState(null);
	const [deletingId, setDeletingId] = useState(null);
	
	useEffect(() => {
		if (data)
			setRequestList(data.result);
	}, [data]);
	
	if (isLoading || error)
		return null;
	
	if (data.status === 0)
		return <Alert severity="error">{data.content}</Alert>;
	
	if (data.status !== 1 || requestList.length === 0)
		return <Typography alignSelf="center" sx={{mt: 2}} color="text.secondary">这里还空空如也呢~</Typography>;
	
	return (
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
								<IconButton onClick={() => {
									setInfoData(item);
									setShowInfo(true);
								}}>
									<Info/>
								</IconButton>
								<IconButton color="error" onClick={() => {
									setDeletingId(item.id);
									axios.post("/api/ai-draw/request/delete", {id: item.id}, {
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
					正面描述：{infoData.positive}<br/><br/>
					负面描述：{infoData.negative}
				</DialogContent>}
				<DialogActions>
					<Button onClick={() => setShowInfo(false)}>关闭</Button>
				</DialogActions>
			</Dialog>
		</Card>
	);
}

const GeneratedResults = () => {
	const {data, isLoading, error} = useQuery({
		queryKey: ["ai-draw-result"],
		queryFn: () => axios.get("/api/ai-draw/result").then(res => res.data),
	});
	
	const [showImagePreview, setShowImagePreview] = useState(false);
	const [imagePreviewData, setImagePreviewData] = useState(null);
	const [showDeletingDialog, setShowDeletingDialog] = useState(false);
	const [deletingImageId, setDeletingImageId] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [imageList, setImageList] = useState([]);
	
	useEffect(() => {
		if (data)
			setImageList(data.result);
	}, [data]);
	
	if (isLoading || error)
		return null;
	
	if (data.status === 0)
		return <Alert severity="error">{data.content}</Alert>;
	
	if (data.status !== 1 || imageList.length === 0)
		return <Typography alignSelf="center" sx={{mt: 2}} color="text.secondary">这里还空空如也呢~</Typography>;
	
	return (
		<Box>
			<Masonry breakpointCols={{
				default: 4,
				1000: 3,
				700: 2,
				350: 1,
			}} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
				{imageList.map((item) => (
					<ButtonBase key={item.imageId} sx={{borderRadius: "15px", m: 0.5}} onClick={() => {
						setImagePreviewData(item);
						setShowImagePreview(true);
					}}>
						<ImageListItem sx={{width: "100% !important", height: "100% !important"}}>
							<img
								alt="Generated images"
								src={`/api/ai-draw-result/${item.imageId}.png`}
								style={{borderRadius: "15px"}}
							/>
							<ImageListItemBar
								title={`${convertDateToLocaleOffsetString(item.time)}`}
								sx={{
									borderBottomLeftRadius: "15px",
									borderBottomRightRadius: "15px",
								}}
							/>
						</ImageListItem>
					</ButtonBase>
				))}
			</Masonry>
			<Dialog
				open={showImagePreview}
				onClose={() => setShowImagePreview(false)}
				fullScreen
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
						<img
							src={"/api/ai-draw-result/" + imagePreviewData.imageId + ".png"}
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
						<IconButton
							onClick={() => {
								setDeletingImageId(imagePreviewData.imageId);
								setShowDeletingDialog(true);
							}}
							color="error"
							style={{
								position: "absolute",
								bottom: 10,
								right: 10,
							}}
						>
							<DeleteOutlined/>
						</IconButton>
					</Box>
					<Accordion variant="outlined" sx={{border: 0}}>
						<AccordionSummary expandIcon={<ExpandMoreOutlined/>}>
							详细信息
						</AccordionSummary>
						<AccordionDetails sx={{maxHeight: "calc(40vh - 48px)", overflowY: "auto"}}>
							模型：{modelDisplayNameList[modelList.indexOf(imagePreviewData.modelName)]}<br/>
							尺寸：{imagePreviewData.width}*{imagePreviewData.height}<br/>
							生成时间：{convertDateToLocaleOffsetString(imagePreviewData.time)}<br/>
							迭代步数：{imagePreviewData.step}<br/>
							CFG Scale：{imagePreviewData.cfg}<br/>
							种子：{imagePreviewData.seed}<br/>
							采样器：{`${samplerDisplayNameList[samplerList.indexOf(imagePreviewData.samplerName)]}
								${imagePreviewData.scheduler[0].toUpperCase()}${imagePreviewData.scheduler.slice(1)}`}
							<Divider sx={{my: 1}}/>
							正面描述：{imagePreviewData.positive}<br/><br/>
							负面描述：{imagePreviewData.negative}
						</AccordionDetails>
					</Accordion>
				</Grid>}
			</Dialog>
			<Dialog open={showDeletingDialog} onClose={() => setShowDeletingDialog(false)}>
				<DialogTitle>
					要删除这张图片吗？
				</DialogTitle>
				<img src={`/api/ai-draw-result/${deletingImageId}.png`} alt="Deleting Image"/>
				<DialogActions>
					<Button onClick={() => setShowDeletingDialog(false)}>取消</Button>
					<LoadingButton color="error" loading={isDeleting} onClick={() => {
						setIsDeleting(true);
						axios.post("/api/ai-draw/result/delete", {id: deletingImageId}, {
							headers: {
								"Content-Type": "application/json",
							},
						}).then(res => {
							enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
							setIsDeleting(false);
							if (res.data.status === 1) {
								setImageList([...imageList].filter((item) => item.imageId !== deletingImageId));
								setShowDeletingDialog(false);
								setShowImagePreview(false);
							}
						});
					}}>删除</LoadingButton>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

const TextToImageUI = () => {
	const [positivePrompt, setPositivePrompt] = useState(localStorage.getItem("ai-draw.positive") || "");
	const [negativePrompt, setNegativePrompt] = useState(localStorage.getItem("ai-draw.negative") || "");
	
	const [width, setWidth] = useState(Number(localStorage.getItem("ai-draw.width")) || 512);
	const [height, setHeight] = useState(Number(localStorage.getItem("ai-draw.height")) || 512);
	const [batchSize, setBatchSize] = useState(Number(localStorage.getItem("ai-draw.batch-size")) || 1)
	
	const [professionalMode, setProfessionalMode] = useState(localStorage.getItem("ai-draw.professional-mode") === "true");
	const [steps, setSteps] = useState(Number(localStorage.getItem("ai-draw.steps")) || 30);
	const [cfg, setCfg] = useState(Number(localStorage.getItem("ai-draw.cfg")) || 7);
	
	const [modelName, setModelName] = useState(localStorage.getItem("ai-draw.model-name") || modelList[0]);
	const [samplerName, setSamplerName] = useState(localStorage.getItem("ai-draw.sampler-name") || "dpmpp_2m");
	const [scheduler, setScheduler] = useState(localStorage.getItem("ai-draw.scheduler") || "karras");
	const [usePromptOptimization, setUsePromptOptimization] = useState(localStorage.getItem("ai-draw.prompt-optimization") === "true");
	
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
				console.log(formData);
				if (usePromptOptimization) {
					formData.set("positive", optimizationPositiveTags + formData.get("positive"));
					formData.set("negative", optimizationNegativeTags + formData.get("negative"));
				}
				axios.post("/api/ai-draw/submit", formData, {
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
								localStorage.setItem("ai-draw.width", value.toString());
							}}
							sx={{flex: 1}}
						/>
						<Typography>{width}px</Typography>
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
								localStorage.setItem("ai-draw.height", value.toString());
							}}
							sx={{flex: 1}}
						/>
						<Typography>{height}px</Typography>
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
								localStorage.setItem("ai-draw.batch-size", value.toString());
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
							localStorage.setItem("ai-draw.professional-mode", value.toString());
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
									localStorage.setItem("ai-draw.steps", value.toString());
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
									localStorage.setItem("ai-draw.cfg", value.toString());
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
										localStorage.setItem("ai-draw.model-name", event.target.value.toString());
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
										localStorage.setItem("ai-draw.sampler-name", event.target.value.toString());
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
										localStorage.setItem("ai-draw.scheduler", event.target.value.toString());
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
			<Card variant="outlined" sx={{padding: 2.5, flex: isSmallScreen ? 0 : 1}}>
				<Grid container direction="column" spacing={2}>
					<TextField
						name="positive"
						label="图片描述"
						placeholder="英文单词，用逗号隔开"
						value={positivePrompt}
						onChange={(event) => {
							setPositivePrompt(event.target.value);
							localStorage.setItem("ai-draw.positive", event.target.value.toString());
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
						placeholder="英文单词，用逗号隔开"
						value={negativePrompt}
						onChange={(event) => {
							setNegativePrompt(event.target.value);
							localStorage.setItem("ai-draw.negative", event.target.value.toString());
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
								localStorage.setItem("ai-draw.prompt-optimization", value.toString());
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

}

export default function AIDraw() {
	document.title = "AI绘图 - chy.web";
	
	const [menuValue, setMenuValue] = useState(Number(localStorage.getItem("ai-draw.page-index")) || 0);
	
	return (
		<Grid container direction="column" sx={{flex: 1}}>
			<Box sx={{mb: 2.5}}>
				<Tabs value={menuValue} onChange={(event, value) => {
					setMenuValue(value);
					localStorage.setItem("ai-draw.page-index", value.toString());
				}} centered>
					<Tab label="文生图"/>
					<Tab label="我的请求"/>
					<Tab label="我的作品"/>
					<Tab label="创意工坊"/>
				</Tabs>
			</Box>
			{menuValue === 0 ? <TextToImageUI/> : (menuValue === 1 ? <MyRequests/> : (menuValue === 2 ? <GeneratedResults/> : <Community/>))}
		</Grid>
	);
}