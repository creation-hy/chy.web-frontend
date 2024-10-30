import Grid from "@mui/material/Grid2";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {InputLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import Box from "@mui/material/Box";
import {useState} from "react";
import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import FormControl from "@mui/material/FormControl";

export default function ChybenchRanking() {
	document.title = "排行榜 - Chybench - chy.web";
	
	const [rankingItem, setItem] = useState("gpuScore");
	const [rankingSize, setSize] = useState(0);
	
	const RankingTable = () => {
		const {data, isLoading, error} = useQuery({
			queryKey: [rankingItem + rankingSize],
			queryFn: () => axios.get("/api/chybench/ranking/" + rankingItem + "/" + rankingSize).then(res => res.data),
		});
		
		if (isLoading || error)
			return null;
		
		return (
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							{data.result.index.map((item) => (
								<TableCell key={item}>{item}</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{data.result.data.map((item, rowIndex) => (
							<TableRow key={rowIndex} selected={item.isMe}>
								{item.row.map((item, index) => (
									<TableCell key={index}>{data.result.index[index] === "时间" ? new Date(item).toLocaleString() : item}</TableCell>
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
				<FormControl>
					<InputLabel id="select-item">
						项目
					</InputLabel>
					<Select
						labelId="select-item"
						variant="outlined"
						label="项目"
						value={rankingItem}
						onChange={(event) => setItem(event.target.value)}
					>
						<MenuItem value="gpuScore">GPU</MenuItem>
						<MenuItem value="cpuSingleScore">CPU单核</MenuItem>
						<MenuItem value="cpuMultiScore">CPU多核</MenuItem>
						<MenuItem value="memoryScore">Memory</MenuItem>
					</Select>
				</FormControl>
				<FormControl>
					<InputLabel id="select-size">
						负载
					</InputLabel>
					<Select
						labelId="select-size"
						variant="outlined"
						label="负载"
						value={rankingSize}
						onChange={(event) => setSize(event.target.value)}
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