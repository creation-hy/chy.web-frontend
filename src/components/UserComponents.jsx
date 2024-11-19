import Grid from "@mui/material/Grid2";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import {memo} from "react";
import {useNavigate} from "react-router";
import Avatar from "@mui/material/Avatar";
import {Verified} from "@mui/icons-material";
import SvgIcon from "@mui/material/SvgIcon";

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

export const UserBadge = memo(({badge, ...props}) => {
	if (!badge) {
		return null;
	} else if (badge === "Official") {
		return <Verified color="secondary" {...props}/>;
	} else if (badge === "User1") {
		return <Verified color="primary" {...props}/>;
	} else if (badge === "User2") {
		return <Verified color="warning" {...props}/>;
	} else if (badge === "Transgender") {
		return (
			<SvgIcon {...props}>
				<defs>
					<linearGradient id="transgender-badge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="25%" style={{stopColor: '#f5a9b8', stopOpacity: 1}}/>
						<stop offset="100%" style={{stopColor: '#5bcefa', stopOpacity: 1}}/>
					</linearGradient>
				</defs>
				<Verified sx={{fill: 'url(#transgender-badge-gradient)'}}/>
			</SvgIcon>
		);
	}
});

UserBadge.propTypes = {
	badge: PropTypes.string,
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