import {enqueueSnackbar, SnackbarProvider, useSnackbar} from 'notistack';
import Box from "@mui/material/Box";


function App() {
	const {enqueueSnackbar} = useSnackbar();
	enqueueSnackbar("test");
}

export default function Chat() {
	return (
		<Box>
			<SnackbarProvider/>
			<button onClick={() => enqueueSnackbar('That was easy!', {variant: "warning"})}>Show snackbar</button>
		</Box>
	);
}