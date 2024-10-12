import {createContext, useContext, useState} from "react";
import PropTypes from "prop-types";

const ColorModeContext = createContext(null);

export const ColorModeProvider = ({children}) => {
	if (localStorage.getItem('colorMode') == null)
		localStorage.setItem('colorMode', 'light');
	
	const [colorMode, setColorMode] = useState(localStorage.getItem('colorMode'));
	
	const toggleColorMode = () => {
		const newMode = colorMode === 'dark' ? 'light' : 'dark';
		setColorMode(newMode);
		localStorage.setItem('colorMode', newMode);
	};
	
	return (
		<ColorModeContext.Provider value={[colorMode, toggleColorMode]}>
			{children}
		</ColorModeContext.Provider>
	);
}

ColorModeProvider.propTypes = {
	children: PropTypes.node,
}

export const useColorMode = () => {
	return useContext(ColorModeContext);
}