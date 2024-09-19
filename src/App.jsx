import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Blog from "src/pages/Blog.jsx";
import Start from "src/pages/Start.jsx";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Start/>}/>
				<Route path="/blog" element={<Blog/>}/>
			</Routes>
		</BrowserRouter>
	);
}