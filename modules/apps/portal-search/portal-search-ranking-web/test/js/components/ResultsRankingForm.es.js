import React from 'react';
import ResultsRankingForm from 'components/ResultsRankingForm.es';
import {cleanup, render, waitForElement} from 'react-testing-library';
import 'jest-dom/extend-expect';
import '@babel/polyfill';

jest.mock('utils/api.es');

describe(
	'ResultsRankingForm',
	() => {
		afterEach(cleanup);

		it(
			'should render the results ranking form',
			() => {

				const {asFragment} = render(
					<ResultsRankingForm
						cancelUrl={'cancel'}
						fetchDocumentsHiddenUrl=""
						fetchDocumentsUrl=""
						searchTerm={'example'}
					/>
				);

				expect(asFragment()).toMatchSnapshot();
			}
		);

		it(
			'should render the results ranking form after loading',
			async() => {

				const {asFragment, getByTestId} = render(
					<ResultsRankingForm
						cancelUrl={'cancel'}
						fetchDocumentsHiddenUrl=""
						fetchDocumentsUrl=""
						searchTerm={''}
					/>
				);

				await waitForElement(() => getByTestId('results-list-group'));

				expect(asFragment()).toMatchSnapshot();
			}
		);
	}
);