import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {Alert, Backdrop, CircularProgress} from "@mui/material";
import {enqueueSnackbar} from "notistack";
import Typography from "@mui/material/Typography";
import axios from "axios";
import PropTypes from "prop-types";
import {Close, Leaderboard, PlayArrow, Replay, Stop} from "@mui/icons-material";
import {DataGrid} from "@mui/x-data-grid";
import {SimpleUserItem} from "src/components/UserComponents.jsx";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import {useQuery} from "@tanstack/react-query";
import {flushSync} from "react-dom";
import Cookies from "js-cookie";
import {isIOS13} from "react-device-detect";
import {useNavigate, useParams} from "react-router";
import {debounce} from "lodash";

let flippedCount = 0, passedTimeInterval;
let startTime = 0, rows = 10, mines = 10;
const myname = Cookies.get("username");

const generateGrid = (rows, mines) => {
	const grid = Array.from({length: rows}, () => new Array(rows).fill(0));
	const count = Array.from({length: rows}, () => new Array(rows).fill(0));
	
	for (let i = 0; i < mines; i++) {
		let x = Math.floor(Math.random() * (rows - 1)), y = Math.floor(Math.random() * (rows - 1));
		while (grid[x][y] === -1) {
			y++;
			if (y >= rows) {
				x++;
				y = 0;
			}
			if (x >= rows)
				x = y = 0;
		}
		
		grid[x][y] = -1;
		if (x > 0)
			count[x - 1][y]++;
		if (y > 0)
			count[x][y - 1]++;
		if (x < rows - 1)
			count[x + 1][y]++;
		if (y < rows - 1)
			count[x][y + 1]++;
		if (x > 0 && y > 0)
			count[x - 1][y - 1]++;
		if (x > 0 && y < rows - 1)
			count[x - 1][y + 1]++;
		if (x < rows - 1 && y > 0)
			count[x + 1][y - 1]++;
		if (x < rows - 1 && y < rows - 1)
			count[x + 1][y + 1]++;
	}
	
	for (let i = 0; i < rows; i++)
		for (let j = 0; j < rows; j++)
			if (grid[i][j] === 0)
				grid[i][j] = count[i][j];
	return grid;
};

const getPassedTime = () => {
	const secs = Math.floor((new Date().getTime() - startTime) / 1000);
	const hour = Math.floor(secs / 3600), minute = Math.floor(secs / 60) % 60, second = secs % 60;
	if (hour > 23)
		return "23:59:59";
	return (hour < 10 ? "0" : "") + hour + ":" + (minute < 10 ? "0" : "") + minute + ":" + (second < 10 ? "0" : "") + second;
}

const tableColumns = [
	{
		field: "id",
		width: 65,
		headerName: "ID",
		hideSortIcons: true,
	},
	{
		field: "percentage",
		width: 130,
		headerName: "相比第一",
		renderCell: (params) => (
			<Box position="static" width="100%" height="100%" sx={{py: 1.5, pr: 2}}>
				<Box position="relative" width="100%" height="100%" sx={{border: 1, borderColor: theme => theme.palette.divider}}>
					<Grid container position="absolute" width="100%" height="100%" justifyContent="center" alignItems="center">
						<Typography fontSize="inherit">
							{params.value}%
						</Typography>
					</Grid>
					<Box width={params.row.percentage + "%"} height="100%"
					     sx={{backgroundColor: theme => theme.palette.mode === "light" ? theme.palette.primary.light : theme.palette.info.dark}}/>
				</Box>
			</Box>
		),
	},
	{
		field: "displayName",
		headerName: "用户",
		width: 250,
		renderCell: (params) => {
			return <SimpleUserItem username={params.row.username} displayName={params.row.displayName}
			                       avatarVersion={params.row.avatarVersion} badge={params.row.badge} sx={{mr: 1}}/>
		}
	},
	{
		field: "time",
		width: 130,
		headerName: "完成用时",
	},
];

const Ranking = memo(function Ranking({showRanking, setShowRanking}) {
	const navigate = useNavigate();
	
	const [pageNumber, setPageNumber] = useState(Number(useParams().pageNumber ?? 0));
	
	const togglePageNumber = useCallback((page) => {
		navigate(`/minesweeper/ranking/page/${page}`);
		setPageNumber(page);
	}, [navigate]);
	
	const [rankingData, setRankingData] = useState([]);
	
	const {data, isLoading} = useQuery({
		queryKey: ["minesweeper-ranking", pageNumber],
		queryFn: () => axios.get(`/api/minesweeper/ranking/${pageNumber}`).then(res => res.data.result),
	});
	
	const countData = useQuery({
		queryKey: ["minesweeper-ranking", "count"],
		queryFn: () => axios.get(`/api/minesweeper/ranking-count`).then(res => res.data),
	});
	
	const [showLoadingProgress, setShowLoadingProgress] = useState(false);
	
	const toggleShowLoading = useRef(debounce((newIsLoading) => {
		setShowLoadingProgress(newIsLoading);
	}, 100));
	
	const myItem = data && data.result ? data.result.find(item => item.username === myname) : undefined;
	
	useEffect(() => {
		if (data) {
			setRankingData(data);
		}
	}, [data]);
	
	useEffect(() => {
		toggleShowLoading.current(isLoading);
	}, [isLoading]);
	
	return (
		<Dialog
			open={Boolean(showRanking)}
			onClose={() => setShowRanking(false)}
			maxWidth="xl"
		>
			<Backdrop open={showLoadingProgress} sx={{zIndex: 8964}}>
				<CircularProgress size={50}/>
			</Backdrop>
			<IconButton
				onClick={() => setShowRanking(false)}
				sx={{
					position: "absolute",
					right: 12,
					top: 12,
				}}
			>
				<Close/>
			</IconButton>
			<DialogTitle>
				排行榜
			</DialogTitle>
			<DialogContent>
				<DataGrid
					columns={tableColumns}
					rows={rankingData}
					rowSelectionModel={myItem ? myItem.id : undefined}
					disableRowSelectionOnClick
					hideFooter
				/>
				<Grid container sx={{mt: 2}} justifyContent="center" alignItems="flex-end" flex={1}>
					<Pagination
						page={pageNumber + 1}
						color="primary"
						count={countData.data ? Math.ceil(countData.data.result / 10.0) : 0}
						onChange={(event, value) => togglePageNumber(value - 1)}
					/>
				</Grid>
			</DialogContent>
		</Dialog>
	);
});

Ranking.propTypes = {
	showRanking: PropTypes.bool.isRequired,
	setShowRanking: PropTypes.func.isRequired,
}

export const Minesweeper = memo(function Minesweeper({showRanking}) {
	document.title = `${showRanking ? "排行榜 - " : ""}扫雷 - chy.web`;
	
	const navigate = useNavigate();
	
	const [isGameStarted, setIsGameStarted] = useState(false);
	const [grid, setGrid] = useState([]);
	const [elapsedTime, setElapsedTime] = useState("00:00:00");
	
	const setShowRanking = useCallback((showRanking) => {
		if (showRanking) {
			navigate("/minesweeper/ranking");
		} else {
			navigate("/minesweeper");
		}
	}, [navigate]);
	
	const boxes = useRef([]);
	
	const minesweeperSettings = useMemo(() => JSON.parse(localStorage.getItem("minesweeperSettings")) || {}, []);
	const [inputRows, setInputRows] = useState(minesweeperSettings.rows);
	const [inputMines, setInputMines] = useState(minesweeperSettings.mines);
	
	const contextMenuTimeout = useRef(null);
	const isLongPress = useRef(false);
	
	const purge = (x, y) => {
		const current = boxes.current[x][y];
		if (current.getAttribute("data-opened") === "true")
			return;
		current.style.backgroundColor = "#dddddb";
		current.setAttribute("data-opened", "true");
		current.innerHTML = " ";
		if (++flippedCount === rows * rows - mines) {
			const score = getPassedTime();
			enqueueSnackbar("你赢了！", {variant: "success"});
			window.clearInterval(passedTimeInterval);
			if (rows >= 10 && mines >= rows * rows * 0.2 && mines <= rows * rows * 0.98) {
				axios.post("/api/minesweeper/submit", {time: score}, {
					headers: {
						"Content-Type": "application/json",
					},
				}).then(res => {
					enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
				});
			} else {
				enqueueSnackbar("检测到作弊行为，本次成绩不会上传", {variant: "error"});
			}
			return;
		}
		
		if (grid[x][y] === 0) {
			if (x > 0) purge(x - 1, y);
			if (y > 0) purge(x, y - 1);
			if (x < rows - 1) purge(x + 1, y);
			if (y < rows - 1) purge(x, y + 1);
			if (x > 0 && y > 0) purge(x - 1, y - 1);
			if (x > 0 && y < rows - 1) purge(x - 1, y + 1);
			if (x < rows - 1 && y > 0) purge(x + 1, y - 1);
			if (x < rows - 1 && y < rows - 1) purge(x + 1, y + 1);
		} else {
			current.innerHTML = grid[x][y];
			if (grid[x][y] === 1) current.style.color = "blue";
			else if (grid[x][y] === 2) current.style.color = "green";
			else if (grid[x][y] === 3) current.style.color = "red";
			else if (grid[x][y] === 4) current.style.color = "purple";
			else if (grid[x][y] === 5) current.style.color = "orange";
			else if (grid[x][y] === 6) current.style.color = "yellow";
			else if (grid[x][y] === 7) current.style.color = "pink";
			else current.style.color = "black";
		}
	}
	
	const toggleMark = (event) => {
		if (event.target.getAttribute("data-opened") === "true") {
			return;
		}
		if (event.target.innerHTML === "🚩") {
			event.target.innerHTML = "❓";
		} else if (event.target.innerHTML === "❓") {
			event.target.innerHTML = " ";
		} else {
			event.target.innerHTML = "🚩";
		}
	}
	
	return (
		<Box>
			{isGameStarted ? (
				<Grid container justifyContent="center" sx={{mb: 1.5}} spacing={2}>
					<Typography variant="h4">{elapsedTime}</Typography>
				</Grid>
			) : (
				<Grid container direction="column" gap={1}>
					<Grid container justifyContent="center" gap={1}>
						<TextField
							margin="dense"
							label="行数"
							type="number"
							sx={{width: 105}}
							variant="outlined"
							value={inputRows}
							onChange={(event) => {
								setInputRows(event.target.value);
								minesweeperSettings.rows = event.target.value;
								localStorage.setItem("minesweeperSettings", JSON.stringify(minesweeperSettings));
							}}
						/>
						<TextField
							label="雷数"
							margin="dense"
							type="number"
							sx={{width: 105}}
							variant="outlined"
							value={inputMines}
							onChange={(event) => {
								setInputMines(event.target.value);
								minesweeperSettings.mines = event.target.value;
								localStorage.setItem("minesweeperSettings", JSON.stringify(minesweeperSettings));
							}}
						/>
					</Grid>
					<Grid container justifyContent="center" gap={1}>
						<Button
							variant="contained"
							startIcon={<PlayArrow/>}
							onClick={() => {
								rows = Math.max(Number(inputRows || 0), 10);
								mines = Number(inputMines || 0);
								mines = Math.max(mines, Math.floor(rows * rows * 0.2));
								mines = Math.min(mines, Math.floor(rows * rows * 0.98));
								setGrid(generateGrid(rows, mines));
								startTime = new Date().getTime();
								passedTimeInterval = setInterval(() => setElapsedTime(getPassedTime()), 1000);
								setIsGameStarted(true);
							}}
						>
							开始游戏
						</Button>
						<Button
							variant="contained"
							startIcon={<Leaderboard/>}
							onClick={() => setShowRanking(true)}
						>
							排行榜
						</Button>
					</Grid>
				</Grid>
			)}
			<Grid container direction="column" overflow="auto">
				{grid == null ? <Alert severity="error">你被炸死了！</Alert> :
					grid.map((item, rowIndex) => (
						<Grid container direction="row" key={rowIndex} justifyContent="center" wrap="nowrap">
							{item.map((item, colIndex) => (
								<Box
									key={colIndex}
									id={"box" + rowIndex + "," + colIndex}
									ref={(el) => {
										if (!boxes.current[rowIndex])
											boxes.current[rowIndex] = [];
										boxes.current[rowIndex][colIndex] = el;
									}}
									data-row={rowIndex}
									data-col={colIndex}
									data-opened="false"
									sx={{
										width: 35,
										height: 35,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										cursor: "pointer",
										mt: rowIndex ? "1px" : 0,
										ml: colIndex ? "1px" : 0,
										backgroundColor: "#c3c3c3",
										borderRadius: "7%",
										userSelect: "none",
									}}
									onContextMenu={(event) => {
										event.preventDefault();
										if (!isIOS13) {
											toggleMark(event);
										}
									}}
									onTouchStart={(event) => {
										if (isIOS13 && !contextMenuTimeout.current) {
											contextMenuTimeout.current = setTimeout(() => {
												toggleMark(event);
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
									onClick={(event) => {
										const x = Number(event.currentTarget.getAttribute("data-row"));
										const y = Number(event.currentTarget.getAttribute("data-col"));
										if (grid[x][y] === -1) {
											setGrid(null);
											window.clearInterval(passedTimeInterval);
										} else {
											purge(x, y);
										}
									}}
								/>
							))}
						</Grid>
					))}
			</Grid>
			{isGameStarted && (
				<Grid container justifyContent="center" sx={{mt: 2.5}} gap={2}>
					<Button
						variant="contained"
						startIcon={<Replay/>}
						onClick={() => {
							setElapsedTime("00:00:00");
							flippedCount = 0;
							flushSync(() => setGrid([]));
							setGrid(generateGrid(rows, mines));
							startTime = new Date().getTime();
							window.clearInterval(passedTimeInterval);
							passedTimeInterval = setInterval(() => setElapsedTime(getPassedTime()), 1000);
						}}
					>
						重新开始
					</Button>
					<Button
						variant="contained"
						startIcon={<Stop/>}
						onClick={() => {
							flippedCount = 0;
							setGrid([]);
							setIsGameStarted(false);
							setElapsedTime("00:00:00");
							window.clearInterval(passedTimeInterval);
						}}
					>
						结束游戏
					</Button>
				</Grid>
			)}
			<Ranking showRanking={showRanking} setShowRanking={setShowRanking}/>
		</Box>
	);
});

Minesweeper.propTypes = {
	showRanking: PropTypes.bool,
}