import axios from "axios";
import {useState} from "react";
import Card from "@mui/material/Card";
import {ChatMarkdown} from "src/components/ChatMarkdown.jsx";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {InputLabel} from "@mui/material";
import FormControl from "@mui/material/FormControl";

export const OverdoseArticles = () => {
	const [drugNames, setDrugNames] = useState(null);
	const [currentDisplayDrugId, setCurrentDisplayDrugId] = useState(null);
	const [currentDrugContent, setCurrentDrugContent] = useState(null);
	
	document.title = "Overdose - chy.web";
	
	axios.get("/api/overdose/getDrugNames").then(res => {
		setDrugNames(res.data);
	});
	
	if (drugNames === null) {
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
					onChange={(event) => {
						let id = event.target.value;
						axios.get(`/api/overdose/getDrugContent/${id + 1}`).then(res => {
							setCurrentDisplayDrugId(id);
							setCurrentDrugContent(res.data);
						})
					}}
				>
					{drugNames.map((item, index) => (
						<MenuItem
							key={index}
							value={index}
						>
							{item}
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
				{currentDisplayDrugId != null ? <h1>{drugNames[currentDisplayDrugId]}</h1> : null}
				<ChatMarkdown useMarkdown={true}>
					{currentDrugContent}
				</ChatMarkdown>
			</Card>
		</Grid>
	);
}