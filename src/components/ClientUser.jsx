import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";

const ClientUserContext = createContext(null);

export const ClientUserProvider = ({children}) => {
	const [clientUserJSON, setClientUserJSON] = useState({data: undefined, isLoading: true});
	
	const {data} = useQuery({
		queryKey: ["accountCheck"],
		queryFn: () => axios.get("/api/account/check").then(res => res.data),
	});
	
	useEffect(() => {
		if (data)
			setClientUserJSON({data: data.user, isLoading: false});
	}, [data]);
	
	const setClientUser = useCallback((newUser) => {
		setClientUserJSON({data: newUser, isLoading: false});
	}, []);
	
	const value = useMemo(() => ({
		clientUser: clientUserJSON.data,
		setClientUser,
		clientUserLoading: clientUserJSON.isLoading,
	}), [clientUserJSON.data, clientUserJSON.isLoading, setClientUser]);
	
	return (
		<ClientUserContext.Provider value={value}>
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