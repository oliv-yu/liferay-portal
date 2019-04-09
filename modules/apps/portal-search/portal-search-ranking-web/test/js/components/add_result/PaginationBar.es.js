import React from 'react';
import PaginationBar from 'components/add_result/PaginationBar.es.js';
import {cleanup, render, fireEvent} from 'react-testing-library';
import 'jest-dom/extend-expect';

const DELTAS = [5, 10, 20, 40, 50];

describe(
	'PaginationBar',
	() => {
		afterEach(cleanup);

		it(
			'should have a dropdown for updating delta',
			() => {

				const {container} = render(
					<PaginationBar
						deltas={DELTAS}
						page={1}
						selectedDelta={DELTAS[0]}
						onDeltaChange={jest.fn()}
						onPageChange={jest.fn()}
						totalItems={250}
					/>
				);

				const dropdownItems = container.querySelectorAll('.pagination-items-per-page .dropdown-item');

				expect(dropdownItems.length).toEqual(5);

				expect(dropdownItems[0]).toHaveTextContent('5');
				expect(dropdownItems[1]).toHaveTextContent('10');
				expect(dropdownItems[2]).toHaveTextContent('20');
				expect(dropdownItems[3]).toHaveTextContent('40');
				expect(dropdownItems[4]).toHaveTextContent('50');
			}
		);

		it(
			'should have correct pagination with 100 items and delta 50',
			() => {

				const {queryByText} = render(
					<PaginationBar
						deltas={DELTAS}
						page={1}
						selectedDelta={DELTAS[4]}
						onDeltaChange={jest.fn()}
						onPageChange={jest.fn()}
						totalItems={100}
					/>
				);

				expect(queryByText('Showing 1 to 50 of 100 entries')).toBeDefined();

				expect(queryByText('2')).not.toBeNull();
				expect(queryByText('3')).toBeNull();
			}
		);

		it(
			'should have correct pagination with 105 items and delta 5',
			() => {

				const {queryByText} = render(
					<PaginationBar
						deltas={DELTAS}
						page={1}
						selectedDelta={DELTAS[0]}
						onDeltaChange={jest.fn()}
						onPageChange={jest.fn()}
						totalItems={105}
					/>
				);

				expect(queryByText('Showing 1 to 50 of 100 entries')).toBeDefined();

				expect(queryByText('21')).not.toBeNull();
				expect(queryByText('22')).toBeNull();
			}
		);

		it(
			'should be on the correct page',
			() => {

				const {queryByText} = render(
					<PaginationBar
						deltas={DELTAS}
						page={7}
						selectedDelta={DELTAS[0]}
						onDeltaChange={jest.fn()}
						onPageChange={jest.fn()}
						totalItems={100}
					/>
				);

				expect(queryByText('Showing 31 to 35 of 100 entries.')).not.toBeNull();
			}
		);

		it(
			'should call the onDeltaChange function when selecting delta',
			() => {
				const onDeltaChange = jest.fn();

				const {container} = render(
					<PaginationBar
						deltas={DELTAS}
						page={7}
						selectedDelta={DELTAS[0]}
						onDeltaChange={onDeltaChange}
						onPageChange={jest.fn()}
						totalItems={100}
					/>
				);

				const dropdownItem = container.querySelector('.pagination-items-per-page .dropdown-item');

				fireEvent.click(dropdownItem);

				expect(onDeltaChange.mock.calls.length).toBe(1);
			}
		);
	}
);