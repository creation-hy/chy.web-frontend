import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {Alert} from "@mui/material";

export default function AIDrawResult() {
	document.title = "查看结果 - AI绘图 - chy.web";
	
	const {data, isLoading, error} = useQuery({
		queryKey: ["ai-draw-result"],
		queryFn: () => axios.get("/api/ai-draw/result").then(res => res.data),
	});
	
	if (isLoading || error)
		return null;
	
	if (data["status"] !== 1)
		return <Alert severity="error">{data["content"]}</Alert>;
	
	return data["result"].map((item, index) => (
		<img key={index} alt="generate pictures" src={"data:image/jpeg;base64," + item}/>
	));
}