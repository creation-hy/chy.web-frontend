import {browserName, fullBrowserVersion, osName, osVersion} from "react-device-detect";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Select from "@mui/material/Select";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {InputLabel, LinearProgress, Switch, useMediaQuery} from "@mui/material";
import PropTypes from "prop-types";
import {memo, useCallback, useState} from "react";
import {Close, HourglassBottom, Leaderboard, PlayArrow} from "@mui/icons-material";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import FormControl from "@mui/material/FormControl";
import Dialog from "@mui/material/Dialog";
import {ChybenchRanking} from "src/pages/chybench/ChybenchRanking.jsx";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import {useNavigate} from "react-router";

function LinearProgressWithLabel(props) {
	return (
		<Box sx={{display: 'flex', alignItems: 'center'}}>
			<Box sx={{width: '100%', mr: 1}}>
				<LinearProgress variant="determinate" {...props} />
			</Box>
			<Box sx={{minWidth: 35}}>
				<Typography variant="body2" color="textSecondary">
					{`${Math.round(props.value)}%`}
				</Typography>
			</Box>
		</Box>
	);
}

LinearProgressWithLabel.propTypes = {
	value: PropTypes.number.isRequired,
};

const chybenchParams = JSON.parse(localStorage.getItem("chybench")) || {};
const updateChybenchParams = () => localStorage.setItem("chybench", JSON.stringify(chybenchParams));

function MyProgressLabel({id, label}) {
	const [checked, setChecked] = useState(chybenchParams[id] ?? true);
	
	return (
		<Grid container justifyContent="space-between">
			<Grid container alignItems="center">
				<Switch
					id={id}
					checked={checked}
					onChange={(event) => {
						setChecked(event.target.checked);
						chybenchParams[id] = event.target.checked;
						updateChybenchParams();
					}}
				/>
				{label}：
				<Typography id={"score-" + id}>
					暂未测试
				</Typography>
			</Grid>
		</Grid>
	);
}

MyProgressLabel.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string,
};

const generateMatrix = (size) => {
	const matrix = [];
	for (let y = 0; y < size; y++) {
		matrix.push([]);
		for (let x = 0; x < size; x++)
			matrix[y].push(Math.random());
	}
	return matrix;
}

function initGPU() {
	try {
		return new window.GPU.GPU();
		// eslint-disable-next-line no-unused-vars
	} catch (e) {
		return new GPU();
	}
}

const gpu = initGPU();

const MatrixMultiplicationGPU = (size) => {
	const matrixA = generateMatrix(size);
	const matrixB = generateMatrix(size);
	
	const multiplyMatrixGPU = gpu.createKernel(function (a, b, size) {
		let sum = 0;
		for (let i = 0; i < size; i++) {
			sum += a[this.thread.y][i] * b[i][this.thread.x];
		}
		return sum;
	}).setOutput([size, size]);
	
	multiplyMatrixGPU(matrixA, matrixB, size);
	multiplyMatrixGPU(matrixA, matrixB, size);
	multiplyMatrixGPU(matrixA, matrixB, size);
	let startTime = new Date().getTime();
	let result = multiplyMatrixGPU(matrixA, matrixB, size);
	let endTime = new Date().getTime();
	
	return !result[0][0] ? 1e9 : endTime - startTime;
};

const MatrixMultiplicationCPU = (size) => {
	let a = generateMatrix(size), b = generateMatrix(size);
	let productRow = Array.apply(null, new Array(size)).map(Number.prototype.valueOf, 0);
	let product = new Array(size);
	
	for (let p = 0; p < size; p++)
		product[p] = productRow.slice();
	
	let startTime = new Date().getTime();
	for (let i = 0; i < size; i++)
		for (let j = 0; j < size; j++)
			for (let k = 0; k < size; k++)
				product[i][j] += a[i][k] * b[k][j];
	let endTime = new Date().getTime();
	
	return endTime - startTime;
}

const sleep = (time) => {
	return new Promise((resolve) => setTimeout(resolve, time));
}

const memoryTest = (size) => {
	let startTime = new Date().getTime();
	// eslint-disable-next-line no-unused-vars
	let result = [...new Array(size === 2 ? 5000000 : (size === 1 ? 10000000 : 50000000)).keys()];
	let endTime = new Date().getTime();
	return endTime - startTime;
}

const os = osName + " " + osVersion, browser = browserName + " " + fullBrowserVersion, cores = navigator.hardwareConcurrency;
const webgl = document.createElement("canvas").getContext("experimental-webgl");
const gpuName = webgl.getParameter(webgl.getExtension("WEBGL_debug_renderer_info").UNMASKED_RENDERER_WEBGL)
	.replace(/ANGLE [(].*, (.*) [(]0x.*, .*[)]/g, "$1").replace(/ANGLE [(].*, (.*), OpenGL.*[)]/g, "$1")
	.replace(/ANGLE [(].*, (.*) (Direct).*[)]/g, "$1").replace(/(.*), or similar/g, "$1").replace(/ANGLE [(]Apple, ANGLE Metal Renderer: (.*), (.*)[)]/g, "$1");

const workerFunc = () => {
	const generateMatrix = (size) => {
		const matrix = [];
		for (let y = 0; y < size; y++) {
			matrix.push([]);
			for (let x = 0; x < size; x++)
				matrix[y].push(Math.random());
		}
		return matrix;
	}
	
	const MatrixMultiplicationCPU = (a, b, size) => {
		let productRow = Array.apply(null, new Array(size)).map(Number.prototype.valueOf, 0);
		let product = new Array(size);
		
		for (let p = 0; p < size; p++)
			product[p] = productRow.slice();
		
		for (let i = 0; i < size; i++)
			for (let j = 0; j < size; j++)
				for (let k = 0; k < size; k++)
					product[i][j] += a[i][k] * b[k][j];
	}
	
	const A = generateMatrix(150), B = generateMatrix(150);
	
	while (true) {
		MatrixMultiplicationCPU(A, B, 150);
		postMessage("done");
	}
};

let workerCode = workerFunc.toString();
workerCode = workerCode.substring(workerCode.indexOf("{") + 1, workerCode.lastIndexOf("}"));
const workerScript = URL.createObjectURL(new Blob([workerCode], {type: "application/javascript"}));

export const Chybench = memo(function Chybench({showRanking}) {
	document.title = `${showRanking ? "排行榜 - " : ""}Chybench - chy.web`;
	
	const navigate = useNavigate();
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
	
	const [size, setSize] = useState(chybenchParams.size ?? 1);
	const [rounds, setRounds] = useState(chybenchParams.rounds ?? 10);
	const [cpuSingleProgress, setCPUSingleProgress] = useState(0);
	const [cpuMultiProgress, setCPUMultiProgress] = useState(0);
	const [gpuProgress, setGPUProgress] = useState(0);
	const [memoryProgress, setMemoryProgress] = useState(0);
	
	const [running, setRunning] = useState(false);
	const toggleRanking = useCallback((showRanking) => {
		if (showRanking) {
			navigate("/chybench/ranking");
		} else {
			navigate("/chybench");
		}
	}, [navigate]);
	
	const benchmark = async (size, rounds) => {
		let cpuSingleScore = 0, cpuMultiScore = 0, gpuScore = 0, memoryScore = 0;
		
		setCPUSingleProgress(0);
		document.getElementById("score-checkCPUSingle").innerHTML = "暂未测试";
		setCPUMultiProgress(0);
		document.getElementById("score-checkCPUMulti").innerHTML = "暂未测试";
		setGPUProgress(0);
		document.getElementById("score-checkGPU").innerHTML = "暂未测试";
		setMemoryProgress(0);
		document.getElementById("score-checkMemory").innerHTML = "暂未测试";
		await sleep(100);
		
		if (document.getElementById("checkCPUSingle").checked) {
			for (let i = 1; i <= rounds; i++) {
				cpuSingleScore = Math.max(cpuSingleScore, Math.floor(1e6 / MatrixMultiplicationCPU(!size ? 750 : (size === 1 ? 450 : 300))));
				setCPUSingleProgress(i * 100 / rounds);
				await sleep(100);
			}
			document.getElementById("score-checkCPUSingle").innerHTML = cpuSingleScore.toString();
			await sleep(50);
		}
		
		if (document.getElementById("checkCPUMulti").checked) {
			let currentRounds = !size ? 16 : (size === 1 ? 12 : 8);
			
			let workers = new Array(cores);
			for (let i = 0; i < cores; i++)
				workers[i] = new Worker(workerScript);
			for (let i = 0; i < cores; i++)
				workers[i].onmessage = () => cpuMultiScore++;
			
			for (let i = 1; i <= currentRounds; i++) {
				await sleep(500);
				setCPUMultiProgress(i * 100 / currentRounds);
			}
			
			let result = cpuMultiScore;
			for (let i = 0; i < cores; i++)
				workers[i].terminate();
			cpuMultiScore = result;
			document.getElementById("score-checkCPUMulti").innerHTML = cpuMultiScore.toString();
			await sleep(50);
		}
		
		if (document.getElementById("checkGPU").checked) {
			for (let i = 1; i <= rounds; i++) {
				gpuScore = Math.max(gpuScore, Math.floor(1e6 / MatrixMultiplicationGPU(!size ? 4096 : (size === 1 ? 2048 : 1182))));
				setGPUProgress(i * 100 / rounds);
				await sleep(100);
			}
			document.getElementById("score-checkGPU").innerHTML = gpuScore.toString();
			await sleep(50);
		}
		
		if (document.getElementById("checkMemory").checked) {
			for (let i = 1; i <= rounds; i++) {
				memoryScore = Math.max(memoryScore, Math.floor(1e6 / memoryTest(size)));
				setMemoryProgress(i * 100 / rounds);
				await sleep(100);
			}
			document.getElementById("score-checkMemory").innerHTML = memoryScore.toString();
		}
		
		axios.post("/api/chybench/submit", {
			gpuName: gpuName,
			os: os,
			browser: browser,
			size: size,
			gpuScore: gpuScore,
			cpuSingleScore: cpuSingleScore,
			cpuMultiScore: cpuMultiScore,
			memoryScore: memoryScore,
		}, {
			headers: {
				"Content-Type": "application/json",
			},
		}).then(res => {
			enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
		});
	}
	
	return (
		<Grid container direction="column" sx={{alignItems: "center", width: "100%"}} spacing={2}>
			<Card variant="outlined" sx={{p: 2.5, width: "100%", maxWidth: 800}}>
				<Typography>
					CPU线程数：{cores}<br/>
					GPU：{gpuName}<br/>
					系统：{os}<br/>
					浏览器：{browser}
				</Typography>
			</Card>
			<Grid container spacing={2} sx={{mt: 0.5}}>
				<FormControl>
					<InputLabel id="size-label">负载</InputLabel>
					<Select
						labelId="size-label"
						label="负载"
						variant="outlined"
						value={size}
						onChange={(event) => {
							setSize(Number(event.target.value));
							chybenchParams.size = event.target.value;
							updateChybenchParams();
						}}
					>
						<MenuItem value={0}>高</MenuItem>
						<MenuItem value={1}>中</MenuItem>
						<MenuItem value={2}>低</MenuItem>
					</Select>
				</FormControl>
				<FormControl>
					<InputLabel id="rounds-label">测试时间</InputLabel>
					<Select
						labelId="rounds-label"
						label="测试时间"
						variant="outlined"
						value={rounds}
						onChange={(event) => {
							setRounds(Number(event.target.value));
							chybenchParams.rounds = event.target.value;
							updateChybenchParams();
						}}
					>
						<MenuItem value={3}>快速</MenuItem>
						<MenuItem value={10}>常规</MenuItem>
						<MenuItem value={30}>深度</MenuItem>
					</Select>
				</FormControl>
				<Button
					variant="contained"
					onClick={async () => {
						setRunning(true);
						await benchmark(size, rounds);
						setRunning(false);
					}}
					disabled={running}
				>
					{running ? <HourglassBottom/> : <PlayArrow/>}
				</Button>
			</Grid>
			<Grid container direction="column" spacing={3} sx={{width: "100%", maxWidth: 800}}>
				<Box>
					<MyProgressLabel id="checkCPUSingle" label="CPU单核"/>
					<LinearProgressWithLabel value={cpuSingleProgress}/>
				</Box>
				<Box>
					<MyProgressLabel id="checkCPUMulti" label="CPU多核"/>
					<LinearProgressWithLabel value={cpuMultiProgress}/>
				</Box>
				<Box>
					<MyProgressLabel id="checkGPU" label="GPU"/>
					<LinearProgressWithLabel value={gpuProgress}/>
				</Box>
				<Box>
					<MyProgressLabel id="checkMemory" label="Memory"/>
					<LinearProgressWithLabel value={memoryProgress}/>
				</Box>
			</Grid>
			<Button variant="contained" startIcon={<Leaderboard/>} onClick={() => toggleRanking(true)}>排行榜</Button>
			<Dialog
				open={Boolean(showRanking)}
				maxWidth={false}
				fullScreen={isSmallScreen}
				onClose={() => toggleRanking(false)}
			>
				<DialogContent>
					<IconButton
						onClick={() => toggleRanking(false)}
						sx={{
							position: "absolute",
							right: 8,
							top: 8,
						}}
					>
						<Close/>
					</IconButton>
					<ChybenchRanking/>
				</DialogContent>
			</Dialog>
		</Grid>
	)
});

Chybench.propTypes = {
	showRanking: PropTypes.bool,
}