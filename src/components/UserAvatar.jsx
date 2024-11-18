import PropTypes from "prop-types";
import Avatar from "@mui/material/Avatar";
import {memo} from "react";

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