import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Badge} from "@mui/material";

export default function Start() {
	document.title = "首页 - chy.web";
	
	return (
		<Box>
			<Typography variant="h3" align="center" fontWeight="bold" mt={2}>
				<Badge badgeContent="Beta" color="primary">
					chy.web 5.0
				</Badge>
			</Typography>
			<Typography variant="h4" align="center">全新升级</Typography>
			<Typography variant="h6" align="center" mb={4}>前端重写，采用SpringBoot + React</Typography>
			<Typography variant="h4">私聊</Typography>
			<Typography>
				AI回答功能请直接跟用户名为【AI】的用户对话，智能体功能请和【neko】对话。前者不支持记忆，后者支持。<br/>
				5.0.1版本以后，即使AI不在线，你的对话内容也会被回复。<br/>
				neko支持的重置命令：<br/>
				/sudo reset [model] [neko] [memoryType]<br/>
				{`[model]：选择模型，"llama3"或"qwen2.5"`}<br/>
				{`[neko]：是否使用训练好的猫娘记忆文件，"-neko"或""`}<br/>
				{`[memoryType]：记忆类型，"-Buffer"或"-BufferWindow"或"-SummaryBuffer"或"-Summary"或"-TokenBuffer"`}<br/>
				如果三项都不填则会重置为默认猫娘。<br/>
				示例：/sudo reset llama3 -neko -Buffer
			</Typography><br/>
			<Typography variant="h4">扫雷</Typography>
			<Typography>行数最少为10，雷数合法范围为格子数量（即行数*行数）的20%到98%，不合法的输入会按情况被改为最小值/最大值。</Typography><br/>
			<Typography variant="h4">贪吃蛇</Typography>
			<Typography>
				道具介绍：<br/>
				薯条：长度+1；绿色药水：长度-1；炸弹：失败；加号：倒计时加十秒钟；减号：倒计时减十秒钟。
			</Typography><br/>
		</Box>
	);
}