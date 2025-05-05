import {CircularProgress} from "@mui/material";
import {HorizontalRule} from "@mui/icons-material";
import Grid from "@mui/material/Grid";
import {memo} from "react";
import PropTypes from "prop-types";

export const LoadMoreIndicator = memo(function LoadMoreIndicator({isFetching, ...props}) {
	return (
		<Grid container alignItems="center" justifyContent="center" {...props}>
			{isFetching ? <CircularProgress size={30}/> : (<HorizontalRule color="disabled" sx={{height: 30}}/>)}
		</Grid>
	);
});

LoadMoreIndicator.propTypes = {
	isFetching: PropTypes.bool.isRequired,
}