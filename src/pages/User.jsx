import {AppAppBar, AppBarInit} from "src/components/AppAppBar.jsx";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import getCustomTheme from "src/theme/getCustomTheme.jsx";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Footer from "src/components/Footer.jsx";
import {useParams} from "react-router";
import React, {useEffect} from "react";
import Container from "@mui/material/Container";
import getDefaultTheme from "src/theme/getDefaultTheme.jsx";
import {Tab, Tabs} from "@mui/material";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Cookies from "js-cookie";
import {enqueueSnackbar, SnackbarProvider} from "notistack";
import PropTypes from "prop-types";
import {QueryClient, QueryClientProvider, useQuery} from "@tanstack/react-query";

function a11yProps(index) {
	return {
		id: `simple-tab-${index}`,
	};
}

function InfoContainer({value, username}) {
	const opt = value === 0 ? "info" : (value === 1 ? "chat" : (value === 2 ? "following" : "follower"));
	
	const {data, isLoading, error} = useQuery({
		queryKey: [opt],
		queryFn: () => axios.get("/api/user/" + username + "/" + opt).then(res => res.data),
	});
	
	if (error || isLoading)
		return null;
	
	if (value === 0)
		return (
			<Box>
				用户编号：{data["user_id"]}<br/>
				性别：{data["sex"]}<br/>
				注册时间：{data["reg_time"]}
			</Box>
		);
	
	if (value === 1)
		return (
			<Box>
				{data["html"]}
			</Box>
		);
	
	return (
		<Grid container direction="column" spacing={3}>
			{data["result"].map((item, index) => (
				<Grid container key={index} spacing={2}>
					<Avatar src={"/usericon/" + item["username"] + ".png"} alt={item["username"]}/>
					<Typography variant="h5" sx={{cursor: "pointer"}} onClick={() => {
						window.location.href = item["username"];
					}}>{item["username"]}</Typography>
				</Grid>
			))}
		</Grid>
	);
}

InfoContainer.propTypes = {
	value: PropTypes.number.isRequired,
	username: PropTypes.string.isRequired,
}

export default function User() {
	const {username} = useParams();
	
	document.title = username + "的主页 - chy.web";
	
	const [mode, toggleColorMode] = AppBarInit();
	const [value, setValue] = React.useState(0);
	
	const handleChange = (event, newValue) => {
		setValue(newValue);
	};
	
	useEffect(() => {
		axios.get("/api/user/" + username + "/info").then(res => {
			document.getElementById("intro").innerHTML = res.data["intro"];
			document.getElementById("tab-following").innerHTML += "(" + res.data["following_count"] + ")";
			document.getElementById("tab-follower").innerHTML += "(" + res.data["follower_count"] + ")";
			document.getElementById("do-follow").innerHTML = res.data["already_following"] ? "取关" : "关注";
		});
		if (username === Cookies.get("username"))
			document.getElementById("logout").style.display = "flex";
	}, [username]);
	
	const doFollow = () => {
		axios.get("/api/user/" + username + "/follow").then(res => {
			enqueueSnackbar(res.data["content"], {variant: res.data["status"] === 0 ? "error" : "success"});
			if (res.data["status"] === 1)
				document.getElementById("do-follow").innerHTML = "取关";
			else if (res.data["status"] === 2)
				document.getElementById("do-follow").innerHTML = "关注";
		})
	};
	
	const logOut = () => {
		Cookies.remove("username");
		Cookies.remove("user_token");
		window.location.href = "/";
	}
	
	return (
		<ThemeProvider theme={createTheme(getCustomTheme(mode))}>
			<SnackbarProvider/>
			<QueryClientProvider client={new QueryClient()}>
				<CssBaseline enableColorScheme/>
				<AppAppBar mode={mode} toggleColorMode={toggleColorMode}/>
				<Container
					maxWidth="lg"
					component="main"
					sx={{display: 'flex', flexDirection: 'column', mt: 13, gap: 1}}
				>
					<Card>
						<CardContent>
							<Avatar src={"/usericon/" + username + ".png"} sx={{mb: 0.5}} alt={username}/>
							<Grid container spacing={1}>
								<Typography gutterBottom variant="h5">
									{username}
								</Typography>
								<Button variant="contained" sx={{height: 30}} id="do-follow" onClick={doFollow}></Button>
								<Button variant="contained" sx={{height: 30, display: "none"}} id="logout" onClick={logOut}>登出</Button>
							</Grid>
							<Typography variant="body2" sx={{color: 'text.secondary'}} id="intro"/>
						</CardContent>
					</Card>
					<ThemeProvider theme={createTheme(getDefaultTheme(mode))}>
						<Box sx={{borderBottom: 1, borderColor: 'divider', mb: 2}}>
							<Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
								<Tab label="信息" {...a11yProps(0)} data-option="info"/>
								<Tab label="动态" {...a11yProps(1)} data-option="chat"/>
								<Tab label="关注" {...a11yProps(2)} data-option="following" id="tab-following"/>
								<Tab label="粉丝" {...a11yProps(3)} data-option="follower" id="tab-follower"/>
							</Tabs>
						</Box>
						<InfoContainer value={value} username={username}/>
					</ThemeProvider>
				</Container>
				<Footer/>
			</QueryClientProvider>
		</ThemeProvider>
	);
}