import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import {Upload} from "@mui/icons-material";
import Box from "@mui/material/Box";
import {useQuery} from "@tanstack/react-query";
import {Alert, ImageList, ImageListItem, ImageListItemBar, Tab, Tabs} from "@mui/material";
import {useState} from "react";
import {convertDateToLocaleAbsoluteString} from "src/assets/DateUtils.jsx";
import {isMobile} from "react-device-detect";

const GeneratedResult = () => {
	const {data, isLoading, error} = useQuery({
		queryKey: ["ai-draw-result"],
		queryFn: () => axios.get("/api/ai-draw/result").then(res => res.data),
	});
	
	if (isLoading || error)
		return null;
	
	if (data.status !== 1)
		return <Alert severity="error">{data.content}</Alert>;
	
	return (
		<ImageList variant="quilted" cols={isMobile ? 2 : 3}>
			{data.result.map((item) => (
				<ImageListItem key={item.id}>
					<img
						alt="Generated images"
						src={"/api/ai-draw-result/" + item.id + ".png"}
						style={{borderRadius: 15}}
					/>
					<ImageListItemBar
						title={item.width + "*" + item.height}
						subtitle={convertDateToLocaleAbsoluteString(item.time)}
						sx={{
							borderBottomLeftRadius: 15,
							borderBottomRightRadius: 15,
						}}
					/>
				</ImageListItem>
			))}
		</ImageList>
	);
}

const TextToImageUI = () => {
	return (
		<Card variant="outlined" sx={{padding: 3, alignSelf: "center", width: "100%", maxWidth: 800}}>
			<Grid
				component="form"
				direction="column"
				container
				spacing={2}
				onSubmit={(event) => {
					event.preventDefault();
					axios.post("/api/ai-draw/submit", new FormData(event.currentTarget), {
						headers: {
							'Content-Type': 'application/json',
						},
					}).then(res => {
						enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
					});
				}}
			>
				<TextField
					name="positive"
					label="Prompt"
					placeholder="some words, seperated by commas"
					multiline
				/>
				<TextField
					name="negative"
					label="Negative Prompt"
					placeholder="some words, seperated by commas"
					multiline
				/>
				<Grid container>
					<TextField
						name="width"
						label="Width"
						placeholder="100~768"
						sx={{flexGrow: 1}}
					/>
					<TextField
						name="height"
						label="Height"
						placeholder="100~768"
						sx={{flexGrow: 1}}
					/>
				</Grid>
				<Grid container>
					<Button variant="contained" type="submit" sx={{flexGrow: 1}} startIcon={<Upload/>}>提交</Button>
				</Grid>
			</Grid>
		</Card>
	);
}

export default function AIDraw() {
	document.title = "AI绘图 - chy.web";
	
	const [menuValue, setMenuValue] = useState(0);
	
	return (
		<Box>
			<Box sx={{borderBottom: 1, borderColor: 'divider', mb: 2.5, mt: 1}}>
				<Tabs value={menuValue} onChange={(event, value) => setMenuValue(value)} centered>
					<Tab label="文生图"/>
					<Tab label="我的作品"/>
				</Tabs>
			</Box>
			{menuValue === 0 ? <TextToImageUI/> : <GeneratedResult/>}
		</Box>
	);
}