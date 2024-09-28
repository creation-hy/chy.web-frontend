import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import axios from "axios";
import {enqueueSnackbar} from "notistack";

const submit = (event) => {
	event.preventDefault();
	
	const formData = new FormData(document.getElementById("data-form"));
	axios.post("/api/ai-draw/submit", formData, {
		headers: {
			'Content-Type': 'application/json',
		}
	}).then(res => {
		enqueueSnackbar(res.data["content"], {variant: res.data["status"] === 1 ? "success" : "error"});
	})
	
	return false;
};

export default function AIDraw() {
	document.title = "AI绘图 - chy.web"
	
	return (
		<Card variant="outlined" sx={{padding: 4, alignSelf: "center", width: "100%", maxWidth: 800}}>
			<Grid
				component="form"
				id="data-form"
				direction="column"
				container
				onSubmit={submit}
				spacing={2}
			>
				<TextField
					id="positive"
					name="positive"
					label="Prompt"
					placeholder="some words, seperated by commas"
					multiline
				/>
				<TextField
					id="negative"
					name="negative"
					label="Negative Prompt"
					placeholder="some words, seperated by commas"
					multiline
				/>
				<Grid container>
					<TextField
						id="width"
						name="width"
						label="Width"
						placeholder="100~768 (default: 512)"
						sx={{flexGrow: 1}}
					/>
					<TextField
						id="height"
						name="height"
						label="Height"
						placeholder="100~768 (default: 512)"
						sx={{flexGrow: 1}}
					/>
				</Grid>
				<TextField
					id="step"
					name="step"
					label="Steps"
					placeholder="10~30 (default: 20)"
				/>
				<TextField
					id="seed"
					name="seed"
					label="Seed"
					placeholder="0~10^9 (default: random)"
				/>
				<TextField
					id="cfg"
					name="cfg"
					label="CFG Scale"
					placeholder="1~30 (default: 7)"
				/>
				<Grid container>
					<Button variant="contained" type="submit" sx={{flexGrow: 1}}>提交</Button>
					<Button variant="contained" type="button" onClick={() => window.open("/ai-draw/result")} sx={{flexGrow: 1}}>查看结果</Button>
				</Grid>
			</Grid>
		</Card>
	);
}