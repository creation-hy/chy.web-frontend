import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import {createTheme, styled, ThemeProvider} from '@mui/material/styles';
import {GoogleIcon} from './CustomIcons';
import getCustomTheme from "src/theme/getCustomTheme.jsx";
import {AppAppBar, AppBarInit} from "src/components/AppAppBar.jsx";
import Footer from "src/components/Footer.jsx";
import {X} from "@mui/icons-material";
import Grid from "@mui/material/Grid2";
import axios from "axios";
import {enqueueSnackbar, SnackbarProvider} from "notistack";
import Cookies from "js-cookie";

const Card = styled(MuiCard)(({theme}) => ({
	display: 'flex',
	flexDirection: 'column',
	alignSelf: 'center',
	width: '100%',
	padding: theme.spacing(4),
	gap: theme.spacing(2),
	margin: 'auto',
	boxShadow:
		'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
	[theme.breakpoints.up('sm')]: {
		width: '450px',
	},
	...theme.applyStyles('dark', {
		boxShadow:
			'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
	}),
}));

const SignUpContainer = styled(Stack)(({theme}) => ({
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

export default function SignUp() {
	document.title = "注册 - chy.web";
	
	const [emailError, setEmailError] = React.useState(false);
	const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
	const [passwordError, setPasswordError] = React.useState(false);
	const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
	const [nameError, setNameError] = React.useState(false);
	const [nameErrorMessage, setNameErrorMessage] = React.useState('');
	
	const register = () => {
		const email = document.getElementById('email');
		const password = document.getElementById('password');
		const username = document.getElementById('username');
		
		let isValid = true;
		
		if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
			setEmailError(true);
			setEmailErrorMessage('请输入合法的邮箱地址。');
			isValid = false;
		} else {
			setEmailError(false);
			setEmailErrorMessage('');
		}
		
		if (!password.value || password.value.length < 4) {
			setPasswordError(true);
			setPasswordErrorMessage('密码长度不能低于4。');
			isValid = false;
		} else {
			setPasswordError(false);
			setPasswordErrorMessage('');
		}
		
		if (!username.value || username.value.length < 1) {
			setNameError(true);
			setNameErrorMessage('用户名不能为空。');
			isValid = false;
		} else {
			setNameError(false);
			setNameErrorMessage('');
		}
		
		if (isValid)
			axios.post("/api/register", new FormData(document.getElementById("data-form")), {
				headers: {
					'Content-Type': 'application/json',
				}
			}).then(res => {
				const data = res.data;
				enqueueSnackbar(data["content"], {variant: data["status"] === 1 ? "success" : "error"});
				if (data["status"] === 1) {
					Cookies.set("username", data["username"], {expires: 30, path: "/"});
					Cookies.set("user_token", data["user_token"], {expires: 30, path: "/"});
				}
			});
	};
	
	const verify = () => {
		const email = document.getElementById('email');
		
		let isValid = true;
		
		if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
			setEmailError(true);
			setEmailErrorMessage('请输入合法的邮箱地址。');
			isValid = false;
		} else {
			setEmailError(false);
			setEmailErrorMessage('');
		}
		
		if (isValid)
			axios.post("/api/account/send-verification", {email: email.value}, {
				headers: {
					'Content-Type': 'application/json',
				}
			}).then(res => {
				const data = res.data;
				enqueueSnackbar(data["content"], {variant: data["status"] === 1 ? "success" : "error"});
			});
	};
	
	const [mode, toggleColorMode] = AppBarInit();
	const theme = createTheme(getCustomTheme(mode));
	
	return (
		<ThemeProvider theme={theme}>
			<SnackbarProvider/>
			<CssBaseline enableColorScheme/>
			<AppAppBar mode={mode} toggleColorMode={toggleColorMode}/>
			<SignUpContainer direction="column" justifyContent="space-between">
				<Card variant="outlined">
					<Typography
						component="h1"
						variant="h4"
						sx={{width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)'}}
					>
						注册
					</Typography>
					<Box
						component="form"
						id="data-form"
						onSubmit={null}
						sx={{display: 'flex', flexDirection: 'column', gap: 2}}
					>
						<FormControl>
							<FormLabel htmlFor="username">用户名</FormLabel>
							<TextField
								autoComplete="username"
								name="username"
								required
								fullWidth
								id="username"
								placeholder="中英文、下划线、横杠、点"
								error={nameError}
								helperText={nameErrorMessage}
								color={nameError ? 'error' : 'primary'}
							/>
						</FormControl>
						<FormControl>
							<FormLabel htmlFor="password">密码</FormLabel>
							<TextField
								required
								fullWidth
								name="password"
								placeholder="••••••"
								type="password"
								id="password"
								autoComplete="new-password"
								variant="outlined"
								error={passwordError}
								helperText={passwordErrorMessage}
								color={passwordError ? 'error' : 'primary'}
							/>
						</FormControl>
						<FormControl>
							<FormLabel htmlFor="email">邮箱</FormLabel>
							<Grid container spacing={0.5} flexWrap="nowrap">
								<Grid flexGrow={1}>
									<TextField
										required
										fullWidth
										id="email"
										placeholder="your@email.com"
										name="email"
										autoComplete="email"
										variant="outlined"
										error={emailError}
										helperText={emailErrorMessage}
										color={passwordError ? 'error' : 'primary'}
									/>
								</Grid>
								<Grid>
									<Button
										type="button"
										variant="contained"
										onClick={verify}
									>
										验证
									</Button>
								</Grid>
							</Grid>
						</FormControl>
						<FormControl>
							<FormLabel htmlFor="verification">验证码</FormLabel>
							<TextField
								autoComplete="verification"
								name="verification"
								required
								fullWidth
								id="verification"
								placeholder="6位数字"
							/>
						</FormControl>
						<Button
							type="button"
							fullWidth
							variant="contained"
							onClick={register}
						>
							注册
						</Button>
						<Typography sx={{textAlign: 'center'}}>
							已经有账号了？{' '}
							<span>
			                    <Link
				                    href="/login"
				                    variant="body2"
				                    sx={{alignSelf: 'center'}}
			                    >
			                        登陆
			                    </Link>
							</span>
						</Typography>
					</Box>
					<Divider>
						<Typography sx={{color: 'text.secondary'}}>或者</Typography>
					</Divider>
					<Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
						<Button
							type="submit"
							fullWidth
							variant="outlined"
							onClick={() => alert('使用Google注册')}
							startIcon={<GoogleIcon/>}
						>
							使用 Google 注册
						</Button>
						<Button
							type="submit"
							fullWidth
							variant="outlined"
							onClick={() => alert('使用Facebook注册')}
							startIcon={<X/>}
						>
							使用 Apple 注册
						</Button>
					</Box>
				</Card>
			</SignUpContainer>
			<Footer/>
		</ThemeProvider>
	);
}
