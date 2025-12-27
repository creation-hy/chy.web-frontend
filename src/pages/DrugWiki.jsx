import axios from "axios";
import Card from "@mui/material/Card";
import {ChatMarkdown} from "src/components/ChatMarkdown.jsx";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {InputLabel} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import {useQuery} from "@tanstack/react-query";
import {useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import {useBinaryColorMode} from "src/components/ColorMode.jsx";

export const DrugWiki = () => {
	const navigate = useNavigate();
	const {innName} = useParams();
	
	const [drug, setDrug] = useState(new Map());
	const [selectedValue, setSelectedValue] = useState(innName);
	
	const [colorMode] = useBinaryColorMode();
	
	document.title = (drug.has("displayName") ? drug.get("displayName") + " - " : "") + "DrugWiki - chy.web";
	
	const {data: drugSummaryList, isFetched: isDrugListFetched} = useQuery({
		queryKey: ["drugs", "getSummaryList"],
		queryFn: () => axios.get("/api/drugs").then(res => res.data),
	});
	
	useEffect(() => {
		axios.get(`/api/drugs/${innName}`).then(res => {
			if (Object.keys(res.data || {}).length > 0) {
				setDrug(new Map(Object.entries(res.data)));
			} else {
				setSelectedValue("");
				navigate("/drugs");
			}
		});
	}, [innName, navigate]);
	
	if (!isDrugListFetched) {
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
					value={selectedValue}
					onChange={(event) => {
						setSelectedValue(event.target.value);
						navigate(`/drugs/${event.target.value}`);
					}}
				>
					{drugSummaryList.map((item, index) => (
						<MenuItem
							key={index}
							value={item.innName}
						>
							{item.displayName}
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
				{drug.size > 0 && (
					<>
						<h1
							style={{
								fontWeight: "bold",
								marginBottom: 0,
							}}
						>
							{drug.get("displayName")}
						</h1>
						<Box
							component="img"
							sx={{
								my: 1,
								maxWidth: 250,
								maxHeight: 250,
								filter: colorMode === "light" ? "" : "invert(1)",
							}}
							src={"/api/drug-images/" + drug.get("innName") + ".svg"}
							alt={drug.get("innName")}
						/>
						<ChatMarkdown useMarkdown={true}>
							{drug.get("description")}
						</ChatMarkdown>
					</>
				)}
			</Card>
		</Grid>
	);
}