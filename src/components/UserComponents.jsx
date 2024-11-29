import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import {memo} from "react";
import Avatar from "@mui/material/Avatar";
import {Verified} from "@mui/icons-material";
import SvgIcon from "@mui/material/SvgIcon";
import {NavigateButtonBase, NavigateLink} from "src/components/NavigateComponents.jsx";

export const UserAvatar = memo(function UserAvatar({username, displayName, avatarVersion, width, height, ...props}) {
	return (
		<Avatar
			src={`/avatars/${username}.webp?v=${avatarVersion}`}
			alt={displayName}
			sx={{width: width, height: height}}
			{...props}
		/>
	);
});

UserAvatar.propTypes = {
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
	width: PropTypes.number,
	height: PropTypes.number,
}

export const supportedBadges = [
	{id: null, name: "隐藏徽章", info: "关闭徽章功能。", levelRequirement: 0},
	{id: "User0", name: "0级用户", info: "最普通的认证。0级后解锁。", levelRequirement: 0},
	{id: "User1", name: "1级用户", info: "高人一等。1级后解锁。", levelRequirement: 1},
	{id: "User2", name: "2级用户", info: "遥遥领先！2级后解锁。", levelRequirement: 2},
	{id: "User3", name: "3级用户", info: "我们继续领先！3级后解锁。", levelRequirement: 3},
	{id: "Transgender1", name: "蓝粉渐变1", info: "骄傲徽章！2级后解锁。", levelRequirement: 2},
	{id: "Transgender2", name: "蓝粉渐变2", info: "骄傲徽章！2级后解锁。", levelRequirement: 2},
	{id: "Rainbow", name: "彩虹", info: "骄傲徽章！2级后解锁。", levelRequirement: 2},
	{id: "Official", name: "官方认证", info: "属于官方账号的最权威认证。普通用户无法解锁。", levelRequirement: 4},
];

export const UserBadge = memo(function UserBadge({badge, fontSize}) {
	if (!badge) {
		return null;
	} else if (badge === "Official") {
		return <Verified color="secondary" sx={{fontSize: fontSize}}/>;
	} else if (badge === "User0") {
		return <Verified sx={{color: theme => theme.palette.text.disabled, fontSize: fontSize}}/>;
	} else if (badge === "User1") {
		return <Verified color="info" sx={{fontSize: fontSize}}/>;
	} else if (badge === "User2") {
		return <Verified color="warning" sx={{fontSize: fontSize}}/>;
	} else if (badge === "User3") {
		return <Verified color="error" sx={{fontSize: fontSize}}/>;
	} else if (badge === "Transgender1") {
		const uuid = crypto.randomUUID().toString();
		return (
			<SvgIcon sx={{fontSize: fontSize}}>
				<defs>
					<linearGradient id={`transgender-1-gradient-${uuid}`} x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="25%" style={{stopColor: '#f5a9b8', stopOpacity: 1}}/>
						<stop offset="100%" style={{stopColor: '#5bcefa', stopOpacity: 1}}/>
					</linearGradient>
				</defs>
				<Verified sx={{fill: `url(#transgender-1-gradient-${uuid})`}}/>
			</SvgIcon>
		);
	} else if (badge === "Transgender2") {
		const uuid = crypto.randomUUID().toString();
		return (
			<SvgIcon sx={{fontSize: fontSize}}>
				<defs>
					<linearGradient id={`transgender-2-gradient-${uuid}`} x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style={{stopColor: '#5bcefa', stopOpacity: 1}}/>
						<stop offset="75%" style={{stopColor: '#f5a9b8', stopOpacity: 1}}/>
					</linearGradient>
				</defs>
				<Verified sx={{fill: `url(#transgender-2-gradient-${uuid})`}}/>
			</SvgIcon>
		);
	} else if (badge === "Rainbow") {
		const uuid = crypto.randomUUID().toString();
		return (
			<SvgIcon sx={{fontSize: fontSize}}>
				<defs>
					<linearGradient id={`rainbow-gradient-${uuid}`} x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" style={{stopColor: "#FF0018"}}/>
						<stop offset="16.7%" style={{stopColor: "#FFA52C"}}/>
						<stop offset="33.4%" style={{stopColor: "#FFFF41"}}/>
						<stop offset="50.1%" style={{stopColor: "#008018"}}/>
						<stop offset="66.8%" style={{stopColor: "#0000F9"}}/>
						<stop offset="83.5%" style={{stopColor: "#86007D"}}/>
					</linearGradient>
				</defs>
				<Verified sx={{fill: `url(#rainbow-gradient-${uuid})`}}/>
			</SvgIcon>
		)
	}
	
	return null;
});

UserBadge.propTypes = {
	badge: PropTypes.string,
	fontSize: PropTypes.number,
}

export const UsernameWithBadge = memo(function UsernameWithBadge({username, badge, fontWeight = "bold", fontSize, size = 18}) {
	return (
		<Grid container alignItems="center" flexWrap="nowrap" gap={0.25}>
			<Typography fontWeight={fontWeight} fontSize={fontSize} noWrap overflow="hidden" textOverflow="ellipsis" alignItems="center">
				{username}
			</Typography>
			<UserBadge badge={badge} fontSize={size}/>
		</Grid>
	);
});

UsernameWithBadge.propTypes = {
	username: PropTypes.node,
	badge: PropTypes.string,
	fontWeight: PropTypes.string,
	fontSize: PropTypes.number,
	size: PropTypes.number,
}

export const SimpleUserItem = memo(function SimpleUserItem({username, displayName, avatarVersion, badge, disableNavigate = false, ...props}) {
	if (disableNavigate) {
		return (
			<Grid container wrap="nowrap" alignItems="center" gap={1} height="100%" {...props}>
				<UserAvatar username={username} displayName={displayName} avatarVersion={avatarVersion}/>
				<Grid container alignItems="center" gap={0.25} wrap="nowrap">
					<Typography
						fontWeight="bold"
						maxWidth={150}
						noWrap
						overflow="hidden"
						textOverflow="ellipsis"
						sx={{cursor: "pointer"}}
					>
						{displayName}
					</Typography>
					<UserBadge badge={badge} fontSize={18}/>
				</Grid>
			</Grid>
		);
	}
	
	return (
		<Grid container wrap="nowrap" alignItems="center" gap={1} height="100%" {...props}>
			<NavigateButtonBase
				sx={{borderRadius: "50%"}}
				href={disableNavigate ? undefined : `/user/${username}`}
			>
				<UserAvatar username={username} displayName={displayName} avatarVersion={avatarVersion}/>
			</NavigateButtonBase>
			<Grid container alignItems="center" gap={0.25} wrap="nowrap">
				<NavigateLink href={disableNavigate ? undefined : `/user/${username}`}>
					<Typography
						fontWeight="bold"
						maxWidth={150}
						noWrap
						overflow="hidden"
						textOverflow="ellipsis"
						sx={{cursor: "pointer"}}
					>
						{displayName}
					</Typography>
				</NavigateLink>
				<UserBadge badge={badge} fontSize={18}/>
			</Grid>
		</Grid>
	);
});

SimpleUserItem.propTypes = {
	username: PropTypes.string.isRequired,
	displayName: PropTypes.string,
	avatarVersion: PropTypes.number.isRequired,
	badge: PropTypes.string,
	disableNavigate: PropTypes.bool,
}