import Grid from "@mui/material/Grid2";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {InputLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import Box from "@mui/material/Box";
import {useCallback, useMemo, useState} from "react";
import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import FormControl from "@mui/material/FormControl";
import {UserSimpleItem} from "src/components/UserItem.jsx";
import Cookies from "js-cookie";
import Typography from "@mui/material/Typography";
import {convertDateToLocaleDateString} from "src/assets/DateUtils.jsx";

const myname = Cookies.get("username");

export default function ChybenchRanking() {
	document.title = "排行榜 - Chybench - chy.web";
	
	const rankingParams = useMemo(() => JSON.parse(localStorage.getItem("chybenchRanking")) || {}, []);
	const updateRankingParams = useCallback(() => localStorage.setItem("chybenchRanking", JSON.stringify(rankingParams)), []);
	
	const [rankingItem, setItem] = useState(rankingParams.item || "gpuScore");
	const [rankingSize, setSize] = useState(rankingParams.size || 0);
	
	const RankingTable = () => {
		const {data, isLoading, error} = useQuery({
			queryKey: [rankingItem + rankingSize],
			queryFn: () => axios.get("/api/chybench/ranking/" + rankingItem + "/" + rankingSize).then(res => res.data),
		});
		
		if (isLoading || error)
			return null;
		
		const indexDisplay = ["排名", "相比第一名", "用户", "跑分", "GPU型号", "系统", "浏览器", "日期"];
		const indexKey = ["id", "percentage", "user", "score", "gpuName", "os", "browser", "date"];
		
		return (
			<TableContainer component={Paper}>
				<Table sx={{whiteSpace: "nowrap"}}>
					<TableHead>
						<TableRow>
							{indexDisplay.map((item) => (
								<TableCell key={item}><Typography fontWeight="bold">{item}</Typography></TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{data.result.map((rowData, rowIndex) => (
							<TableRow key={rowIndex} selected={rowData.username === myname}>
								{indexKey.map((item, index) => (
									<TableCell key={index}>{
										item === "date" ? <Typography>{convertDateToLocaleDateString(rowData[item])}</Typography> :
											(item === "user" ? <UserSimpleItem username={rowData.username} displayName={rowData.displayName}/> :
												<Typography>{rowData[item]}</Typography>)
									}</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		);
	};
	
	return (
		<Box>
			<Grid container justifyContent="center" spacing={2}>
				<FormControl margin="dense">
					<InputLabel id="select-item">
						项目
					</InputLabel>
					<Select
						labelId="select-item"
						variant="outlined"
						label="项目"
						value={rankingItem}
						onChange={(event) => {
							setItem(event.target.value);
							rankingParams.item = event.target.value;
							updateRankingParams();
						}}
					>
						<MenuItem value="gpuScore">GPU</MenuItem>
						<MenuItem value="cpuSingleScore">CPU单核</MenuItem>
						<MenuItem value="cpuMultiScore">CPU多核</MenuItem>
						<MenuItem value="memoryScore">Memory</MenuItem>
					</Select>
				</FormControl>
				<FormControl margin="dense">
					<InputLabel id="select-size">
						负载
					</InputLabel>
					<Select
						labelId="select-size"
						variant="outlined"
						label="负载"
						value={rankingSize}
						onChange={(event) => {
							setSize(event.target.value);
							rankingParams.size = event.target.value;
							updateRankingParams();
						}}
					>
						<MenuItem value={0}>高</MenuItem>
						<MenuItem value={1}>中</MenuItem>
						<MenuItem value={2}>低</MenuItem>
					</Select>
				</FormControl>
			</Grid><br/>
			<RankingTable/>
		</Box>
	);
}