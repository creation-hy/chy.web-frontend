import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Facebook, GitHub, LinkedIn, X} from "@mui/icons-material";

function Copyright() {
	return (
		<Typography variant="body2" sx={{color: 'text.secondary', mt: 1}}>
			{'Copyright © '}
			chy.web
			&nbsp;
			{new Date().getFullYear()}
		</Typography>
	);
}

export default function Footer() {
	return (
		<React.Fragment>
			<Container
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: {xs: 4, sm: 8},
					py: {xs: 4, sm: 4},
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
					<div>
						<Copyright/>
					</div>
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
						<IconButton
							color="inherit"
							size="small"
							href="https://www.linkedin.com/in/hy-creation-4b46a3329"
							aria-label="LinkedIn"
							sx={{alignSelf: 'center'}}
						>
							<LinkedIn/>
						</IconButton>
					</Stack>
				</Box>
			</Container>
		</React.Fragment>
	);
}
