import {memo, useRef, useState} from 'react';
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {Alert} from "@mui/material";
import {enqueueSnackbar} from "notistack";
import Typography from "@mui/material/Typography";
import axios from "axios";
import PropTypes from "prop-types";
import {Leaderboard, PlayArrow} from "@mui/icons-material";

let flippedCount = 0, passedTimeInterval;
let startTime = 0, rows = 10, mines = 10;

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

const InitDialog = memo(({setGrid, setElapsedTime, open, setOpen, setIsGameStarted}) => {
	const rowsRef = useRef(null);
	const minesRef = useRef(null);
	
	return (
		<Dialog open={open} onClose={() => setOpen(false)}>
			<DialogTitle>设置参数</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					margin="dense"
					label="行数"
					type="number"
					fullWidth
					variant="outlined"
					inputRef={rowsRef}
				/>
				<TextField
					label="雷数"
					margin="dense"
					type="number"
					fullWidth
					variant="outlined"
					inputRef={minesRef}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => {
					rows = Math.max(Number(rowsRef.current.value || 0), 10);
					mines = Number(minesRef.current.value || 0);
					mines = Math.max(mines, Math.floor(rows * rows * 0.2));
					mines = Math.min(mines, Math.floor(rows * rows * 0.98));
					setGrid(generateGrid(rows, mines));
					startTime = new Date().getTime();
					passedTimeInterval = setInterval(() => setElapsedTime(getPassedTime()), 1000);
					setOpen(false);
					setIsGameStarted(true);
				}}>开始</Button>
			</DialogActions>
		</Dialog>
	);
});

InitDialog.propTypes = {
	setGrid: PropTypes.func,
	setElapsedTime: PropTypes.func,
	open: PropTypes.bool,
	setOpen: PropTypes.func,
	setIsGameStarted: PropTypes.func,
}

export default function Minesweeper() {
	const [isSettingParams, setIsSettingParams] = useState(false);
	const [isGameStarted, setIsGameStarted] = useState(false);
	const [grid, setGrid] = useState([]);
	const [elapsedTime, setElapsedTime] = useState("00:00:00");
	const [showRanking, setShowRanking] = useState(false);
	const boxes = useRef([]);
	
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
	
	return (
		<Box>
			<InitDialog setGrid={setGrid} setElapsedTime={setElapsedTime}
			            open={isSettingParams} setOpen={setIsSettingParams} setIsGameStarted={setIsGameStarted}/>
			{isGameStarted ? (
				<Grid container justifyContent="center" sx={{mb: 1.5}} spacing={2}>
					<Typography variant="h4">{elapsedTime}</Typography>
				</Grid>
			) : (
				<Grid container gap={2} justifyContent="center">
					<Button variant="contained" onClick={() => setIsSettingParams(true)}><PlayArrow/></Button>
					<Button variant="contained" onClick={() => setShowRanking(true)}><Leaderboard/></Button>
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
									}}
									onContextMenu={(event) => {
										event.preventDefault();
										if (event.currentTarget.getAttribute("data-opened") === "true") return;
										if (event.currentTarget.innerHTML === "🚩") event.currentTarget.innerHTML = "❓";
										else if (event.currentTarget.innerHTML === "❓") event.currentTarget.innerHTML = " ";
										else event.currentTarget.innerHTML = "🚩";
									}}
									onClick={(event) => {
										const x = Number(event.currentTarget.getAttribute("data-row"));
										const y = Number(event.currentTarget.getAttribute("data-col"));
										if (grid[x][y] === -1) {
											setGrid(null);
											window.clearInterval(passedTimeInterval);
										} else
											purge(x, y);
									}}
								/>
							))}
						</Grid>
					))}
			</Grid>
			{isGameStarted && (
				<Grid container justifyContent="center" sx={{mt: 2.5}}>
					<Button variant="contained" onClick={() => setShowRanking(true)}><Leaderboard/></Button>
				</Grid>
			)}
		</Box>
	);
}