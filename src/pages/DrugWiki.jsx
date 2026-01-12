import axios from "axios";
import Card from "@mui/material/Card";
import {ChatMarkdown} from "src/components/ChatMarkdown.jsx";
import Grid from "@mui/material/Grid";
import {Autocomplete} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import {useQuery} from "@tanstack/react-query";
import {useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import {useBinaryColorMode} from "src/components/ColorMode.jsx";
import TextField from "@mui/material/TextField";

export const DrugWiki = () => {
	const navigate = useNavigate();
	const {innName} = useParams();
	
	const [drug, setDrug] = useState(new Map());
	const [selectedValue, setSelectedValue] = useState(null);
	const [inputValue, setInputValue] = useState("");
	const [isInited, setIsInited] = useState(false);
	const [drugList, setDrugList] = useState([]);
	
	const [colorMode] = useBinaryColorMode();
	
	document.title = (drug.has("displayName") ? drug.get("displayName") + " - " : "") + "DrugWiki - chy.web";
	
	const {data: drugSummaryList, isFetched: isDrugListFetched} = useQuery({
		queryKey: ["drugs", "getSummaryList"],
		queryFn: () => axios.get("/api/drugs").then(res => res.data),
		staleTime: Infinity,
	});
	
	useEffect(() => {
		if (innName === null || innName === "") {
			setSelectedValue(null);
			navigate("/drugs");
			setIsInited(true);
		}
		
		axios.get(`/api/drugs/${innName}`).then(res => {
			if (Object.keys(res.data || {}).length > 0) {
				setDrug(new Map(Object.entries(res.data)));
				setSelectedValue({innName: res.data.innName, displayName: res.data.displayName});
			} else {
				setDrug(new Map());
				setSelectedValue(null);
				navigate("/drugs");
			}
		});
		setIsInited(true);
	}, [innName, navigate]);
	
	useEffect(() => {
		if (isDrugListFetched) {
			setDrugList(drugSummaryList);
		}
	}, [drugSummaryList, isDrugListFetched]);
	
	if (!isDrugListFetched || !isInited) {
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
				<Autocomplete
					freeSolo
					selectOnFocus
					blurOnSelect
					handleHomeEndKeys
					options={drugList.map(item => {
						return {
							innName: item.innName,
							displayName: item.displayName,
							label: item.displayName,
						};
					})}
					getOptionLabel={option => (/^[a-zA-Z]+$/.test(inputValue) ? option.innName : option.displayName) ?? option}
					isOptionEqualToValue={(option, value) => option.displayName === value.displayName}
					renderInput={(params) => <TextField {...params} label="药物"/>}
					inputValue={inputValue}
					onInputChange={(event, newValue) => setInputValue(newValue)}
					value={selectedValue}
					onChange={(event, newValue) => {
						if (newValue == null) {
							navigate("/drugs");
							return;
						}
						
						if (selectedValue != null && newValue.innName === selectedValue.innName) {
							return;
						}
						
						if (typeof newValue !== "string") {
							setSelectedValue(newValue);
							navigate(`/drugs/${newValue.innName}`);
						} else {
							let drugSummary = drugSummaryList.find(item => item.displayName === newValue || item.innName === newValue);
							
							if (drugSummary) {
								setSelectedValue({innName: drugSummary.innName, displayName: drugSummary.displayName});
								navigate(`/drugs/${drugSummary.innName}`);
							}
						}
					}}
				/>
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