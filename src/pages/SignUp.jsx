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
import {GoogleIcon} from 'src/pages/sign-in/CustomIcons';
import {X} from "@mui/icons-material";
import Grid from "@mui/material/Grid2";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
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

export default function SignUp() {
	document.title = "注册 - chy.web";
	
	const [emailError, setEmailError] = useState(false);
	const [emailErrorMessage, setEmailErrorMessage] = useState('');
	const [passwordError, setPasswordError] = useState(false);
	const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
	const [nameError, setNameError] = useState(false);
	const [nameErrorMessage, setNameErrorMessage] = useState('');
	
	const register = (event) => {
		event.preventDefault();
		
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
					Cookies.set("user_token", data["userToken"], {expires: 30, path: "/"});
					window.location.href = "/";
				}
			});
		
		return false;
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
		
		if (isValid) {
			axios.post("/api/account/send-verification", {email: email.value}, {
				headers: {
					'Content-Type': 'application/json',
				}
			}).then(res => {
				const data = res.data;
				enqueueSnackbar(data["content"], {variant: data["status"] === 1 ? "success" : "error"});
			});
		}
	};
	
	return (
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
				onSubmit={register}
				sx={{display: 'flex', flexDirection: 'column', gap: 2}}
			>
				<FormControl>
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
						label="用户名"
					/>
				</FormControl>
				<FormControl>
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
						label="密码"
					/>
				</FormControl>
				<FormControl>
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
								label="邮箱"
							/>
						</Grid>
						<Grid display="flex">
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
					<TextField
						autoComplete="verification"
						name="verification"
						required
						fullWidth
						id="verification"
						placeholder="6位数字"
						label="验证码"
					/>
				</FormControl>
				<Button
					type="submit"
					fullWidth
					variant="contained"
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
				<Typography color="textSecondary">或者</Typography>
			</Divider>
			<Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
				<Button
					type="submit"
					fullWidth
					variant="outlined"
					onClick={() => alert('敬请期待！')}
					startIcon={<GoogleIcon/>}
				>
					使用 Google 注册
				</Button>
				<Button
					type="submit"
					fullWidth
					variant="outlined"
					onClick={() => alert('敬请期待！')}
					startIcon={<X/>}
				>
					使用 Apple 注册
				</Button>
			</Box>
		</Card>
	);
}
