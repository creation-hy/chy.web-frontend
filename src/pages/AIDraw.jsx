import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid2";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import {Close, DrawOutlined, ExpandMoreOutlined} from "@mui/icons-material";
import Box from "@mui/material/Box";
import {useQuery} from "@tanstack/react-query";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alert,
	ButtonBase,
	ImageList,
	ImageListItem,
	ImageListItemBar,
	InputLabel,
	Slider,
	Switch,
	Tab,
	Tabs,
	ToggleButton,
	ToggleButtonGroup,
	useMediaQuery
} from "@mui/material";
import {useState} from "react";
import {convertDateToLocaleOffsetString} from "src/assets/DateUtils.jsx";
import {isMobile} from "react-device-detect";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import {LoadingButton} from "@mui/lab";

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

const GeneratedResult = () => {
	const {data, isLoading, error} = useQuery({
		queryKey: ["ai-draw-result"],
		queryFn: () => axios.get("/api/ai-draw/result").then(res => res.data),
	});
	
	const [imagePreviewData, setImagePreviewData] = useState(null);
	const [showInfo, setShowInfo] = useState(false);
	
	if (isLoading || error)
		return null;
	
	if (data.status === 0)
		return <Alert severity="error">{data.content}</Alert>;
	
	if (data.status !== 1)
		return <Alert severity="error">还没有已绘制的作品！</Alert>;
	
	return (
		<Box>
			<ImageList cols={isMobile ? 2 : 3} sx={{m: 0}}>
				{data.result.map((item) => (
					<ButtonBase key={item.imageId} sx={{borderRadius: "15px"}}
					            onClick={() => setImagePreviewData(item)}>
						<ImageListItem sx={{width: "100% !important", height: "100% !important"}}>
							<img
								alt="Generated images"
								src={"/api/ai-draw-result/" + item.imageId + ".png"}
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
			</ImageList>
			<Dialog
				open={imagePreviewData != null}
				onClose={() => setImagePreviewData(null)}
				fullScreen
			>
				{imagePreviewData != null && <Grid container direction="column" sx={{width: "100%", height: "100%"}} wrap="nowrap">
					<IconButton
						onClick={() => setImagePreviewData(null)}
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
					<Box sx={{
						flex: 1,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						overflow: "hidden",
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
				axios.post("/api/ai-draw/submit", new FormData(event.currentTarget), {
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
				<Grid
					direction="column"
					container
					spacing={2}
				>
					<Box>
						<Typography gutterBottom={!isSmallScreen}>
							宽度：{width}px
						</Typography>
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
						/>
					</Box>
					<Box>
						<Typography gutterBottom={!isSmallScreen}>
							高度：{height}px
						</Typography>
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
						/>
					</Box>
					<Grid container alignItems="center">
						图片数量：
						<ToggleButtonGroup
							sx={{flex: 1}}
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
					<Grid container alignItems="center" sx={{mt: -0.5}}>
						高级
						<Switch checked={professionalMode} onChange={(event, value) => {
							setProfessionalMode(value);
							localStorage.setItem("ai-draw.professional-mode", value.toString());
						}}/>
					</Grid>
					{professionalMode && (
						<>
							<Box>
								<Typography gutterBottom={!isSmallScreen}>
									迭代步数：{steps}
								</Typography>
								<Slider
									name="step"
									value={steps}
									min={10}
									max={40}
									onChange={(event, value) => {
										setSteps(value);
										localStorage.setItem("ai-draw.steps", value.toString());
									}}
								/>
							</Box>
							<Box>
								<Typography gutterBottom={!isSmallScreen}>
									CFG Scale：{cfg}
								</Typography>
								<Slider
									name="cfg"
									value={cfg}
									min={0}
									max={30}
									onChange={(event, value) => {
										setCfg(value);
										localStorage.setItem("ai-draw.cfg", value.toString());
									}}
								/>
							</Box>
							<Grid container direction="column" spacing={2.5}>
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
						</>
					)}
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
					<Grid container justifyContent="flex-end">
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
					<Tab label="我的作品"/>
				</Tabs>
			</Box>
			{menuValue === 0 ? <TextToImageUI/> : <GeneratedResult/>}
		</Grid>
	);
}