import React from 'react';
import ReactDOM from 'react-dom';
import ResultsRankingForm from './components/ResultsRankingForm';
import ThemeContext from './ThemeContext';

export default function(id, props, context) {
	ReactDOM.render(
		<ThemeContext.Provider value={context}>
			<div className='results-rankings-root'>
				<ResultsRankingForm {...props} />
			</div>
		</ThemeContext.Provider>,
		document.getElementById(id)
	);
}
