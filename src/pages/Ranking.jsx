import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Cookies from "js-cookie";
import {SimpleUserItem} from "src/components/UserItem.jsx";

const myname = Cookies.get("username");

export default function Ranking() {
	document.title = "排行榜 - chy.web";
	
	const {data, isLoading, error} = useQuery({
		queryKey: ["ranking"],
		queryFn: () => axios.get("/api/ranking").then(res => res.data),
	});
	
	if (isLoading || error)
		return null;
	
	return (
		<Grid container direction="column" spacing={2}>
			{data.result.map((table, index) => (
				<Box key={index} width="100%">
					<Typography variant="h4">{table.item}</Typography>
					<TableContainer component={Paper}>
						<Table sx={{whiteSpace: "nowrap"}}>
							<TableHead>
								<TableRow>
									{table.index.map((cellItem, index) => (
										<TableCell key={index} sx={{fontWeight: "bold"}}>
											<Typography fontWeight="bold">{cellItem}</Typography>
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{table.data.map((rowData, index) => (
									<TableRow key={index} selected={rowData.username === myname}>
										{rowData.row.map((cellItem, index) => (
											<TableCell key={index}>{table.index[index] === "用户" ?
												<SimpleUserItem username={rowData.username} displayName={rowData.displayName}/> :
												<Typography>{cellItem}</Typography>
											}</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>
			))}
		</Grid>
	);
}