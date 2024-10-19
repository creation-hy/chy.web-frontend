import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {ColorModeProvider} from "src/components/ColorMode.jsx";

createRoot(document.getElementById('root')).render(
	//<StrictMode>
	<ColorModeProvider>
		<App/>
	</ColorModeProvider>
	//</StrictMode>,
)
