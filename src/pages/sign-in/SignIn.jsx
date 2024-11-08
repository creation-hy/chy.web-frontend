import {useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import {styled} from '@mui/material/styles';
import {GoogleIcon} from './CustomIcons';
import axios from "axios";
import {enqueueSnackbar} from 'notistack';
import {Apple, LoginOutlined} from "@mui/icons-material";
import Cookies from "js-cookie";
import ResetPassword from "src/components/ResetPassword.jsx";
import {Tab, Tabs} from "@mui/material";
import {useClientUser} from "src/components/ClientUser.jsx";
import {LoadingButton} from "@mui/lab";

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

export default function SignIn() {
	document.title = "登录 - chy.web";
	
	const [loginMethod, setLoginMethod] = useState(0);
	const [usernameError, setUsernameError] = useState(false);
	const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
	const [passwordError, setPasswordError] = useState(false);
	const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
	const [open, setOpen] = useState(false);
	
	const [verifyLoading, setVerifyLoading] = useState(false);
	const [loginLoading, setLoginLoading] = useState(false);
	
	const emailText = useRef(null);
	
	const {clientUser} = useClientUser();
	
	if (clientUser)
		window.location.href = "/user/" + clientUser.username;
	
	const logIn = (event) => {
		event.preventDefault();
		
		const username = document.getElementById('username');
		const password = document.getElementById('password');
		
		let isValid = true;
		
		if (!username.value) {
			setUsernameError(true);
			setUsernameErrorMessage('用户名或邮箱不能为空。');
			isValid = false;
		} else {
			setUsernameError(false);
			setUsernameErrorMessage('');
		}
		
		if (!password.value) {
			setPasswordError(true);
			setPasswordErrorMessage('密码不能为空。');
			isValid = false;
		} else {
			setPasswordError(false);
			setPasswordErrorMessage('');
		}
		
		if (isValid) {
			setLoginLoading(true);
			axios.post("/api/login/" + (loginMethod === 0 ? "password-login" : "verification-code-login"),
				new FormData(document.getElementById('data-form')), {
					headers: {
						'Content-Type': 'application/json',
					},
				}).then(res => {
				const data = res.data;
				enqueueSnackbar(data.content, {variant: data.status === 1 ? "success" : "error"});
				setLoginLoading(false);
				if (data.status === 1) {
					Cookies.set("username", data.username, {path: "/", expires: 30});
					Cookies.set("user_token", data["userToken"], {path: "/", expires: 30});
					window.location.href = "/";
				}
			});
		}
		
		return false;
	};
	
	return (
		<Card variant="outlined">
			<Typography variant="h4" sx={{mb: -1}}>
				登录
			</Typography>
			<Box sx={{pb: 1}}>
				<Tabs value={loginMethod} onChange={(event, value) => {
					setLoginMethod(value);
				}}>
					<Tab label="密码登录"/>
					<Tab label="验证码登录"/>
				</Tabs>
			</Box>
			<Box
				component="form"
				id="data-form"
				onSubmit={logIn}
				noValidate
				sx={{
					display: 'flex',
					flexDirection: 'column',
					width: '100%',
					gap: 2,
				}}
			>
				<FormControl sx={{display: "flex", flexDirection: "row", gap: 0.5}}>
					{loginMethod === 0 ?
						<TextField
							error={usernameError}
							helperText={usernameErrorMessage}
							id="username"
							name="username"
							placeholder="yourname"
							autoComplete="username"
							autoFocus
							required
							label="用户名或邮箱"
							color={usernameError ? 'error' : 'primary'}
							sx={{flex: 1}}
						/> :
						<>
							<TextField
								inputRef={emailText}
								error={usernameError}
								helperText={usernameErrorMessage}
								id="username"
								name="email"
								placeholder="your@email.com"
								autoComplete="email"
								autoFocus
								required
								label="邮箱"
								color={usernameError ? 'error' : 'primary'}
								sx={{flex: 1}}
							/>
							<LoadingButton
								variant="contained"
								loading={verifyLoading}
								onClick={() => {
									setVerifyLoading(true);
									axios.post("/api/login/send-verification", {email: emailText.current.value}, {
										headers: {
											"Content-Type": "application/json",
										},
									}).then(res => {
										enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
										setVerifyLoading(false);
									});
								}}
							>
								验证
							</LoadingButton>
						</>}
				</FormControl>
				<FormControl>
					{loginMethod === 0 ? <TextField
						key="password"
						error={passwordError}
						helperText={passwordErrorMessage}
						name="password"
						placeholder="••••••"
						type="password"
						id="password"
						autoComplete="current-password"
						required
						fullWidth
						label="密码"
						color={passwordError ? 'error' : 'primary'}
					/> : <TextField
						key="verification"
						error={passwordError}
						helperText={passwordErrorMessage}
						name="verificationCode"
						placeholder="6位数字"
						autoComplete="verification"
						id="password"
						required
						fullWidth
						label="验证码"
						color={passwordError ? 'error' : 'primary'}
					/>}
					<Box display="flex" justifyContent="flex-end">
						<Link
							component="button"
							type="button"
							onClick={() => setOpen(true)}
							variant="body2"
						>
							忘记了密码？
						</Link>
					</Box>
				</FormControl>
				<ResetPassword open={open} handleClose={() => setOpen(false)}/>
				<LoadingButton
					type="submit"
					fullWidth
					variant="contained"
					loading={loginLoading}
					loadingPosition="start"
					startIcon={<LoginOutlined/>}
				>
					登录
				</LoadingButton>
				<Typography sx={{textAlign: 'center'}}>
					还没有账号？{' '}
					<Link
						href={"/register"}
						variant="body2"
						sx={{alignSelf: 'center'}}
					>
						注册
					</Link>
				</Typography>
			</Box>
			<Divider>
				<Typography color="textSecondary">或者</Typography>
			</Divider>
			<Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
				<Button
					type="submit"
					fullWidth
					variant="outlined"
					onClick={() => alert('敬请期待！')}
					startIcon={<GoogleIcon/>}
					sx={{textTransform: 'none'}}
				>
					使用 Google 登录
				</Button>
				<Button
					type="submit"
					fullWidth
					variant="outlined"
					onClick={() => alert('敬请期待！')}
					startIcon={<Apple sx={{color: "black"}}/>}
					sx={{textTransform: 'none'}}
				>
					使用 Apple 登录
				</Button>
			</Box>
		</Card>
	);
}
