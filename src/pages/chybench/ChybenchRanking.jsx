import Grid from "@mui/material/Grid2";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {InputLabel} from "@mui/material";
import Box from "@mui/material/Box";
import {memo, useCallback, useMemo, useState} from "react";
import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import FormControl from "@mui/material/FormControl";
import {SimpleUserItem} from "src/components/UserComponents.jsx";
import Cookies from "js-cookie";
import Typography from "@mui/material/Typography";
import {convertDateToLocaleDateString} from "src/assets/DateUtils.jsx";
import {DataGrid} from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import PropTypes from "prop-types";

const myname = Cookies.get("username");

const RankingTable = memo(({rankingItem, rankingSize, pageNumber}) => {
	const {data, isLoading, error} = useQuery({
		queryKey: [rankingItem, rankingSize, pageNumber, "fetch"],
		queryFn: () => axios.get(`/api/chybench/ranking/${rankingItem}/${rankingSize}/${pageNumber}`).then(res => res.data),
	});
	
	if (isLoading || error)
		return null;
	
	const columns = [
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
			flex: 1,
			minWidth: 175,
			renderCell: (params) => {
				return <SimpleUserItem username={params.row.username} displayName={params.row.displayName}
				                       avatarVersion={params.row.avatarVersion} sx={{mr: 1}}/>
			}
		},
		{
			field: "score",
			width: 110,
			headerName: "分数",
		},
		{
			field: "gpuName",
			minWidth: 200,
			flex: 1,
			headerName: "GPU型号",
		},
		{
			field: "os",
			width: 150,
			headerName: "OS",
		},
		{
			field: "browser",
			width: 150,
			headerName: "浏览器",
		},
		{
			field: "date",
			width: 150,
			headerName: "测试日期",
			valueFormatter: convertDateToLocaleDateString,
		},
	];
	
	const myItem = data.result.find(item => item.username === myname);
	
	return (
		<DataGrid
			columns={columns}
			rows={data.result}
			initialState={{
				pagination: {
					paginationModel: {
						pageSize: 10,
					},
				},
			}}
			rowSelectionModel={myItem ? myItem.id : undefined}
			disableRowSelectionOnClick
			hideFooter
			sx={{maxWidth: "100%", flex: 0}}
		/>
	);
});

RankingTable.propTypes = {
	rankingItem: PropTypes.string.isRequired,
	rankingSize: PropTypes.number.isRequired,
	pageNumber: PropTypes.number.isRequired,
}


export default function ChybenchRanking() {
	document.title = "排行榜 - Chybench - chy.web";
	
	const rankingParams = useMemo(() => JSON.parse(localStorage.getItem("chybenchRanking")) || {}, []);
	const updateRankingParams = useCallback(() => localStorage.setItem("chybenchRanking", JSON.stringify(rankingParams)), [rankingParams]);
	
	const [rankingItem, setItem] = useState(rankingParams.item ?? "gpuScore");
	const [rankingSize, setSize] = useState(rankingParams.size ?? 0);
	const [pageNumber, setPageNumber] = useState(0);
	
	const dataCount = useQuery({
		queryKey: [rankingItem, rankingSize, "count"],
		queryFn: () => axios.get(`/api/chybench/ranking/count/${rankingItem}/${rankingSize}`).then(res => res.data),
	});
	
	return (
		<Grid container direction="column" sx={{minHeight: "100%", justifyContent: "space-between", maxWidth: "100%"}}>
			<Grid container justifyContent="center" spacing={2} sx={{mb: 2}}>
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
			</Grid>
			<RankingTable rankingItem={rankingItem} rankingSize={rankingSize} pageNumber={pageNumber}/>
			<Grid container sx={{mt: 2}} justifyContent="center" alignItems="flex-end" flex={1}>
				<Pagination
					color="primary"
					count={dataCount && dataCount.data ? Math.ceil(dataCount.data.result / 10.0) : 0}
					onChange={(event, value) => setPageNumber(value - 1)}
				/>
			</Grid>
		</Grid>
	);
}