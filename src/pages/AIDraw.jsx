import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";

export default function AIDraw() {
	return (
		<Card variant="outlined">
			<TextField
				id="prompt"
				label="Prompt"
				multiline
			/>
			<TextField
				id="negative-prompt"
				label="Negative Prompt"
				multiline
			/>
		</Card>
	);
}