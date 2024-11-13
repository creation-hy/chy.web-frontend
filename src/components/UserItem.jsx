import Grid from "@mui/material/Grid2";
import Link from "@mui/material/Link";
import {UserAvatar} from "src/components/UserAvatar.jsx";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import {memo} from "react";

export const SimpleUserItem = memo(({username, displayName, ...props}) => {
	return (
		<Grid container wrap="nowrap" alignItems="center" spacing={1} {...props}>
			<Link href={"/user/" + username} underline="none">
				<UserAvatar username={username} displayName={displayName}/>
			</Link>
			<Link href={"/user/" + username} underline="hover" color="inherit">
				<Typography fontWeight="bold" maxWidth={150} noWrap textOverflow="ellipsis">
					{displayName}
				</Typography>
			</Link>
		</Grid>
	);
});

SimpleUserItem.propTypes = {
	username: PropTypes.string,
	displayName: PropTypes.string,
}