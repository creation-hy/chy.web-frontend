import axios from "axios";
import Card from "@mui/material/Card";
import {ChatMarkdown} from "src/components/ChatMarkdown.jsx";
import {Autocomplete, InputLabel} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import {useQuery} from "@tanstack/react-query";
import {useNavigate, useParams} from "react-router";
import {memo, useEffect, useState} from "react";
import Box from "@mui/material/Box";
import {useBinaryColorMode} from "src/components/ColorMode.jsx";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import {green, orange, red, yellow} from "@mui/material/colors";
import PropTypes from "prop-types";

export const DrugWiki = () => {
	const navigate = useNavigate();
	const {innName} = useParams();
	
	const [drug, setDrug] = useState(new Map());
	const [selectedValue, setSelectedValue] = useState(null);
	const [inputValue, setInputValue] = useState("");
	const [selectedClass, setSelectedClass] = useState(null);
	const [inputClass, setInputClass] = useState("");
	const [isInited, setIsInited] = useState(false);
	const [drugList, setDrugList] = useState([]);
	
	const [colorMode] = useBinaryColorMode();
	
	const useEnglishDisplayName = /^[a-zA-Z]+$/.test(inputValue) && inputValue !== selectedValue?.displayName;
	
	document.title = (drug.has("displayName") ? drug.get("displayName") + " - " : "") + "DrugWiki - chy.web";
	
	const {data: drugSummaryList, isFetched: isDrugListFetched} = useQuery({
		queryKey: ["drugs", "getSummaryList"],
		queryFn: () => axios.get("/api/drugs").then(res => res.data),
		staleTime: Infinity,
	});
	
	const {data: drugClassList, isFetched: isDrugClassListFetched} = useQuery({
		queryKey: ["drugs", "getClassList"],
		queryFn: () => axios.get("/api/drug-classes").then(res => res.data),
	});
	
	useEffect(() => {
		if (innName == null || innName === "") {
			setSelectedValue(null);
			navigate("/drugs");
			setIsInited(true);
			return;
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
	
	if (!isDrugListFetched || !isDrugClassListFetched || !isInited) {
		return null;
	}
	
	return (
		<>
			<FormControl
				sx={{
					maxWidth: "100%",
					display: "flex",
					flexDirection: "row",
					alignSelf: "center",
					justifyContent: "center",
					gap: 1,
					m: 0.75,
					mb: 2,
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
					getOptionLabel={option => (useEnglishDisplayName ? option.innName : option.displayName) ?? option}
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
							let lowerCaseValue = newValue.toLowerCase();
							let drugSummary = drugSummaryList.find(item =>
								item.displayName.toLowerCase() === lowerCaseValue || item.innName.toLowerCase() === lowerCaseValue);
							
							if (drugSummary) {
								setSelectedValue({innName: drugSummary.innName, displayName: drugSummary.displayName});
								navigate(`/drugs/${drugSummary.innName}`);
							}
						}
					}}
					sx={{
						width: 225,
					}}
					slotProps={{
						popper: {
							sx: {
								'& .MuiAutocomplete-option': {
									wordBreak: 'break-word',
								},
							}
						}
					}}
				/>
				<FormControl sx={{width: 160}}>
					<InputLabel id="order-select-label">排序方式</InputLabel>
					<Select
						variant="outlined"
						labelId="order-select-label"
						label="排序方式"
						defaultValue="0"
						onChange={(event) => {
							setDrugList(list => {
								switch (event.target.value) {
									case 0:
										return drugSummaryList;
									case 1:
										return [...list].sort((a, b) => a.psychologicalDependence - b.psychologicalDependence);
									case 2:
										return [...list].sort((a, b) => b.psychologicalDependence - a.psychologicalDependence);
									case 3:
										return [...list].sort((a, b) => a.physicalDependence - b.physicalDependence);
									case 4:
										return [...list].sort((a, b) => b.physicalDependence - a.physicalDependence);
								}
							});
						}}
					>
						<MenuItem value={0}>默认排序</MenuItem>
						<MenuItem value={1}>心理成瘾性升序</MenuItem>
						<MenuItem value={2}>心理成瘾性降序</MenuItem>
						<MenuItem value={3}>生理成瘾性升序</MenuItem>
						<MenuItem value={4}>生理成瘾性降序</MenuItem>
					</Select>
				</FormControl>
				<Autocomplete
					freeSolo
					selectOnFocus
					blurOnSelect
					handleHomeEndKeys
					options={drugClassList}
					getOptionKey={option => option.id}
					getOptionLabel={option => option.name ?? option}
					isOptionEqualToValue={(option, value) => option.id === value.id}
					renderInput={(params) => <TextField {...params} label="药物分类"/>}
					inputValue={inputClass}
					onInputChange={(event, newValue) => setInputClass(newValue)}
					value={selectedClass}
					onChange={(event, newValue) => {
						if (newValue == null) {
							setDrugList(drugSummaryList);
							setSelectedClass(null);
							return;
						}
						
						if (typeof newValue !== "string") {
							axios.get(`/api/drug-classes/${newValue.id}/drugs`).then(res => {
								setSelectedClass(newValue);
								setDrugList(res.data);
							});
						} else {
							let drugClass = drugClassList.find(item => item.name.toLowerCase() === newValue.toLowerCase());
							axios.get(`/api/drug-classes/${drugClass.id}/drugs`).then(res => {
								setSelectedClass(drugClass);
								setDrugList(res.data);
							});
						}
					}}
					sx={{
						width: 175,
					}}
					slotProps={{
						popper: {
							sx: {
								'& .MuiAutocomplete-option': {
									wordBreak: 'break-word',
								},
							}
						}
					}}
				/>
			</FormControl>
			<Card
				sx={{
					p: 3,
					flex: 1,
				}}
			>
				{drug.size > 0 && (
					<>
						<Typography variant="h4" fontWeight="bold" mb={1.5}>
							{drug.get("displayName")}
						</Typography>
						<Typography>
							作用分类：{drug.get("classes").filter(item => item.type === "effect").sort((a, b) => a.id - b.id).map(item => item.name).join('、') || "无"}<br/>
							药理分类：{drug.get("classes").filter(item => item.type === "pharmacologic").sort((a, b) => a.id - b.id).map(item => item.name).join('、')}<br/>
							化学分类：{drug.get("classes").filter(item => item.type === "chemical").sort((a, b) => a.id - b.id).map(item => item.name).join('、') || "无"}<br/>
							医疗用途：{drug.get("classes").filter(item => item.type === "therapeutic").sort((a, b) => a.id - b.id).map(item => item.name).join('、') || "无"}<br/>
							法律规范：{drug.get("classes").filter(item => item.type === "legal").sort((a, b) => a.id - b.id).map(item => item.name).join('、') || "无"}<br/>
							危险联用：{drug.get("dangerousInteractions")}
						</Typography>
						{drug.get("physicalDependence") <= 100 ? (
							<Grid container gap={1} alignItems="flex-start" my={1}>
								<DependenceChip text={"心理成瘾性"} score={drug.get("psychologicalDependence")}/>
								<DependenceChip text={"生理成瘾性"} score={drug.get("physicalDependence")}/>
							</Grid>
						) : ""}
						<Box
							component="img"
							sx={{
								my: 2,
								maxWidth: 250,
								maxHeight: 250,
								filter: colorMode === "light" ? "" : "invert(1)",
							}}
							src={"/api/drug-images/" + drug.get("innName") + ".svg"}
							alt={drug.get("innName")}
						/>
						<Typography>
							化学式：{drug.get("molecularFormula")}<br/>
							IUPAC命名：{drug.get("iupacName")}
						</Typography><br/>
						<ChatMarkdown useMarkdown={true}>
							{drug.get("description")}
						</ChatMarkdown>
					</>
				)}
			</Card>
		</>
	);
}

const DependenceChip = memo(function DependenceChip({text, score}) {
	return (
		<Chip
			variant="outlined"
			label={`${text} ${score}`}
			sx={{
				fontSize: 14,
			}}
			avatar={
				<Avatar
					sx={{
						bgcolor: score < 40 ? green[500] :
							(score < 60 ? yellow[600] : (score < 80 ? orange[600] : red[600])),
						'& svg': {
							display: "none",
						}
					}}
				/>
			}
		/>
	);
});

DependenceChip.propTypes = {
	text: PropTypes.string,
	score: PropTypes.number.isRequired,
}