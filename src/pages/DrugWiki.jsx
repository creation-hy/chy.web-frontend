import axios from "axios";
import {useState} from "react";
import Card from "@mui/material/Card";
import {ChatMarkdown} from "src/components/ChatMarkdown.jsx";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {InputLabel} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import {useQuery} from "@tanstack/react-query";

export const DrugWiki = () => {
	const [currentDisplayDrugId, setCurrentDisplayDrugId] = useState(null);
	const [currentDrugContent, setCurrentDrugContent] = useState(null);
	
	document.title = "药物Wiki - chy.web";
	
	const {data: drugSummaryList} = useQuery({
		queryKey: ["drugs", "getSummaryList"],
		queryFn: () => axios.get("/api/drugs").then(res => res.data),
	});
	
	if (drugSummaryList == null) {
		return null;
	}
	
	return (
		<Grid container sx={{flex: 1, width: "100%", flexDirection: "column"}} gap={2}>
			<FormControl
				sx={{
					maxWidth: 300,
					width: "100%",
					alignSelf: "center",
					m: 0.75,
				}}
			>
				<InputLabel id="drug-select-label" sx={{p: -0.75}}>药物</InputLabel>
				<Select
					variant="outlined"
					label="药物"
					labelId="drug-select-label"
					defaultValue={""}
					onChange={(event) => {
						let id = event.target.value;
						axios.get(`/api/drugs/${drugSummaryList[id].id}`).then(res => {
							setCurrentDisplayDrugId(res.data.id);
							setCurrentDrugContent(res.data.content);
						});
					}}
				>
					{drugSummaryList.map((item, index) => (
						<MenuItem
							key={index}
							value={index}
						>
							{item.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Card
				sx={{
					p: 3,
					pt: 0,
					flex: 1,
				}}
			>
				{currentDisplayDrugId != null ? <h1>{drugSummaryList[currentDisplayDrugId].name}</h1> : null}
				<ChatMarkdown useMarkdown={true}>
					{currentDrugContent}
				</ChatMarkdown>
			</Card>
		</Grid>
	);
}