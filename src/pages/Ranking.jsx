import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Avatar from "@mui/material/Avatar";
import Link from "@mui/material/Link";
import PropTypes from "prop-types";

export const UserSimpleItem = ({username}) => {
	return (
		<Link href={"/user/" + username} underline="none" width="max-content"
		      display="flex" flexWrap="nowrap" alignItems="center" gap={1}>
			<Avatar src={"/avatars/" + username + ".png"}/>
			<Typography sx={{fontWeight: "bold", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis"}}>
				{username}
			</Typography>
		</Link>
	);
}

UserSimpleItem.propTypes = {
	username: PropTypes.string,
}

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
						<Table>
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
								{table.data.map((rowItem, index) => (
									<TableRow key={index} selected={rowItem.isMe}>
										{rowItem.row.map((cellItem, index) => (
											<TableCell key={index}>{table.index[index] === "用户" ?
												<UserSimpleItem username={cellItem}/> : <Typography>{cellItem}</Typography>
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