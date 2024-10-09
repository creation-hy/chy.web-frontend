import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Start() {
	document.title = "首页 - chy.web";
	
	return (
		<Box>
			<Typography variant="h3">私聊</Typography>
			<Typography fontSize={16}>
				点击加号添加联系人，蓝点表示用户在线，红点表示有新消息。最新版本已实现基于WebSocket的实时通讯。<br/>
				原聊天室已搬到私聊-公共，AI回答功能请直接跟SystemAI对话，智能体功能请和neko对话。（这两个AI只有显示在线的时候会回复你的消息）<br/>
				neko支持的重置命令：<br/>
				/sudo reset [model] [neko] [memorytype]<br/>
				{`[model]：选择模型，"llama3"或"qwen2.5"`}<br/>
				{`[neko]：是否使用训练好的猫娘记忆文件，"-neko"或""`}<br/>
				{`[memorytype]：记忆类型，"-Buffer"或"-BufferWindow"或"-SummaryBuffer"或"-Summary"或"-TokenBuffer"`}<br/>
				如果三项都不填则会重置为默认猫娘。<br/>
				示例：/sudo reset llama3 -neko -Buffer
			</Typography><br/>
			<Typography variant="h3">扫雷</Typography>
			<Typography fontSize={16}>行数最少为10，雷数合法范围为格子数量（即行数*行数）的20%到98%，不合法的输入会按情况被改为最小值/最大值。</Typography><br/>
			<Typography variant="h3">贪吃蛇</Typography>
			<Typography fontSize={16}>
				道具介绍：<br/>
				薯条：长度+1；绿色药水：长度-1；炸弹：失败；加号：倒计时加十秒钟；减号：倒计时减十秒钟。
			</Typography><br/>
			<Typography variant="h3">关于</Typography>
			<Typography fontSize={16}>
				当前版本：V4.4 (Beta)<br/>
				前后端已分离！后端采用Spring Boot + Spring MVC + JPA，前端采用React.js + Material UI，生产环境为Nginx，开发环境为Node.js + Vite。<br/>
			</Typography>
		</Box>
	);
}