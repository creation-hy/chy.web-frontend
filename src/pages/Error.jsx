import {Alert} from "@mui/material";

export default function Error() {
	document.title = "Error - chy.web";
	
	return (
		<Alert severity="error">唔……页面找不到了呢……</Alert>
	);
}