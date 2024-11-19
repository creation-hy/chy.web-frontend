import Grid from "@mui/material/Grid2";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import {memo} from "react";
import {useNavigate} from "react-router";
import Avatar from "@mui/material/Avatar";

export const UserAvatar = memo(({username, displayName, avatarVersion, width, height, ...props}) => {
	return (
		<Avatar
			src={`/avatars/${username}.webp?v=${avatarVersion}`}
			alt={displayName}
			sx={{width: width, height: height}}
			{...props}
		/>
	);
});

UserAvatar.propTypes = {
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
	width: PropTypes.number,
	height: PropTypes.number,
}

export const SimpleUserItem = memo(({username, displayName, avatarVersion, disableNavigate = false, ...props}) => {
	const navigate = useNavigate();
	
	return (
		<Grid container wrap="nowrap" alignItems="center" spacing={1} height="100%" {...props}>
			<Link onClick={disableNavigate ? undefined : () => navigate(`/user/${username}`)} underline="none" sx={{cursor: "pointer"}}>
				<UserAvatar username={username} displayName={displayName} avatarVersion={avatarVersion}/>
			</Link>
			<Typography
				fontWeight="bold"
				maxWidth={150}
				noWrap
				overflow="hidden"
				textOverflow="ellipsis"
				onClick={disableNavigate ? undefined : () => navigate(`/user/${username}`)}
				sx={{cursor: "pointer"}}
			>
				{displayName}
			</Typography>
		</Grid>
	);
});

SimpleUserItem.propTypes = {
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
	disableNavigate: PropTypes.bool,
}