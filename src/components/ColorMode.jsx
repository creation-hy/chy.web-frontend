import {createContext, useContext, useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";

const ColorModeContext = createContext(null);
const BinaryColorModeContext = createContext(null);

export const ColorModeProvider = ({children}) => {
	const [colorMode, setColorMode] = useState(localStorage.getItem("colorMode") ?? "auto");
	
	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
	const [systemMode, setSystemMode] = useState(mediaQuery.matches ? "dark" : "light");
	
	useEffect(() => {
		const handler = (e) => setSystemMode(e.matches ? "dark" : "light");
		
		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, [mediaQuery]);
	
	const binaryColorMode = useMemo(
		() => colorMode === "auto" ? systemMode : colorMode, [colorMode, systemMode]);
	
	const toggleColorMode = () => {
		const newMode = colorMode === "light" ? "dark" : (colorMode === "dark" ? "auto" : "light");
		
		setColorMode(newMode);
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

export const useColorMode = () => useContext(ColorModeContext);

export const useBinaryColorMode = () => useContext(BinaryColorModeContext);