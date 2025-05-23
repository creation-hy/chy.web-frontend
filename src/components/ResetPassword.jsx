import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import axios from "axios";
import {memo, useRef, useState} from "react";
import {enqueueSnackbar} from "notistack";

const ResetPassword = memo(function ResetPassword({open, handleClose}) {
	const emailText = useRef(null);
	const verificationText = useRef(null);
	const passwordText = useRef(null);
	
	const [verifyLoading, setVerifyLoading] = useState(false);
	
	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth
			slotProps={{paper: {sx: {maxWidth: 450}}}}
		>
			<DialogTitle>重置密码</DialogTitle>
			<DialogContent
				sx={{display: 'flex', flexDirection: 'column', gap: 2}}
			>
				<DialogContentText>
					我们需要验证你的邮箱。<br/>
					重置成功后，所有登录此账号的设备都将强制注销。
				</DialogContentText>
				<Grid container gap={1}>
					<TextField
						autoComplete="email"
						inputRef={emailText}
						autoFocus
						required
						id="email"
						name="email"
						label="邮箱"
						placeholder="your@email.com"
						type="email"
						sx={{flex: 1}}
					/>
					<Button
						variant="contained"
						loading={verifyLoading}
						onClick={() => {
							setVerifyLoading(true);
							axios.post("/api/account/reset-password/send-verification", {email: emailText.current.value}, {
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
					</Button>
				</Grid>
				<TextField
					inputRef={verificationText}
					autoComplete="verification"
					name="verificationCode"
					required
					fullWidth
					id="verification"
					placeholder="6位数字"
					label="验证码"
				/>
				<TextField
					inputRef={passwordText}
					autoComplete="new-password"
					type="password"
					name="password"
					required
					fullWidth
					id="password"
					placeholder="••••••"
					label="新密码"
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>取消</Button>
				<Button onClick={() => {
					axios.post("/api/account/reset-password/reset", {
						email: emailText.current.value,
						verificationCode: verificationText.current.value,
						password: passwordText.current.value,
					}, {
						headers: {
							"Content-Type": "application/json",
						},
					}).then(res => {
						enqueueSnackbar(res.data.content, {variant: res.data.status === 1 ? "success" : "error"});
						if (res.data.status === 1) {
							localStorage.removeItem("user_id");
							localStorage.removeItem("username");
							localStorage.removeItem("auth_token");
							setTimeout(() => window.location.href = "/login", 1000);
						}
					});
				}}>更改</Button>
			</DialogActions>
		</Dialog>
	);
});

ResetPassword.propTypes = {
	handleClose: PropTypes.func.isRequired,
	open: PropTypes.bool.isRequired,
};

export default ResetPassword;