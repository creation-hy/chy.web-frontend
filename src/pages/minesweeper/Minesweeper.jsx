import {useState} from 'react';
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

export default function Minesweeper() {
	const [open, setOpen] = useState(true);
	const [grid, setGrid] = useState([]);
	
	const purge = (x, y) => {
		const current = document.getElementById("box" + x + "," + y);
		if (current.style.backgroundColor === "white")
			return;
		current.style.backgroundColor = "white";
		current.innerHTML = " ";
		if (++flippedCount === rows * rows - mines) {
			const score = getPassedTime();
			enqueueSnackbar("你赢了！", {variant: "success"});
			window.clearInterval(passedTimeInterval);
			if (rows >= 10 && mines >= rows * rows * 0.2 && mines <= rows * rows * 0.98)
				axios.post("/api/minesweeper/submit", {time: score}, {
					headers: {
						"Content-Type": "application/json",
					},
				}).then(res => {
					enqueueSnackbar(res.data["content"], {variant: res.data["status"] === 1 ? "success" : "error"});
				});
			else
				enqueueSnackbar("检测到作弊行为，本次成绩不会上传", {variant: "error"});
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
			<Dialog open={open}>
				<DialogTitle>设置参数</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						label="行数"
						type="number"
						fullWidth
						variant="outlined"
						id="rows"
					/>
					<TextField
						label="雷数"
						margin="dense"
						type="number"
						fullWidth
						variant="outlined"
						id="mines"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => {
						setOpen(false);
						rows = Math.max(Number(document.getElementById("rows").value), 10);
						mines = Number(document.getElementById("mines").value);
						mines = Math.max(mines, Math.floor(rows * rows * 0.2));
						mines = Math.min(mines, Math.floor(rows * rows * 0.98));
						setGrid(generateGrid(rows, mines));
						startTime = new Date().getTime();
						passedTimeInterval = setInterval(() => document.getElementById("time-passed").innerHTML = getPassedTime(), 1000);
					}}>开始</Button>
				</DialogActions>
			</Dialog>
			<Grid container justifyContent="center">
				<Typography id="time-passed" variant="h3">00:00:00</Typography>
			</Grid><br/>
			<Grid container direction="column">
				{grid == null ? <Alert severity="error">你被炸死了！</Alert> :
					grid.map((item, rowIndex) => (
						<Grid container direction="row" key={rowIndex} justifyContent="center" wrap="nowrap">
							{item.map((item, colIndex) => (
								<Box
									key={colIndex}
									id={"box" + rowIndex + "," + colIndex}
									data-row={rowIndex}
									data-col={colIndex}
									sx={{
										width: 35,
										height: 35,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										cursor: "pointer",
										border: "1px solid black",
										borderTopWidth: !rowIndex ? 1 : 0,
										borderLeftWidth: !colIndex ? 1 : 0,
										backgroundColor: "#dcdcdc",
									}}
									onContextMenu={(event) => {
										event.preventDefault();
										if (event.currentTarget.style.backgroundColor === "white") return false;
										if (event.currentTarget.innerHTML === "F") event.currentTarget.innerHTML = "?";
										else if (event.currentTarget.innerHTML === "?") event.currentTarget.innerHTML = " ";
										else event.currentTarget.innerHTML = "F";
										return false;
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
								>
									{/* 可以在这里显示数字或状态 */}
								</Box>
							))}
						</Grid>
					))}
			</Grid>
		</Box>
	);
}