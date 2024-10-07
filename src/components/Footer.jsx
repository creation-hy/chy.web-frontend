import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Facebook, GitHub, Instagram, Pinterest, Twitter, YouTube} from "@mui/icons-material";
import {useMediaQuery} from "@mui/material";
import {useTheme} from "@mui/material/styles";

function Copyright() {
	return (
		<Typography variant="body2" sx={{color: 'text.secondary', mt: 1}}>
			{'Copyright © '}
			chy.web
			&nbsp;
			2021-{new Date().getFullYear()}
		</Typography>
	);
}

export default function Footer() {
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
	
	return (
		<Container
			id="footer"
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: isMobile ? 2 : 4,
				pb: isMobile ? 2 : 4,
				pt: 3,
				textAlign: {sm: 'center', md: 'left'},
			}}
		>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					pt: isMobile ? 2 : 4,
					width: '100%',
					borderTop: '1px solid',
					borderColor: 'divider',
					gap: 1,
				}}
			>
				<Copyright/>
				<Stack
					direction="row"
					spacing={1}
					useFlexGap
					sx={{justifyContent: 'left', color: 'text.secondary'}}
				>
					<IconButton
						color="inherit"
						size="small"
						href="https://github.com/creation-hy"
						aria-label="GitHub"
						sx={{alignSelf: 'center'}}
					>
						<GitHub/>
					</IconButton>
					<IconButton
						color="inherit"
						size="small"
						href="https://www.facebook.com/profile.php?id=61566312665119"
						aria-label="Facebook"
						sx={{alignSelf: 'center'}}
					>
						<Facebook/>
					</IconButton>
					<IconButton
						color="inherit"
						size="small"
						href="https://x.com/creation_hy64"
						aria-label="Twitter"
						sx={{alignSelf: 'center'}}
					>
						<Twitter/>
					</IconButton>
					<IconButton
						color="inherit"
						size="small"
						href="https://www.youtube.com/@creation_hy"
						aria-label="Youtube"
						sx={{alignSelf: 'center'}}
					>
						<YouTube/>
					</IconButton>
					<IconButton
						color="inherit"
						size="small"
						href="https://www.pinterest.com/creation_hy"
						aria-label="Pinterest"
						sx={{alignSelf: 'center'}}
					>
						<Pinterest/>
					</IconButton>
					<IconButton
						color="inherit"
						size="small"
						href="https://www.instagram.com/creation_hy64"
						aria-label="Instagram"
						sx={{alignSelf: 'center'}}
					>
						<Instagram/>
					</IconButton>
				</Stack>
			</Box>
		</Container>
	);
}
