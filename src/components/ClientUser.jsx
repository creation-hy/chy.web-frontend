import {createContext, useContext, useEffect, useState} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {useLocation, useNavigate} from "react-router";
import Dialog from "@mui/material/Dialog";
import SignUp from "src/pages/SignUp.jsx";

const ClientUserContext = createContext(null);

export const ClientUserProvider = ({children}) => {
	const navigate = useNavigate();
	const location = useLocation();
	
	const [clientUser, setClientUser] = useState(null);
	const [isClientUserLoading, setIsClientUserLoading] = useState(true);
	
	useEffect(() => {
		axios.get("/api/account/check").then(res => {
			setClientUser(res.data.user);
			setIsClientUserLoading(false);
			localStorage.setItem("user_id", res.data.user?.id);
			localStorage.setItem("username", res.data.user?.username);
			localStorage.setItem("auth_token", res.data.token);
		}).catch((error) => {
			if (error.status === 403) {
				setClientUser(null);
				setIsClientUserLoading(false);
				localStorage.removeItem("user_id");
				localStorage.removeItem("username");
				localStorage.removeItem("auth_token");
				if (window.location.pathname !== "/login") {
					navigate("/register");
				}
			}
		});
	}, [navigate]);
	
	return (
		<ClientUserContext.Provider value={{clientUser, setClientUser, isClientUserLoading}}>
			<Dialog open={!isClientUserLoading && !clientUser && location.pathname !== "/register" && location.pathname !== "/login"}>
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