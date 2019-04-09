import React from 'react';
import AddResult from 'components/add_result/index.es';
import {cleanup, fireEvent, render} from 'react-testing-library';
import 'jest-dom/extend-expect';

const MODAL_ID = 'add-result-modal';
const MODAL_ENTER_ID = 'add-result-enter-modal';

describe(
	'AddResult',
	() => {
		afterEach(cleanup);

		it(
			'should show a modal when the add a result button gets clicked',
			() => {

				const {getByText, queryByTestId} = render(
					<AddResult
						onAddResultSubmit={jest.fn()}
					/>
				);

				fireEvent.click(getByText('Add a Result'));

				expect(queryByTestId(MODAL_ID)).not.toBeNull();
			}
		);

		it(
			'should close the modal when the cancel button gets clicked',
			() => {

				const {getByText, queryByTestId} = render(
					<AddResult
						onAddResultSubmit={jest.fn()}
					/>
				);

				fireEvent.click(getByText('Add a Result'));

				fireEvent.click(getByText('Cancel', {exact: false}));

				expect(queryByTestId(MODAL_ID)).toBeNull();
			}
		);

		it(
			'should prompt a message to search in the modal',
			() => {

				const {getByText, queryByTestId} = render(
					<AddResult
						onAddResultSubmit={jest.fn()}
					/>
				);

				fireEvent.click(getByText('Add a Result'));

				const modal = queryByTestId(MODAL_ID);

				expect(modal.querySelector('.empty-state-title')).toHaveTextContent('Search your engine');
				expect(modal.querySelector('.empty-state-description')).toHaveTextContent('Search your engine to display results.');
			}
		);
	}
);