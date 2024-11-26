import {createContext, useContext, useEffect, useState} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Cookies from "js-cookie";

const ClientUserContext = createContext(null);

export const ClientUserProvider = ({children}) => {
	const [clientUser, setClientUser] = useState(null);
	const [isClientUserLoading, setIsClientUserLoading] = useState(true);
	
	useEffect(() => {
		axios.get("/api/account/check").then(res => {
			setClientUser(res.data.user);
			setIsClientUserLoading(false);
			if (res.data && res.data.status !== 1) {
				Cookies.remove("username");
				Cookies.remove("user_token");
			}
		});
	}, []);
	
	return (
		<ClientUserContext.Provider value={{clientUser, setClientUser, isClientUserLoading}}>
			{children}
		</ClientUserContext.Provider>
	);
}

ClientUserProvider.propTypes = {
	children: PropTypes.node,
}

export const useClientUser = () => {
	return useContext(ClientUserContext);
}