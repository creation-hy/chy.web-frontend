import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import {Upload, Visibility} from "@mui/icons-material";

export default function AIDraw() {
	document.title = "AI绘图 - chy.web";
	
	return (
		<Card variant="outlined" sx={{padding: 4, alignSelf: "center", width: "100%", maxWidth: 800}}>
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
						enqueueSnackbar(res.data["content"], {variant: res.data["status"] === 1 ? "success" : "error"});
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
						placeholder="100~768 (default: 512)"
						sx={{flexGrow: 1}}
					/>
					<TextField
						name="height"
						label="Height"
						placeholder="100~768 (default: 512)"
						sx={{flexGrow: 1}}
					/>
				</Grid>
				<TextField
					name="step"
					label="Steps"
					placeholder="10~30 (default: 20)"
				/>
				<TextField
					name="seed"
					label="Seed"
					placeholder="0~10^9 (default: random)"
				/>
				<TextField
					name="cfg"
					label="CFG Scale"
					placeholder="1~30 (default: 7)"
				/>
				<Grid container>
					<Button variant="contained" type="submit" sx={{flexGrow: 1}} startIcon={<Upload/>}>提交</Button>
					<Button
						variant="contained" type="button" sx={{flexGrow: 1}} startIcon={<Visibility/>}
						href={window.location.href + "/result"}
					>查看结果</Button>
				</Grid>
			</Grid>
		</Card>
	);
}