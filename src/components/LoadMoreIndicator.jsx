import {CircularProgress} from "@mui/material";
import {HorizontalRule} from "@mui/icons-material";
import Grid from "@mui/material/Grid2";
import {memo} from "react";
import PropTypes from "prop-types";

export const LoadMoreIndicator = memo(function LoadMoreIndicator({isLoading, isFetching}) {
	return (
		<Grid container alignItems="center" justifyContent="center" mt={isLoading ? 4 : 2} mb={-1}>
			{isFetching ? <CircularProgress size={30}/> : <HorizontalRule color="disabled" sx={{height: 30}}/>}
		</Grid>
	);
});

LoadMoreIndicator.propTypes = {
	isLoading: PropTypes.bool.isRequired,
	isFetching: PropTypes.bool.isRequired,
}