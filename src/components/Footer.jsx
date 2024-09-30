import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Facebook, GitHub, X} from "@mui/icons-material";

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
	return (
		<Container
			id="footer"
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 4,
				pb: 4,
				pt: 3,
				textAlign: {sm: 'center', md: 'left'},
			}}
		>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					pt: {xs: 4, sm: 4},
					width: '100%',
					borderTop: '1px solid',
					borderColor: 'divider',
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
						href="https://x.com/creation_hy64"
						aria-label="X"
						sx={{alignSelf: 'center'}}
					>
						<X/>
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
				</Stack>
			</Box>
		</Container>
	);
}
