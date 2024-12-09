import Grid from "@mui/material/Grid2";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {Backdrop, CircularProgress, InputLabel} from "@mui/material";
import Box from "@mui/material/Box";
import {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import axios from "axios";
import FormControl from "@mui/material/FormControl";
import {SimpleUserItem} from "src/components/UserComponents.jsx";
import Cookies from "js-cookie";
import Typography from "@mui/material/Typography";
import {convertDateToLocaleDateString} from "src/assets/DateUtils.jsx";
import {DataGrid} from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import PropTypes from "prop-types";
import {useQuery} from "@tanstack/react-query";
import {useNavigate, useParams} from "react-router";
import {debounce} from "lodash";

const myname = Cookies.get("username");

const RankingTable = memo(function RankingTable({data}) {
	if (!data) {
		return null;
	}
	
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
			width: 250,
			renderCell: (params) => {
				return <SimpleUserItem username={params.row.username} displayName={params.row.displayName}
				                       avatarVersion={params.row.avatarVersion} badge={params.row.badge} sx={{mr: 1}}/>
			}
		},
		{
			field: "score",
			width: 110,
			headerName: "分数",
		},
		{
			field: "gpuName",
			width: 250,
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
	
	const myItem = data.find(item => item.username === myname);
	
	return (
		<DataGrid
			columns={columns}
			rows={data}
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
	data: PropTypes.array,
}

export const ChybenchRanking = memo(function ChybenchRanking() {
	const navigate = useNavigate();
	
	const rankingParams = useMemo(() => JSON.parse(localStorage.getItem("chybenchRanking")) || {}, []);
	const updateRankingParams = useCallback(() => localStorage.setItem("chybenchRanking", JSON.stringify(rankingParams)), [rankingParams]);
	
	const [rankingItem, setItem] = useState(rankingParams.item ?? "gpuScore");
	const [rankingSize, setSize] = useState(rankingParams.size ?? 0);
	
	const [pageNumber, setPageNumber] = useState(Number(useParams().pageNumber ?? 0));
	
	const togglePageNumber = useCallback((page) => {
		navigate(`/chybench/ranking/page/${page}`);
		setPageNumber(page);
	}, [navigate]);
	
	const [rankingData, setRankingData] = useState([]);
	
	const [dataCount, setDataCount] = useState(0);
	
	const {data, isLoading} = useQuery({
		queryKey: [rankingItem, rankingSize, pageNumber],
		queryFn: () => axios.get(`/api/chybench/ranking/${rankingItem}/${rankingSize}/${pageNumber}`).then(res => res.data.result),
	});
	
	const [showLoadingProgress, setShowLoadingProgress] = useState(false);
	
	const toggleShowLoading = useRef(debounce((newIsLoading) => {
		setShowLoadingProgress(newIsLoading);
	}, 100));
	
	useEffect(() => {
		axios.get(`/api/chybench/ranking/count/${rankingItem}/${rankingSize}`).then(res => {
			setDataCount(res.data.result);
		});
	}, [rankingItem, rankingSize]);
	
	useEffect(() => {
		if (data) {
			setRankingData(data);
		}
	}, [data]);
	
	useEffect(() => {
		toggleShowLoading.current(isLoading);
	}, [isLoading]);
	
	return (
		<Grid container direction="column" sx={{minHeight: "100%", justifyContent: "space-between", maxWidth: "100%"}}>
			<Backdrop open={showLoadingProgress} sx={{zIndex: 8964}}>
				<CircularProgress size={50}/>
			</Backdrop>
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
							togglePageNumber(0);
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
							togglePageNumber(0);
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
			<RankingTable data={rankingData}/>
			<Grid container sx={{mt: 2}} justifyContent="center" alignItems="flex-end" flex={1}>
				<Pagination
					page={pageNumber + 1}
					color="primary"
					count={Math.ceil(dataCount / 10.0)}
					onChange={(event, value) => togglePageNumber(value - 1)}
				/>
			</Grid>
		</Grid>
	);
});