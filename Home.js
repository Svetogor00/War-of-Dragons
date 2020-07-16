import React from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';

import './Home.css';

const Home = ({ id, snackbarError, fetchedState }) => {

	return (
		<Panel id={id}>
			{fetchedState && {snackbarError} }
		</Panel>
	);
};

export default Home;
