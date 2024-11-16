import Grid from "@mui/material/Grid2";
import Link from "@mui/material/Link";
import {UserAvatar} from "src/components/UserAvatar.jsx";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import {memo} from "react";
import {useNavigate} from "react-router";

export const SimpleUserItem = memo(({username, displayName, ...props}) => {
	const navigate = useNavigate();
	
	return (
		<Grid container wrap="nowrap" alignItems="center" spacing={1} height="100%" {...props}>
			<Link onClick={() => navigate(`/user/${username}`)} underline="none">
				<UserAvatar username={username} displayName={displayName}/>
			</Link>
			<Typography
				fontWeight="bold"
				maxWidth={150}
				noWrap
				overflow="hidden"
				textOverflow="ellipsis"
				onClick={() => navigate(`/user/${username}`)}
				sx={{cursor: "pointer"}}
			>
				{displayName}
			</Typography>
		</Grid>
	);
});

SimpleUserItem.propTypes = {
	username: PropTypes.string,
	displayName: PropTypes.string,
}