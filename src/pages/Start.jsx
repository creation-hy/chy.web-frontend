import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Badge} from "@mui/material";
import Footer from "src/components/Footer.jsx";
import Grid from "@mui/material/Grid2";
import Link from "@mui/material/Link";

export default function Start() {
	document.title = "关于 - chy.web";
	
	return (
		<Grid container direction="column" justifyContent="space-between" sx={{flex: 1}}>
			<Box>
				<Typography variant="h3" align="center" fontWeight="bold" mt={1}>
					<Badge badgeContent="Beta" color="primary">
						chy.web 5.1
					</Badge>
				</Typography>
				<Typography variant="h4" align="center">全新升级</Typography>
				<Typography variant="h6" align="center">前端重写，采用SpringBoot + React</Typography>
			</Box>
			<Box>
				<Typography align="center">
					开发团队：<Link href={"/user/creation_hy"}>chy</Link>, <Link href={"/user/Administrator"}>6913</Link>
				</Typography>
				<Typography align="center">
					官方账号：<Link href={"/user/chy.web"}>chy.web</Link>
				</Typography>
				<Footer/>
			</Box>
		</Grid>
	);
}