import React from 'react';
import List from 'components/list/index.es';
import {cleanup, render, fireEvent} from 'react-testing-library';
import 'jest-dom/extend-expect';

const DATA_MAP = {
	102: {
		author: 'Juan Hidalgo',
		clicks: 289,
		date: 'Apr 18 2018, 11:04 AM',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
		hidden: false,
		id: 102,
		pinned: false,
		title: 'This is a Web Content Example with Long Title',
		type: 'Web Content'
	},
	103: {
		author: 'Juan Hidalgo',
		clicks: 8,
		date: 'Apr 18 2018, 11:04 AM',
		hidden: false,
		extension: 'png',
		id: 103,
		pinned: false,
		title: 'This is an Image Example',
		type: 'Document'
	},
	104: {
		author: 'Juan Hidalgo',
		clicks: 89,
		date: 'Apr 18 2018, 11:04 AM',
		extension: 'png',
		hidden: false,
		id: 104,
		pinned: false,
		title: 'This is a Document Example',
		type: 'Document'
	}
};

describe(
	'List',
	() => {
		afterEach(cleanup);

		it(
			'should list out results in order with expected titles',
			() => {

				const {container} = render(
					<List
						dataLoading={false}
						dataMap={DATA_MAP}
						onClickHide={jest.fn()}
						onLoadResults={jest.fn()}
						onSearchBarEnter={jest.fn()}
						onUpdateSearchBarTerm={jest.fn()}
						resultIds={[102, 104, 103]}
						searchBarTerm={''}
						selected={[104]}
						totalResultsCount={300}
					/>
				);

				const listItems = container.querySelectorAll('.text-truncate-inline');

				expect(listItems[0]).toHaveTextContent('This is a Web Content Example with Long Title');
				expect(listItems[1]).toHaveTextContent('This is a Document Example');
				expect(listItems[2]).toHaveTextContent('This is an Image Example');
			}
		);

		it(
			'should have no loading icon',
			() => {

				const {container} = render(
					<List
						dataLoading={false}
						dataMap={DATA_MAP}
						onClickHide={jest.fn()}
						onLoadResults={jest.fn()}
						onSearchBarEnter={jest.fn()}
						onUpdateSearchBarTerm={jest.fn()}
						resultIds={[]}
						searchBarTerm={''}
						selected={[104]}
						totalResultsCount={300}
					/>
				);

				expect(container.querySelector('.loading-animation')).toBeNull();
				expect(container.querySelector('.load-more-button')).not.toBeNull();
			}
		);

		it(
			'should have a loading icon',
			() => {
				const {container} = render(
					<List
						dataLoading={true}
						dataMap={DATA_MAP}
						onClickHide={jest.fn()}
						onLoadResults={jest.fn()}
						onSearchBarEnter={jest.fn()}
						onUpdateSearchBarTerm={jest.fn()}
						resultIds={[]}
						searchBarTerm={''}
						selected={[104]}
						totalResultsCount={300}
					/>
				);

				expect(container.querySelector('.loading-animation')).not.toBeNull();
				expect(container.querySelector('.load-more-button')).toBeNull();
			}
		);

		it(
			'should call the onLoadResults function when the loading button is clicked',
			() => {
				const mockLoad = jest.fn();

				const {container} = render(
					<List
						dataLoading={false}
						dataMap={DATA_MAP}
						onClickHide={jest.fn()}
						onLoadResults={mockLoad}
						onSearchBarEnter={jest.fn()}
						onUpdateSearchBarTerm={jest.fn()}
						resultIds={[102, 104, 103]}
						searchBarTerm={''}
						selected={[104]}
						totalResultsCount={300}
					/>
				);

				const loadButton = container.querySelector('.load-more-button');

				fireEvent.click(loadButton);

				expect(mockLoad).toHaveBeenCalledTimes(1);
			}
		);
	}
);