import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {ColorModeProvider} from "src/theme/ColorMode.jsx";

createRoot(document.getElementById('root')).render(
	//<StrictMode>
	<ColorModeProvider>
		<App/>
	</ColorModeProvider>
	//</StrictMode>,
)
