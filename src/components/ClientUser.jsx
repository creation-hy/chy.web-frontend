import {createContext, useContext, useLayoutEffect, useState} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {useLocation, useNavigate} from "react-router";
import Dialog from "@mui/material/Dialog";
import SignUp from "src/pages/SignUp.jsx";
import {useQuery} from "@tanstack/react-query";

const ClientUserContext = createContext(null);

export const ClientUserProvider = ({children}) => {
	const navigate = useNavigate();
	const location = useLocation();
	
	const [clientUser, setClientUser] = useState(null);
	
	const {data, error, isFetched} = useQuery({
		queryKey: ["accountCheck"],
		queryFn: () => (
			axios.get("/api/account/check").then(res => res.data)
		),
		retry: false,
	});
	
	useLayoutEffect(() => {
		if (error?.status === 403) {
			setClientUser(null);
			localStorage.removeItem("user_id");
			localStorage.removeItem("username");
			localStorage.removeItem("auth_token");
			if (window.location.pathname !== "/login") {
				navigate("/register");
			}
		}
	}, [error, navigate]);
	
	useLayoutEffect(() => {
		if (data) {
			setClientUser(data.user);
			localStorage.setItem("user_id", data.user?.id);
			localStorage.setItem("username", data.user?.username);
			localStorage.setItem("auth_token", data.token);
		}
	}, [data]);
	
	return (
		<ClientUserContext.Provider value={{clientUser, setClientUser, isClientUserLoading: !isFetched}}>
			<Dialog open={error?.status === 403 && location.pathname !== "/register" && location.pathname !== "/login"}>
				<SignUp/>
			</Dialog>
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