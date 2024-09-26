import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from "@mui/material/TextField";

function ForgotPassword({open, handleClose}) {
	return (
		<Dialog
			open={open}
			onClose={handleClose}
			PaperProps={{
				component: 'form',
				onSubmit: (event) => {
					event.preventDefault();
					handleClose();
				},
			}}
		>
			<DialogTitle>重置密码</DialogTitle>
			<DialogContent
				sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}
			>
				<DialogContentText>
					输入你的邮箱，我们会给你发一封邮件来重置密码。
				</DialogContentText>
				<TextField
					autoFocus
					required
					margin="dense"
					id="email"
					name="email"
					label="邮箱"
					placeholder="邮箱"
					type="email"
					fullWidth
				/>
			</DialogContent>
			<DialogActions sx={{pb: 3, px: 3}}>
				<Button onClick={handleClose}>取消</Button>
				<Button variant="contained" type="submit">
					确认
				</Button>
			</DialogActions>
		</Dialog>
	);
}

ForgotPassword.propTypes = {
	handleClose: PropTypes.func.isRequired,
	open: PropTypes.bool.isRequired,
};

export default ForgotPassword;
