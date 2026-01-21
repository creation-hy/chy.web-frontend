import {Alert} from "@mui/material";

export default function Error() {
	document.title = "页面找不到了呢 - chy.web";
	
	return (
		<Alert severity="error">页面找不到了呢</Alert>
	);
}