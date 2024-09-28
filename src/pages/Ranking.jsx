import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

export default function Ranking() {
	document.title = "排行榜 - chy.web";
	
	const {data, isLoading, error} = useQuery({
		queryKey: ["ranking"],
		queryFn: () => axios.get("/api/ranking").then(res => res.data),
	});
	
	if (isLoading || error)
		return null;
	
	return data["result"].map((item, index) => (
		<Box key={index}>
			<Typography variant="h3">{item["item"]}</Typography>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							{item["index"].map((item, index) => (
								<TableCell key={index} sx={{fontWeight: "bold"}}>{item}</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{item["data"].map((item, index) => (
							<TableRow key={index} selected={item["is-me"]}>
								{item["row"].map((item, index) => (
									<TableCell key={index}>{item}</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer><br/>
		</Box>
	));
}