import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Blog from "src/pages/Blog.jsx";
import Start from "src/pages/Start.jsx";
import SignIn from "src/pages/sign-in/SignIn.jsx";
import SignUp from "src/pages/sign-up/SignUp.jsx";
import Chat from "src/pages/Chat.jsx";
import User from "src/pages/User.jsx";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Start/>}/>
				<Route path="/blog" element={<Blog/>}/>
				<Route path="/login" element={<SignIn/>}/>
				<Route path="/register" element={<SignUp/>}/>
				<Route path="/user/:username" element={<User/>}/>
				<Route path="/chat" element={<Chat/>}/>
			</Routes>
		</BrowserRouter>
	);
}