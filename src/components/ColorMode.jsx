import {createContext, useContext, useState} from "react";
import PropTypes from "prop-types";
import {useMediaQuery} from "@mui/material";

const ColorModeContext = createContext(null);
const BinaryColorModeContext = createContext(null);

export const ColorModeProvider = ({children}) => {
	if (localStorage.getItem("colorMode") == null)
		localStorage.setItem("colorMode", "auto");
	
	const deviceColorMode = useMediaQuery("(prefers-color-scheme: dark)") ? "dark" : "light";
	const convertToBinaryColorMode = (colorMode) => (colorMode === "auto" ? deviceColorMode : colorMode);
	const [colorMode, setColorMode] = useState(localStorage.getItem("colorMode"));
	const [binaryColorMode, setBinaryColorMode] = useState(convertToBinaryColorMode(colorMode));
	
	const toggleColorMode = () => {
		const newMode = colorMode === "light" ? "dark" : (colorMode === "dark" ? "auto" : "light");
		setColorMode(newMode);
		setBinaryColorMode(convertToBinaryColorMode(newMode));
		localStorage.setItem("colorMode", newMode);
	};
	
	return (
		<ColorModeContext.Provider value={[colorMode, toggleColorMode]}>
			<BinaryColorModeContext.Provider value={[binaryColorMode]}>
				{children}
			</BinaryColorModeContext.Provider>
		</ColorModeContext.Provider>
	);
}

ColorModeProvider.propTypes = {
	children: PropTypes.node,
}

export const useColorMode = () => {
	return useContext(ColorModeContext);
}

export const useBinaryColorMode = () => {
	return useContext(BinaryColorModeContext);
}