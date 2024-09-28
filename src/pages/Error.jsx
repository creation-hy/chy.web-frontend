import {Alert} from "@mui/material";

export default function Error() {
	document.title = "Error - chy.web";
	
	return (
		<Alert severity="error">呜……页面找不到了……</Alert>
	);
}