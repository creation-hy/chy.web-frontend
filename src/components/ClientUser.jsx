import {createContext, useContext, useEffect, useState} from "react";
import PropTypes from "prop-types";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";

const ClientUserContext = createContext(null);

export const ClientUserProvider = ({children}) => {
	const [clientUser, setClientUser] = useState(null);
	
	const {data, isLoading, error} = useQuery({
		queryKey: ["accountCheck"],
		queryFn: () => axios.get("/api/account/check").then(res => res.data),
	});
	
	const clientUserLoading = isLoading;
	
	useEffect(() => {
		if (data)
			setClientUser(data.user);
	}, [data]);
	
	return (
		<ClientUserContext.Provider value={{clientUser, setClientUser, clientUserLoading}}>
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