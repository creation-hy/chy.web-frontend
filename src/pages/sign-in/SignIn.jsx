import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import {createTheme, styled, ThemeProvider} from '@mui/material/styles';
import ForgotPassword from './ForgotPassword';
import {FacebookIcon, GoogleIcon} from './CustomIcons';
import {AppAppBar, AppBarInit} from "src/components/AppAppBar.jsx";
import getCustomTheme from "src/theme/getCustomTheme.jsx";
import Footer from "src/components/Footer.jsx";

const Card = styled(MuiCard)(({theme}) => ({
	display: 'flex',
	flexDirection: 'column',
	alignSelf: 'center',
	width: '100%',
	padding: theme.spacing(4),
	gap: theme.spacing(2),
	margin: 'auto',
	[theme.breakpoints.up('sm')]: {
		maxWidth: '450px',
	},
	boxShadow:
		'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
	...theme.applyStyles('dark', {
		boxShadow:
			'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
	}),
}));

const SignInContainer = styled(Stack)(({theme}) => ({
	padding: 20,
	marginTop: '10vh',
	'&::before': {
		content: '""',
		display: 'block',
		position: 'absolute',
		zIndex: -1,
		inset: 0,
		backgroundImage:
			'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
		backgroundRepeat: 'no-repeat',
		...theme.applyStyles('dark', {
			backgroundImage:
				'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
		}),
	},
}));

export default function SignIn() {
	document.title = "登陆 - chy.web";
	
	const [emailError, setEmailError] = React.useState(false);
	const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
	const [passwordError, setPasswordError] = React.useState(false);
	const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
	const [open, setOpen] = React.useState(false);
	
	const handleClickOpen = () => {
		setOpen(true);
	};
	
	const handleClose = () => {
		setOpen(false);
	};
	
	const handleSubmit = (event) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		console.log({
			email: data.get('email'),
			password: data.get('password'),
		});
	};
	
	const validateInputs = () => {
		const email = document.getElementById('email');
		const password = document.getElementById('password');
		
		let isValid = true;
		
		if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
			setEmailError(true);
			setEmailErrorMessage('请输入合法的邮箱地址。');
			isValid = false;
		} else {
			setEmailError(false);
			setEmailErrorMessage('');
		}
		
		if (!password.value || password.value.length < 6) {
			setPasswordError(true);
			setPasswordErrorMessage('密码长度不得低于6。');
			isValid = false;
		} else {
			setPasswordError(false);
			setPasswordErrorMessage('');
		}
		
		return isValid;
	};
	
	const [mode, toggleColorMode] = AppBarInit();
	const theme = createTheme(getCustomTheme(mode));
	
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline enableColorScheme/>
			<AppAppBar mode={mode} toggleColorMode={toggleColorMode}/>
			<SignInContainer direction="column" justifyContent="space-between">
				<Card variant="outlined">
					<Typography
						component="h1"
						variant="h4"
						sx={{width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)'}}
					>
						登陆
					</Typography>
					<Box
						component="form"
						onSubmit={handleSubmit}
						noValidate
						sx={{
							display: 'flex',
							flexDirection: 'column',
							width: '100%',
							gap: 2,
						}}
					>
						<FormControl>
							<FormLabel htmlFor="email">邮箱</FormLabel>
							<TextField
								error={emailError}
								helperText={emailErrorMessage}
								id="email"
								type="email"
								name="email"
								placeholder="your@email.com"
								autoComplete="email"
								autoFocus
								required
								fullWidth
								variant="outlined"
								color={emailError ? 'error' : 'primary'}
								sx={{ariaLabel: 'email'}}
							/>
						</FormControl>
						<FormControl>
							<Box sx={{display: 'flex', justifyContent: 'space-between'}}>
								<FormLabel htmlFor="password">密码</FormLabel>
								<Link
									component="button"
									onClick={handleClickOpen}
									variant="body2"
									sx={{alignSelf: 'baseline'}}
								>
									忘记了密码？
								</Link>
							</Box>
							<TextField
								error={passwordError}
								helperText={passwordErrorMessage}
								name="password"
								placeholder="••••••"
								type="password"
								id="password"
								autoComplete="current-password"
								autoFocus
								required
								fullWidth
								variant="outlined"
								color={passwordError ? 'error' : 'primary'}
							/>
						</FormControl>
						<FormControlLabel
							control={<Checkbox value="remember" color="primary"/>}
							label="记住我"
						/>
						<ForgotPassword open={open} handleClose={handleClose}/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							onClick={validateInputs}
						>
							登陆
						</Button>
						<Typography sx={{textAlign: 'center'}}>
							还没有账号？{' '}
							<span>
				                <Link
					                href="/register"
					                variant="body2"
					                sx={{alignSelf: 'center'}}
				                >
				                  注册
				                </Link>
                            </span>
						</Typography>
					</Box>
					<Divider>或者</Divider>
					<Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
						<Button
							type="submit"
							fullWidth
							variant="outlined"
							onClick={() => alert('使用Google登录')}
							startIcon={<GoogleIcon/>}
						>
							使用 Google 登录
						</Button>
						<Button
							type="submit"
							fullWidth
							variant="outlined"
							onClick={() => alert('使用Facebook登录')}
							startIcon={<FacebookIcon/>}
						>
							使用 Facebook 登录
						</Button>
					</Box>
				</Card>
			</SignInContainer>
			<Footer/>
		</ThemeProvider>
	);
}
