import PropTypes from "prop-types";
import Avatar from "@mui/material/Avatar";

export const UserAvatar = ({username, displayName, width, height, ...props}) => {
	return <Avatar src={`/avatars/${username}.png`}
	               alt={displayName}
	               sx={{width: width, height: height}}
	               {...props}/>;
}

UserAvatar.propTypes = {
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	width: PropTypes.number,
	height: PropTypes.number,
}