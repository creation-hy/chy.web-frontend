import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import {styled} from '@mui/material/styles';
import ForgotPassword from './ForgotPassword';
import {GoogleIcon} from './CustomIcons';
import axios from "axios";
import {enqueueSnackbar} from 'notistack';
import {X} from "@mui/icons-material";
import Cookies from "js-cookie";

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
	document.title = "登陆 - chy.web";
	
	const [usernameError, setUsernameError] = useState(false);
	const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
	const [passwordError, setPasswordError] = useState(false);
	const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
	const [open, setOpen] = useState(false);
	
	const handleClickOpen = () => {
		setOpen(true);
	};
	
	const handleClose = () => {
		setOpen(false);
	};
	
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
		
		if (isValid)
			axios.post("/api/login", new FormData(document.getElementById('data-form')), {
				headers: {
					'Content-Type': 'application/json',
				}
			}).then(res => {
				const data = res.data;
				enqueueSnackbar(data["content"], {variant: data["status"] === 1 ? "success" : "error"});
				if (data["status"] === 1) {
					Cookies.set("username", data["username"], {expires: 30, path: "/"});
					Cookies.set("user_token", data["userToken"], {expires: 30, path: "/"});
					window.location.href = "/";
				}
			});
		
		return false;
	};
	
	return (
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
				<FormControl>
					<TextField
						error={usernameError}
						helperText={usernameErrorMessage}
						id="username"
						type="text"
						name="username"
						placeholder="yourname"
						autoComplete="username"
						autoFocus
						required
						fullWidth
						variant="outlined"
						label="用户名或邮箱"
						color={usernameError ? 'error' : 'primary'}
					/>
				</FormControl>
				<FormControl>
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
						label="密码"
						color={passwordError ? 'error' : 'primary'}
					/>
					<Box display="flex" justifyContent="flex-end">
						<Link
							component="button"
							type="button"
							onClick={handleClickOpen}
							variant="body2"
						>
							忘记了密码？
						</Link>
					</Box>
				</FormControl>
				<ForgotPassword open={open} handleClose={handleClose}/>
				<Button
					type="submit"
					fullWidth
					variant="contained"
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
					onClick={() => alert('敬请期待！')}
					startIcon={<GoogleIcon/>}
				>
					使用 Google 登录
				</Button>
				<Button
					type="submit"
					fullWidth
					variant="outlined"
					onClick={() => alert('敬请期待！')}
					startIcon={<X/>}
				>
					使用 Apple 登录
				</Button>
			</Box>
		</Card>
	);
}
