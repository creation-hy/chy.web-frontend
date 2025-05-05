import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import {styled} from '@mui/material/styles';
import {GoogleIcon} from 'src/pages/sign-in/CustomIcons';
import {Apple, HowToRegOutlined} from "@mui/icons-material";
import Grid from "@mui/material/Grid";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import {useNavigate} from "react-router";
import {useClientUser} from "src/components/ClientUser.jsx";
import {NavigateLink} from "src/components/NavigateComponents.jsx";

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
	const [nameError, setNameError] = useState(false);
	const [nameErrorMessage, setNameErrorMessage] = useState('');
	
	const [verifyLoading, setVerifyLoading] = useState(false);
	const [registerLoading, setRegisterLoading] = useState(false);
	
	const navigate = useNavigate();
	const {clientUser} = useClientUser();
	
	useEffect(() => {
		if (clientUser) {
			navigate(`/user/${clientUser.username}`);
		}
	}, [clientUser, navigate]);
	
	const register = (event) => {
		event.preventDefault();
		
		const email = document.getElementById('email');
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
		
		if (!username.value || username.value.length < 1) {
			setNameError(true);
			setNameErrorMessage('用户名不能为空。');
			isValid = false;
		} else if (!username.value || username.value.length > 15) {
			setNameError(true);
			setNameErrorMessage('用户名长度不能超过15。');
			isValid = false;
		} else if (/[^a-zA-Z0-9-_.]/.test(username.value)) {
			setNameError(true);
			setNameErrorMessage('用户名不能包含特殊字符。');
			isValid = false;
		} else if (/[^a-zA-Z]/.test(username.value[0])) {
			setNameError(true);
			setNameErrorMessage('用户名首位必须是字母。');
			isValid = false;
		} else {
			setNameError(false);
			setNameErrorMessage('');
		}
		
		if (isValid) {
			setRegisterLoading(true);
			axios.post("/api/register", new FormData(document.getElementById("data-form")), {
				headers: {
					'Content-Type': 'application/json',
				}
			}).then(res => {
				const data = res.data;
				enqueueSnackbar(data.content, {variant: data.status === 1 ? "success" : "error"});
				setRegisterLoading(false);
				if (data.status === 1) {
					localStorage.setItem("user_id", data.userId);
					localStorage.setItem("username", data.username);
					localStorage.setItem("auth_token", data.token);
					window.location.href = "/";
				}
			});
		}
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
			setVerifyLoading(true);
			axios.post("/api/register/send-verification", {email: email.value}, {
				headers: {
					'Content-Type': 'application/json',
				}
			}).then(res => {
				const data = res.data;
				enqueueSnackbar(data.content, {variant: data.status === 1 ? "success" : "error"});
				setVerifyLoading(false);
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
				加入chy.web
			</Typography>
			<Box
				component="form"
				id="data-form"
				onSubmit={register}
				sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 1}}
			>
				<FormControl>
					<TextField
						autoFocus
						autoComplete="username"
						name="username"
						required
						fullWidth
						id="username"
						placeholder="字母、数字、下划线、横杠、点"
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
						label="密码"
					/>
				</FormControl>
				<FormControl>
					<Grid container gap={1} flexWrap="nowrap">
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
								color={emailError ? 'error' : 'primary'}
								label="邮箱"
							/>
						</Grid>
						<Grid display="flex">
							<Button
								type="button"
								variant="contained"
								loading={verifyLoading}
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
						name="verificationCode"
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
					loading={registerLoading}
					loadingPosition="start"
					startIcon={<HowToRegOutlined/>}
				>
					注册
				</Button>
				<Typography sx={{textAlign: 'center'}}>
					已经有账号了？{' '}
					<NavigateLink
						href="/login"
						variant="body2"
						underline="always"
						color="primary"
					>
						登录
					</NavigateLink>
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
