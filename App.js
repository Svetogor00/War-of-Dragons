import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Intro from './panels/Intro';

const ROUTES = {
	HOME: 'home',
	INTRO: 'intro',
};

const STORAGE_KEYS = {
	STATE: 'state',
	STATUS: 'viewStatus',
};

const App = () => {
	const [activePanel, setActivePanel] = useState('home');
	const [fetchedUser, setUser] = useState(null);
	const [fetchedState, setFetchedState] = useState(null);
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
	const [userHasSeenIntro, setUserHasSeenIntro] = useState(false);;

	useEffect(() => {
		bridge.subscribe(({detail: {type, data}}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		});

		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');
			const sheetState = await bridge.send('VKWebAppStorageGet', {keys: [STORAGE_KEYS.STATE, STORAGE_KEYS.STATUS]});
			if (Array.isArray(sheetState.keys)) {
				const data = {};
				sheetState.keys.forEach(({key, value}) => {
					data[key] = value ? JSON.parse(value) : {};
					switch (key) {
						case STORAGE_KEYS.STATE:
							setFetchedState(data[STORAGE_KEYS.STATE]);
							break;
						case STORAGE_KEYS.STATUS:
							if (data[key] && data[key].hasSeenIntro) {
								setActivePanel(ROUTES.HOME);
								setUserHasSeenIntro(true);
							}
							break;
						default:
							break;
					}
					setFetchedState({});
				});

			} else {
				setFetchedState({});
            }
			setUser(user);
			setPopout(null);
        }
        fetchData();
    }, []);

    const viewIntro = async (panel) => {

			await bridge.send('VKWebAppStorageSet', {
				key: STORAGE_KEYS.STATUS,
				value: JSON.stringify({
					hasSeenIntro: true,
				}),
			});

	}

	return (
		<View activePanel={activePanel} popout={popout}>
			<Home id={ROUTES.HOME} fetchedState={fetchedState}  />
			<Intro id={ROUTES.INTRO} fetchedUser={fetchedUser} go={viewIntro} route={ROUTES.HOME} userHasSeenIntro={userHasSeenIntro} />
		</View>
	);
}

export default App;
