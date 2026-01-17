import axios from "axios";
import Card from "@mui/material/Card";
import {ChatMarkdown} from "src/components/ChatMarkdown.jsx";
import {Autocomplete, InputLabel, useMediaQuery} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import {useQuery} from "@tanstack/react-query";
import {useNavigate, useParams} from "react-router";
import {memo, useEffect, useMemo, useState} from "react";
import Box from "@mui/material/Box";
import {useBinaryColorMode} from "src/components/ColorMode.jsx";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import {blue, green, orange, red, yellow} from "@mui/material/colors";
import PropTypes from "prop-types";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {ArrowBackOutlined, SortOutlined} from "@mui/icons-material";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";

const SORT_MODES = Object.freeze({
	LAST_UPDATED_DESC: "最新更新",
	COMBINED_ASC: "综合成瘾性升序",
	COMBINED_DESC: "综合成瘾性降序",
	PSYCH_ASC: "心理成瘾性升序",
	PSYCH_DESC: "心理成瘾性降序",
	PHYS_ASC: "生理成瘾性升序",
	PHYS_DESC: "生理成瘾性降序",
});

const CLASS_TYPE = Object.freeze({
	effect: "作用分类",
	pharmacologic: "药理分类",
	chemical: "化学分类",
	therapeutic: "医疗用途",
	legal: "法律规范",
});

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
	const [sortMode, setSortMode] = useState(SORT_MODES.LAST_UPDATED_DESC);
	
	const [mobileSortMenuAnchorEl, setMobileSortMenuAnchorEl] = useState(null);
	
	const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
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
		console.log(selectedClass);
		if (selectedClass == null) {
			if (isDrugListFetched) {
				setDrugList(drugSummaryList);
			}
			return;
		}
		
		axios.get(`/api/drug-classes/${selectedClass.id}/drugs`).then(res => {
			setDrugList(res.data);
		});
	}, [drugSummaryList, isDrugListFetched, selectedClass]);
	
	const sortedDrugList = useMemo(() => {
		const list = [...drugList];
		
		switch (sortMode) {
			case SORT_MODES.LAST_UPDATED_DESC:
				return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
			case SORT_MODES.COMBINED_ASC:
				return list.sort((a, b) => a.psychologicalDependence + a.physicalDependence - b.psychologicalDependence - b.physicalDependence);
			case SORT_MODES.COMBINED_DESC:
				return list.sort((a, b) => b.psychologicalDependence + b.physicalDependence - a.psychologicalDependence - a.physicalDependence);
			case SORT_MODES.PSYCH_ASC:
				return list.sort((a, b) => a.psychologicalDependence - b.psychologicalDependence);
			case SORT_MODES.PSYCH_DESC:
				return list.sort((a, b) => b.psychologicalDependence - a.psychologicalDependence);
			case SORT_MODES.PHYS_ASC:
				return list.sort((a, b) => a.physicalDependence - b.physicalDependence);
			case SORT_MODES.PHYS_DESC:
				return list.sort((a, b) => b.physicalDependence - a.physicalDependence);
		}
	}, [drugList, sortMode]);
	
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
					mt: 0.75,
					mb: 2,
				}}
			>
				<Autocomplete
					freeSolo
					selectOnFocus
					blurOnSelect
					handleHomeEndKeys
					options={sortedDrugList.map(item => {
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
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							let lowerCaseValue = inputValue.toLowerCase();
							let drug = sortedDrugList.find(item => item.displayName.toLowerCase().startsWith(lowerCaseValue)
								|| item.innName.toLowerCase().startsWith(lowerCaseValue));
							
							if (drug && drug.innName !== selectedValue?.innName) {
								setSelectedValue({innName: drug.innName, displayName: drug.displayName});
								navigate(`/drugs/${drug.innName}`);
							}
						}
					}}
					onChange={(event, newValue) => {
						if (newValue == null || event.key === "Enter") {
							return;
						}
						
						if (newValue !== selectedValue) {
							setSelectedValue(newValue);
							navigate(`/drugs/${newValue.innName}`);
						}
					}}
					sx={{width: 225}}
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
				<Autocomplete
					freeSolo
					selectOnFocus
					blurOnSelect
					handleHomeEndKeys
					options={drugClassList}
					groupBy={option => CLASS_TYPE[option.type]}
					getOptionKey={option => option.id}
					getOptionLabel={option => option.nameZh ?? option}
					isOptionEqualToValue={(option, value) => option.id === value.id}
					renderInput={(params) => <TextField {...params} label="药物分类"/>}
					inputValue={inputClass}
					onInputChange={(event, newValue) => setInputClass(newValue)}
					value={selectedClass}
					onChange={(event, newValue) => {
						if (newValue == null) {
							setSelectedClass(null);
							return;
						}
						
						if (typeof newValue !== "string") {
							setSelectedClass(newValue);
						} else {
							let drugClass = drugClassList.find(item => item.name.toLowerCase() === newValue.toLowerCase());
							setSelectedClass(drugClass);
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
								'& .MuiAutocomplete-groupLabel': {
									color: theme => theme.palette.primary.main,
									backgroundColor: colorMode === "light" ? blue[50] : "#1C2831",
								},
							}
						}
					}}
				/>
				{!isSmallScreen ? (
					<FormControl sx={{width: 160}}>
						<InputLabel id="order-select-label">排序方式</InputLabel>
						<Select
							variant="outlined"
							labelId="order-select-label"
							label="排序方式"
							defaultValue={SORT_MODES.LAST_UPDATED_DESC}
							onChange={(event) => {
								setSortMode(event.target.value);
							}}
						>
							{Object.entries(SORT_MODES).map(([key, value]) => (
								<MenuItem key={key} value={value}>{value}</MenuItem>
							))}
						</Select>
					</FormControl>
				) : (
					<>
						<Button
							variant="outlined"
							onClick={e => setMobileSortMenuAnchorEl(e.currentTarget)}
						>
							<SortOutlined/>
						</Button>
						<Menu
							anchorEl={mobileSortMenuAnchorEl}
							open={Boolean(mobileSortMenuAnchorEl)}
							onClose={() => setMobileSortMenuAnchorEl(null)}
						>
							{Object.entries(SORT_MODES).map(([key, value]) => (
								<MenuItem
									key={key}
									selected={sortMode === value}
									onClick={() => {
										setSortMode(value);
										setMobileSortMenuAnchorEl(null);
									}}
								>
									{value}
								</MenuItem>
							))}
						</Menu>
					</>
				)}
			</FormControl>
			<Card
				sx={{
					p: 3,
					flex: 1,
				}}
			>
				{drug.size > 0 && (
					<>
						<Typography variant="h4" fontWeight="bold">
							{drug.get("displayName")}
						</Typography>
						<Typography variant="subtitle1" color="text.secondary" gutterBottom>
							{drug.get("innName")}
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
								m: 2,
								maxWidth: 225,
								filter: colorMode === "light" ? "" : "invert(1)",
							}}
							src={"/api/drug-images/" + drug.get("innName") + ".svg"}
							alt={drug.get("innName")}
						/>
						<Box>
							{Object.entries(CLASS_TYPE).map(([key, value]) => {
								const items = drug.get("classes")
									.filter(item => item.type === key)
									.sort((a, b) => a.id - b.id);
								
								return (
									<Box key={key} sx={{mb: 1.5}}>
										<Typography variant="h6" sx={{mb: 0.125}}>
											{value}
										</Typography>
										{items.length > 0 ? (
											<Stack direction="row" gap={1} flexWrap="wrap">
												{items.map(item => (
													<Chip
														key={item.id}
														label={item.nameZh}
														variant="outlined"
														color={item.description ? "primary" : "inherit"}
														onClick={() => {
															if (item.description) {
																navigate(`/drug-classes/${item.nameEn}`);
															} else {
																setSelectedClass(item);
																window.scrollTo({top: 0, behavior: "smooth"});
															}
														}}
													/>
												))}
											</Stack>
										) : (
											<Typography variant="body1">
												无
											</Typography>
										)}
									</Box>
								);
							})}
						</Box>
						<Card variant="outlined" sx={{my: 2, p: 2}}>
							<Typography color="text.secondary" fontWeight="bold" gutterBottom>
								化学信息
							</Typography>
							<Stack spacing={1}>
								<Box>
									<Typography variant="caption" color="text.secondary">
										化学式
									</Typography>
									<Typography variant="body2">
										{drug.get("molecularFormula")}
									</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">
										IUPAC 命名
									</Typography>
									<Typography variant="body2">
										{drug.get("iupacName")}
									</Typography>
								</Box>
							</Stack>
						</Card>
						<ChatMarkdown useMarkdown>
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

export const DrugClassWiki = () => {
	const {className} = useParams();
	const [colorMode] = useBinaryColorMode();
	const navigate = useNavigate();
	
	const {data, isFetched} = useQuery({
		queryKey: ["drugs", "getClassData", className],
		queryFn: () => axios.get(`/api/drug-classes/${className}`).then(res => res.data),
	});
	
	if (!isFetched) {
		return null;
	}
	
	document.title = `${data.nameZh} - DrugWiki - chy.web`;
	
	return (
		<Card
			sx={{
				p: 3,
				flex: 1,
			}}
		>
			<Grid container alignItems="flex-start" gap={1}>
				{window.history.state.idx ? (
					<IconButton onClick={() => navigate(-1)}>
						<ArrowBackOutlined/>
					</IconButton>
				) : null}
				<Box>
					<Typography variant="h4" fontWeight="bold">
						{data.nameZh}
					</Typography>
					<Typography variant="subtitle1" color="text.secondary">
						{data.nameEn}
					</Typography>
				</Box>
			</Grid>
			<Box
				component="img"
				sx={{
					m: 2,
					maxWidth: 225,
					filter: colorMode === "light" ? "" : "invert(1)",
				}}
				src={"/api/drug-images/classes/" + className + ".svg"}
				alt={className}
			/>
			<ChatMarkdown useMarkdown>
				{data.description}
			</ChatMarkdown>
		</Card>
	);
}