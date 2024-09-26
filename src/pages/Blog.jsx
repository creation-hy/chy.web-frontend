import MainContent from 'src/components/MainContent';
import Latest from 'src/components/Latest';
import Box from "@mui/material/Box";

export default function Blog() {
	document.title = "Blog - chy.web"
	
	return (
		<Box>
			<MainContent/>
			<Latest/>
		</Box>
	);
}
