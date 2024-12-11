import {createContext, useContext, useState} from "react";
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
	
	const {isFetched, isError} = useQuery({
		queryKey: ["accountCheck"],
		queryFn: () => (
			axios.get("/api/account/check")
				.then(res => {
					setClientUser(res.data.user);
					localStorage.setItem("user_id", res.data.user?.id);
					localStorage.setItem("username", res.data.user?.username);
					localStorage.setItem("auth_token", res.data.token);
					return res.data;
				})
				.catch((error) => {
					if (error.status === 403) {
						setClientUser(null);
						localStorage.removeItem("user_id");
						localStorage.removeItem("username");
						localStorage.removeItem("auth_token");
						if (window.location.pathname !== "/login") {
							navigate("/register");
						}
					}
					throw error;
				})
		),
		retry: false,
	});
	
	return (
		<ClientUserContext.Provider value={{clientUser, setClientUser, isClientUserLoading: !isFetched}}>
			<Dialog open={isError && location.pathname !== "/register" && location.pathname !== "/login"}>
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