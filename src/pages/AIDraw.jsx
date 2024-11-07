import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import {Upload} from "@mui/icons-material";
import Box from "@mui/material/Box";
import {useQuery} from "@tanstack/react-query";
import {Alert, Tab, Tabs} from "@mui/material";
import {useState} from "react";

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
		<Box>
			{data.result.map((item) => (
				<img key={item.id} alt="Generated images" src={"/api/ai-draw-result/" + item.id + ".png"}/>
			))}
		</Box>
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
		<Grid container direction="column" spacing={2}>
			<Box sx={{borderBottom: 1, borderColor: 'divider', mb: 2, mt: 1}}>
				<Tabs value={menuValue} onChange={(event, value) => setMenuValue(value)} centered>
					<Tab label="文生图"/>
					<Tab label="我的作品"/>
				</Tabs>
			</Box>
			{menuValue === 0 ? <TextToImageUI/> : <GeneratedResult/>}
		</Grid>
	);
}