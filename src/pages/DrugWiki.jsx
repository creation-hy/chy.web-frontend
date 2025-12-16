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

export const DrugWiki = () => {
	const navigate = useNavigate();
	const {id} = useParams();
	const isIdNumeric = Boolean(id && !isNaN(Number(id)));
	
	const [drug, setDrug] = useState(new Map());
	const [selectedValue, setSelectedValue] = useState(isIdNumeric ? Number(id) : "");
	
	document.title = (drug.has("name") ? drug.get("name") + " - " : "") + "DrugWiki - chy.web";
	
	const {data: drugSummaryList, isFetched: isDrugListFetched} = useQuery({
		queryKey: ["drugs", "getSummaryList"],
		queryFn: () => axios.get("/api/drugs").then(res => res.data),
		enabled: !id || isIdNumeric,
	});
	
	useEffect(() => {
		if (isIdNumeric) {
			axios.get(`/api/drugs/${id}`).then(res => {
				if (Object.keys(res.data || {}).length > 0) {
					setDrug(new Map(Object.entries(res.data)));
				} else {
					setSelectedValue("");
					navigate("/drugs");
				}
			});
		} else {
			setSelectedValue("");
			navigate("/drugs");
		}
	}, [id, isIdNumeric, navigate]);
	
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
							value={item.id}
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
				{drug.size > 0 && (
					<>
						<h1>{drug.get("name")}</h1>
						<ChatMarkdown useMarkdown={true}>
							{drug.get("content")}
						</ChatMarkdown>
					</>
				)}
			</Card>
		</Grid>
	);
}